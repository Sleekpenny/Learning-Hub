import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp, createAdmin, getCookie, validSignup } from './helpers/test-app';

let app: ReturnType<typeof buildTestApp>['app'];
let repo: ReturnType<typeof buildTestApp>['authRepository'];

beforeEach(() => {
  ({ app, authRepository: repo } = buildTestApp());
});

describe('POST /api/auth/signup', () => {
  it('creates a learner, returns the public user and sets httpOnly cookies', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup);

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'LEARNER',
    });
    // The password hash must never leave the server.
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain('Sup3rSecret');

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('access_token=') && c.includes('HttpOnly'))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token=') && c.includes('HttpOnly'))).toBe(true);
    expect(cookies.find((c) => c.startsWith('refresh_token='))).toContain('Path=/api/auth');
  });

  it('stores a hashed password, not the plain one', async () => {
    await request(app).post('/api/auth/signup').send(validSignup);
    expect(repo.users[0]?.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(repo.users[0]?.passwordHash).not.toBe(validSignup.password);
  });

  it('stores refresh tokens hashed, not raw', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup);
    const raw = getCookie(res.headers['set-cookie'], 'refresh_token');
    expect(raw).toBeTruthy();
    expect(repo.refreshTokens).toHaveLength(1);
    expect(repo.refreshTokens[0]?.tokenHash).not.toBe(raw);
  });

  it('normalises the email (trim + lowercase)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validSignup, email: '  ADA@Example.COM ' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('ada@example.com');
  });

  it('ignores a client-supplied role: nobody can sign up as admin', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validSignup, role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('LEARNER');
  });

  it('rejects a duplicate email with 409 EMAIL_TAKEN', async () => {
    await request(app).post('/api/auth/signup').send(validSignup);
    const res = await request(app).post('/api/auth/signup').send(validSignup);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it.each([
    ['invalid email', { email: 'not-an-email' }, 'email'],
    ['short password', { password: 'Ab1' }, 'password'],
    ['password without a number', { password: 'NoNumbersHere' }, 'password'],
    ['password without uppercase', { password: 'lowercase123' }, 'password'],
    ['name too short', { name: 'A' }, 'name'],
  ])('rejects %s with 400 and a field-level message', async (_label, override, field) => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validSignup, ...override });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });

  it('rejects malformed JSON with 400 INVALID_JSON', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send(validSignup);
  });

  it('logs in with correct credentials and sets cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validSignup.email, password: validSignup.password });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validSignup.email);
    expect(getCookie(res.headers['set-cookie'], 'access_token')).toBeTruthy();
  });

  it('accepts the email in a different case', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADA@EXAMPLE.COM', password: validSignup.password });
    expect(res.status).toBe(200);
  });

  it('returns the SAME 401 for a wrong password and an unknown email (no account enumeration)', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: validSignup.email, password: 'WrongPassword1' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'WrongPassword1' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a missing password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validSignup.email });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without a session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('returns the current user when the session cookie is present', async () => {
    const agent = request.agent(app); // an agent keeps cookies between requests, like a browser
    await agent.post('/api/auth/signup').send(validSignup);
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validSignup.email);
  });

  it('also accepts a Bearer token (for Postman / curl)', async () => {
    const signup = await request(app).post('/api/auth/signup').send(validSignup);
    const token = getCookie(signup.headers['set-cookie'], 'access_token');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects a tampered token with INVALID_TOKEN', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('POST /api/auth/refresh', () => {
  it('rotates the refresh token and issues a new session', async () => {
    const agent = request.agent(app);
    const signup = await agent.post('/api/auth/signup').send(validSignup);
    const oldRefresh = getCookie(signup.headers['set-cookie'], 'refresh_token');

    const res = await agent.post('/api/auth/refresh');
    expect(res.status).toBe(200);

    const newRefresh = getCookie(res.headers['set-cookie'], 'refresh_token');
    expect(newRefresh).toBeTruthy();
    expect(newRefresh).not.toBe(oldRefresh);
    expect(repo.refreshTokens).toHaveLength(2);
    expect(repo.refreshTokens[0]?.revokedAt).not.toBeNull(); // the used token is dead
    expect(repo.refreshTokens[0]?.familyId).toBe(repo.refreshTokens[1]?.familyId);
  });

  it('returns 401 SESSION_EXPIRED when no refresh cookie is sent', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
  });

  it('detects token reuse: replaying a used token revokes the whole chain', async () => {
    const signup = await request(app).post('/api/auth/signup').send(validSignup);
    const stolen = getCookie(signup.headers['set-cookie'], 'refresh_token')!;

    // The legitimate user refreshes once. The original token is now spent.
    const legit = await request(app).post('/api/auth/refresh').set('Cookie', `refresh_token=${stolen}`);
    expect(legit.status).toBe(200);
    const legitNewToken = getCookie(legit.headers['set-cookie'], 'refresh_token')!;

    // An attacker replays the spent token: rejected, and the family is revoked...
    const replay = await request(app).post('/api/auth/refresh').set('Cookie', `refresh_token=${stolen}`);
    expect(replay.status).toBe(401);

    // ...so even the legitimate user's newest token no longer works.
    const afterReplay = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${legitNewToken}`);
    expect(afterReplay.status).toBe(401);
  });

  it('rejects an expired refresh token', async () => {
    const signup = await request(app).post('/api/auth/signup').send(validSignup);
    const token = getCookie(signup.headers['set-cookie'], 'refresh_token')!;
    repo.refreshTokens[0]!.expiresAt = new Date(Date.now() - 1000);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', `refresh_token=${token}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the session and clears cookies', async () => {
    const agent = request.agent(app);
    const signup = await agent.post('/api/auth/signup').send(validSignup);
    const refresh = getCookie(signup.headers['set-cookie'], 'refresh_token')!;

    const res = await agent.post('/api/auth/logout');
    expect(res.status).toBe(204);
    expect(repo.refreshTokens.every((t) => t.revokedAt !== null)).toBe(true);

    // The old refresh token can no longer be used, even if someone kept a copy.
    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', `refresh_token=${refresh}`);
    expect(reuse.status).toBe(401);
  });

  it('is idempotent: logging out without a session still returns 204', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
  });
});

describe('admin accounts', () => {
  it('an admin can log in and gets the ADMIN role', async () => {
    await createAdmin(repo);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Adm1nPassword' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('ADMIN');
  });
});

describe('platform basics', () => {
  it('GET /api/health responds ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
