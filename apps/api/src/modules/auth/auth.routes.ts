import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Env } from '../../config/env';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { AuthController } from './auth.controller';
import { loginSchema, signupSchema } from './auth.schemas';
import type { AuthService } from './auth.service';

interface AuthRouterOptions {
  service: AuthService;
  env: Env;
  /** Turn off in tests so they do not trip the limiter. */
  enableRateLimit: boolean;
}

export function createAuthRouter({ service, env, enableRateLimit }: AuthRouterOptions): Router {
  const router = Router();
  const controller = new AuthController(service, env);

  // Slows down password guessing. 20 attempts per 15 minutes per IP on the sensitive routes.
  // Note: the counter lives in memory, so on serverless it is per instance (see docs/AUTH.md).
  const credentialsLimiter = enableRateLimit
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: {
          error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
        },
      })
    : (_req: unknown, _res: unknown, next: () => void) => next();

  router.post('/signup', credentialsLimiter, validate({ body: signupSchema }), controller.signup);
  router.post('/login', credentialsLimiter, validate({ body: loginSchema }), controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.get('/me', authenticate(env), controller.me);

  return router;
}
