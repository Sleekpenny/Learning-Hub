export type Role = 'LEARNER' | 'ADMIN';

/** A user row as stored in the database (includes the password hash). Never send this to clients. */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  country: string | null;
  areaOfInterest: string | null;
  createdAt: Date;
}

/** The safe-to-expose version of a user. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  country: string | null;
  areaOfInterest: string | null;
  createdAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  tokenHash: string;
  familyId: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface Session {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    country: user.country,
    areaOfInterest: user.areaOfInterest,
    createdAt: user.createdAt,
  };
}