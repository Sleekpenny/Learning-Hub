import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Env } from './config/env';
import { createDocsRouter } from './docs/docs.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import type { AuthRepository } from './modules/auth/auth.repository';
import { createAuthRouter } from './modules/auth/auth.routes';
import { AuthService } from './modules/auth/auth.service';
import { createCourseRoutes } from './modules/courses/courses.routes';
import { createLessonRoutes } from './modules/lessons/lessons.routes';

export interface AppDependencies {
  env: Env;
  authRepository: AuthRepository;
  /** Defaults to true. Tests pass false. */
  enableRateLimit?: boolean;
}

/**
 * Builds the Express app from its dependencies instead of importing them directly.
 * Production passes Prisma repositories; tests pass in-memory ones. Same app, no database needed.
 */
export function createApp({ env, authRepository, enableRateLimit = true }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Vercel sits in front of us; needed for correct client IPs

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ data: { status: 'ok', time: new Date().toISOString() } });
  });

  app.use('/api', createDocsRouter());
  const authService = new AuthService(authRepository, env);
  app.use('/api/auth', createAuthRouter({ service: authService, env, enableRateLimit }));

  app.use('/api', createCourseRoutes(env));
  app.use('/api', createLessonRoutes(env));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
