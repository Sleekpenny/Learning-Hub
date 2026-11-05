import type { RequestHandler } from 'express';
import { AppError } from '../lib/errors';
import type { Role } from '../modules/auth/auth.types';

/**
 * Authorization (what you are ALLOWED to do), as opposed to authentication (who you ARE).
 * Always place it AFTER `authenticate`:  router.post('/', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowed.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };
}
