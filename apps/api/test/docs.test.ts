import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers/test-app';

describe('API docs', () => {
  it('serves the OpenAPI spec listing the auth endpoints', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/auth/signup',
        '/api/auth/login',
        '/api/auth/refresh',
        '/api/auth/logout',
        '/api/auth/me',
      ]),
    );
  });

  it('serves the docs page with a CSP that allows only the Swagger CDN', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('/api/openapi.json');
    expect(res.headers['content-security-policy']).toContain('https://cdn.jsdelivr.net');
  });
});