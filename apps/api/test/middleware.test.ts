import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { authenticate } from '../src/middleware/authenticate';
import { errorHandler } from '../src/middleware/error-handler';
import { requireRole } from '../src/middleware/require-role';
import { signAccessToken } from '../src/lib/tokens';
import { testEnv } from './helpers/test-app';

/** A tiny app that exercises the guards exactly the way real routes will use them. */
function guardedApp() {
  const app = express();
  app.get('/learner-or-admin', authenticate(testEnv), (_req, res) => {
    res.json({ ok: true });
  });
  app.get('/admin-only', authenticate(testEnv), requireRole('ADMIN'), (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

const token = (role: 'LEARNER' | 'ADMIN', ttlSeconds = 600) =>
  signAccessToken({ sub: 'user-1', role }, testEnv.JWT_ACCESS_SECRET, ttlSeconds);

describe('authenticate', () => {
  it('rejects requests with no token (401)', async () => {
    const res = await request(guardedApp()).get('/learner-or-admin');
    expect(res.status).toBe(401);
  });

  it('accepts a valid token', async () => {
    const res = await request(guardedApp())
      .get('/learner-or-admin')
      .set('Authorization', `Bearer ${token('LEARNER')}`);
    expect(res.status).toBe(200);
  });

  it('answers an expired token with TOKEN_EXPIRED so the client knows to refresh', async () => {
    const res = await request(guardedApp())
      .get('/learner-or-admin')
      .set('Authorization', `Bearer ${token('LEARNER', -10)}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = signAccessToken({ sub: 'user-1', role: 'ADMIN' }, 'x'.repeat(40), 600);
    const res = await request(guardedApp())
      .get('/admin-only')
      .set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('requireRole', () => {
  it('lets an admin into admin-only routes', async () => {
    const res = await request(guardedApp())
      .get('/admin-only')
      .set('Authorization', `Bearer ${token('ADMIN')}`);
    expect(res.status).toBe(200);
  });

  it('blocks a learner from admin-only routes with 403', async () => {
    const res = await request(guardedApp())
      .get('/admin-only')
      .set('Authorization', `Bearer ${token('LEARNER')}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 401 (not 403) when nobody is logged in', async () => {
    const res = await request(guardedApp()).get('/admin-only');
    expect(res.status).toBe(401);
  });
});
