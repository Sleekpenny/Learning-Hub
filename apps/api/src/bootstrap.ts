import type { Express } from 'express';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { prisma } from './lib/prisma';
import { PrismaAuthRepository } from './modules/auth/auth.prisma-repository';

/** Wires the real dependencies (env + Prisma) into the app. Used by the local server and Vercel. */
export function createProductionApp(): Express {
  const env = loadEnv();
  return createApp({
    env,
    authRepository: new PrismaAuthRepository(prisma),
  });
}
