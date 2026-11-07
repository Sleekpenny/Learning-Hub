import { randomUUID } from 'node:crypto';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { generateRefreshToken, hashToken, signAccessToken } from '../../lib/tokens';
import type { AuthRepository } from './auth.repository';
import type { LoginInput, LoginPortal, SignupInput } from './auth.schemas';
import { toPublicUser, type PublicUser, type Session, type UserRecord } from './auth.types';

type AuthConfig = Pick<
  Env,
  'JWT_ACCESS_SECRET' | 'ACCESS_TOKEN_TTL_MINUTES' | 'REFRESH_TOKEN_TTL_DAYS' | 'BCRYPT_ROUNDS'
>;

const INVALID_CREDENTIALS = 'Invalid email or password';

/**
 * All authentication business rules live here. No Express, no Prisma:
 * the service takes plain inputs, talks to a repository interface, and returns plain data.
 */
export class AuthService {
  /** Used to burn the same CPU time when an email does not exist (see login). */
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly repo: AuthRepository,
    private readonly config: AuthConfig,
  ) {}

  async signup(input: SignupInput): Promise<Session> {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
    }

    const user = await this.repo.createUser({
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password, this.config.BCRYPT_ROUNDS),
      // Public signup ALWAYS creates a learner. Admins are created by the seed script only.
      role: 'LEARNER',
      country: input.country,
      areaOfInterest: input.areaOfInterest,
    });

    return this.issueSession(user, randomUUID());
  }

  async login(input: LoginInput, portal: LoginPortal = 'learner'): Promise<Session> {
    const user = await this.repo.findUserByEmail(input.email);

    if (!user) {
      // Compare against a dummy hash so "unknown email" takes as long as "wrong password".
      // Otherwise response time reveals which emails are registered.
      await verifyPassword(input.password, await this.getDummyHash());
      throw AppError.unauthorized(INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized(INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    // The password is correct, so it is safe to tell this person which form to use.
    // Doing the check before this point would let a stranger find out which emails are admins.
    // No session is created when the form does not match the role.
    if (portal === 'admin' && user.role !== 'ADMIN') {
      throw AppError.forbidden('This account does not have admin access', 'NOT_ADMIN');
    }
    if (portal === 'learner' && user.role === 'ADMIN') {
      throw AppError.forbidden('Admin accounts sign in from the Admin tab', 'USE_ADMIN_LOGIN');
    }

    return this.issueSession(user, randomUUID());
  }

  /**
   * Refresh-token rotation:
   *  - every refresh token is single-use; using it issues a brand new one
   *  - if an ALREADY-USED token shows up again, someone copied it, so the whole chain is revoked
   */
  async refresh(rawRefreshToken: string | undefined): Promise<Session> {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    const stored = await this.repo.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (!stored) {
      throw AppError.unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    if (stored.revokedAt) {
      await this.repo.revokeTokenFamily(stored.familyId);
      throw AppError.unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    const user = await this.repo.findUserById(stored.userId);
    if (!user) {
      throw AppError.unauthorized('Session expired', 'SESSION_EXPIRED');
    }

    await this.repo.revokeRefreshToken(stored.id);
    return this.issueSession(user, stored.familyId);
  }

  /** Idempotent: logging out twice, or with no cookie, is not an error. */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const stored = await this.repo.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (stored) {
      await this.repo.revokeTokenFamily(stored.familyId);
    }
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw AppError.unauthorized('Account no longer exists');
    return toPublicUser(user);
  }

  private async issueSession(user: UserRecord, familyId: string): Promise<Session> {
    const accessToken = signAccessToken(
      { sub: user.id, role: user.role },
      this.config.JWT_ACCESS_SECRET,
      this.config.ACCESS_TOKEN_TTL_MINUTES * 60,
    );

    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = new Date(
      Date.now() + this.config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.repo.createRefreshToken({
      tokenHash: hashToken(refreshToken),
      familyId,
      userId: user.id,
      expiresAt: refreshExpiresAt,
    });

    return { user: toPublicUser(user), accessToken, refreshToken, refreshExpiresAt };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= hashPassword('dummy-password-for-timing', this.config.BCRYPT_ROUNDS);
    return this.dummyHash;
  }
}