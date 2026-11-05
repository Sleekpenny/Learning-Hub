import { Prisma, type PrismaClient } from '@prisma/client';
import { AppError } from '../../lib/errors';
import type {
  AuthRepository,
  CreateRefreshTokenData,
  CreateUserData,
} from './auth.repository';
import type { RefreshTokenRecord, UserRecord } from './auth.types';

/** The production implementation of AuthRepository, backed by Postgres through Prisma. */
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly db: PrismaClient) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async createUser(data: CreateUserData): Promise<UserRecord> {
    try {
      return await this.db.user.create({ data });
    } catch (error) {
      // P2002 = unique constraint violation. Two signups racing for the same email land here.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
      }
      throw error;
    }
  }

  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenRecord> {
    return this.db.refreshToken.create({ data });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.db.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.db.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeTokenFamily(familyId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
