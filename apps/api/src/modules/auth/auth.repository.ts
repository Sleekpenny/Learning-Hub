import type { RefreshTokenRecord, Role, UserRecord } from './auth.types';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  country?: string;
  areaOfInterest?: string;
}

export interface CreateRefreshTokenData {
  tokenHash: string;
  familyId: string;
  userId: string;
  expiresAt: Date;
}

/**
 * The data-access contract for authentication.
 * The service only knows this interface, so tests can swap in an in-memory
 * implementation and production uses Prisma. That is the "separation of concerns" in action.
 */
export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  /** Must throw AppError.conflict(code 'EMAIL_TAKEN') when the email already exists. */
  createUser(data: CreateUserData): Promise<UserRecord>;

  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(id: string): Promise<void>;
  /** Revokes every still-active token in a rotation chain. */
  revokeTokenFamily(familyId: string): Promise<void>;
}