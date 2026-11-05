import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role } from '../modules/auth/auth.types';

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
}

/** Short-lived JWT that proves "who you are" on every request. */
export function signAccessToken(
  payload: AccessTokenPayload,
  secret: string,
  ttlSeconds: number,
): string {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: ttlSeconds });
}

/** Throws jsonwebtoken's TokenExpiredError / JsonWebTokenError when the token is not valid. */
export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || !decoded['role']) {
    throw new jwt.JsonWebTokenError('Malformed token payload');
  }
  return { sub: decoded.sub, role: decoded['role'] as Role };
}

/** Long random string given to the browser. Unguessable: 48 random bytes. */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

/**
 * Refresh tokens are stored hashed. If the database leaks, the attacker gets hashes
 * that cannot be used as cookies. SHA-256 is fine here because the token is high-entropy
 * (unlike passwords, which need a slow hash such as bcrypt).
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
