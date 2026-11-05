import type { CookieOptions, Response } from 'express';
import type { Env } from '../../config/env';
import type { Session } from './auth.types';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

/** The refresh cookie is only sent to the auth routes, never to ordinary API calls. */
const REFRESH_COOKIE_PATH = '/api/auth';

function baseOptions(env: Pick<Env, 'NODE_ENV'>): CookieOptions {
  return {
    httpOnly: true, // JavaScript in the page cannot read it, so XSS cannot steal it
    secure: env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // not sent on cross-site POSTs, which blocks classic CSRF
  };
}

export function setSessionCookies(
  res: Response,
  session: Session,
  env: Pick<Env, 'NODE_ENV' | 'ACCESS_TOKEN_TTL_MINUTES'>,
): void {
  res.cookie(ACCESS_COOKIE, session.accessToken, {
    ...baseOptions(env),
    path: '/',
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, session.refreshToken, {
    ...baseOptions(env),
    path: REFRESH_COOKIE_PATH,
    expires: session.refreshExpiresAt,
  });
}

export function clearSessionCookies(res: Response, env: Pick<Env, 'NODE_ENV'>): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(env), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(env), path: REFRESH_COOKIE_PATH });
}
