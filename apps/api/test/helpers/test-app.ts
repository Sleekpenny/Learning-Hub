import { createApp } from '../../src/app';
import type { Env } from '../../src/config/env';
import { hashPassword } from '../../src/lib/password';
import { InMemoryAuthRepository } from './in-memory-auth.repository';

export const testEnv: Env = {
  NODE_ENV: 'test',
  PORT: 4000,
  DATABASE_URL: 'postgresql://unused',
  JWT_ACCESS_SECRET: 'test-secret-that-is-at-least-32-characters-long',
  ACCESS_TOKEN_TTL_MINUTES: 15,
  REFRESH_TOKEN_TTL_DAYS: 7,
  BCRYPT_ROUNDS: 4, // fast hashing for tests
  CLIENT_ORIGIN: 'http://localhost:3000',
};

export const validSignup = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'Sup3rSecret',
  country: 'Nigeria',
  areaOfInterest: 'Web Development',
};

export function buildTestApp() {
  const authRepository = new InMemoryAuthRepository();
  const app = createApp({ env: testEnv, authRepository, enableRateLimit: false });
  return { app, authRepository };
}

/** Inserts an admin straight into the fake database (public signup can never create one). */
export async function createAdmin(repo: InMemoryAuthRepository, password = 'Adm1nPassword') {
  return repo.createUser({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash: await hashPassword(password, testEnv.BCRYPT_ROUNDS),
    role: 'ADMIN',
  });
}

/** Reads the raw value of a cookie out of supertest's `set-cookie` header. */
export function getCookie(setCookie: string[] | string | undefined, name: string): string | undefined {
  const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const match = list.find((c) => c.startsWith(`${name}=`));
  return match?.split(';')[0]?.slice(name.length + 1);
}