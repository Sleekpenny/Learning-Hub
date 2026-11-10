import { randomUUID } from 'node:crypto';
import { AppError } from '../../src/lib/errors';
import type {
  AuthRepository,
  CreateRefreshTokenData,
  CreateUserData,
} from '../../src/modules/auth/auth.repository';
import type { RefreshTokenRecord, UserRecord } from '../../src/modules/auth/auth.types';

/** A fake database held in arrays. Lets the whole API be tested without Postgres. */
export class InMemoryAuthRepository implements AuthRepository {
  users: UserRecord[] = [];
  refreshTokens: RefreshTokenRecord[] = [];

  async findUserByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findUserById(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async createUser(data: CreateUserData) {
    // Mirrors the database's unique constraint on email.
    if (this.users.some((u) => u.email === data.email)) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
    }
    const user: UserRecord = {
      id: randomUUID(),
      createdAt: new Date(),
      country: null,
      areaOfInterest: null,
      ...data,
    };
    this.users.push(user);
    return user;
  }

  async createRefreshToken(data: CreateRefreshTokenData) {
    const record: RefreshTokenRecord = { id: randomUUID(), revokedAt: null, ...data };
    this.refreshTokens.push(record);
    return record;
  }

  async findRefreshTokenByHash(tokenHash: string) {
    return this.refreshTokens.find((t) => t.tokenHash === tokenHash) ?? null;
  }

  async revokeRefreshToken(id: string) {
    const token = this.refreshTokens.find((t) => t.id === id);
    if (token) token.revokedAt = new Date();
  }

  async revokeTokenFamily(familyId: string) {
    for (const token of this.refreshTokens) {
      if (token.familyId === familyId && !token.revokedAt) token.revokedAt = new Date();
    }
  }
}