import { PrismaClient } from '@prisma/client';

// Reuse one client per process. Without this, hot reloads (dev) and warm serverless
// invocations (Vercel) would open a new connection pool every time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
