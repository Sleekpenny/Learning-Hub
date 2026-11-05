import type { Request, Response } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { clearSessionCookies, REFRESH_COOKIE, setSessionCookies } from './auth.cookies';
import type { AuthService } from './auth.service';

type CookieEnv = Pick<Env, 'NODE_ENV' | 'ACCESS_TOKEN_TTL_MINUTES'>;

/**
 * Controllers are thin: read the request, call the service, shape the response.
 * No business rules here.
 */
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly env: CookieEnv,
  ) {}

  signup = async (req: Request, res: Response) => {
    const session = await this.service.signup(req.body);
    setSessionCookies(res, session, this.env);
    res.status(201).json({ data: { user: session.user } });
  };

  login = async (req: Request, res: Response) => {
    const session = await this.service.login(req.body);
    setSessionCookies(res, session, this.env);
    res.json({ data: { user: session.user } });
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const session = await this.service.refresh(req.cookies?.[REFRESH_COOKIE]);
      setSessionCookies(res, session, this.env);
      res.json({ data: { user: session.user } });
    } catch (error) {
      // A failed refresh means the session is over: clear the stale cookies as well.
      if (error instanceof AppError) clearSessionCookies(res, this.env);
      throw error;
    }
  };

  logout = async (req: Request, res: Response) => {
    await this.service.logout(req.cookies?.[REFRESH_COOKIE]);
    clearSessionCookies(res, this.env);
    res.status(204).end();
  };

  me = async (req: Request, res: Response) => {
    // `authenticate` guarantees req.user exists on this route.
    const user = await this.service.getCurrentUser(req.user!.id);
    res.json({ data: { user } });
  };
}
