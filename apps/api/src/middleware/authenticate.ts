import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Env } from '../config/env';
import { AppError } from '../lib/errors';
import { verifyAccessToken } from '../lib/tokens';
import { ACCESS_COOKIE } from '../modules/auth/auth.cookies';
import type { Role } from '../modules/auth/auth.types';

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by `authenticate`. Undefined on public routes. */
      user?: AuthUser;
    }
  }
}

function extractToken(cookies: Record<string, string> | undefined, header?: string): string | null {
  const fromCookie = cookies?.[ACCESS_COOKIE];
  if (fromCookie) return fromCookie;
  // Fallback for API clients (Postman, curl): "Authorization: Bearer <token>"
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length).trim();
  return null;
}

/**
 * Guards a route: rejects the request with 401 unless it carries a valid access token.
 * An expired token gets its own code (TOKEN_EXPIRED) so the frontend knows to call /auth/refresh
 * and retry, instead of sending the user to the login page.
 */
export function authenticate(env: Pick<Env, 'JWT_ACCESS_SECRET'>): RequestHandler {
  return (req, _res, next) => {
    const token = extractToken(req.cookies, req.headers.authorization);
    if (!token) return next(AppError.unauthorized());

    try {
      const payload = verifyAccessToken(token, env.JWT_ACCESS_SECRET);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(AppError.unauthorized('Access token expired', 'TOKEN_EXPIRED'));
      }
      next(AppError.unauthorized('Invalid access token', 'INVALID_TOKEN'));
    }
  };
}
