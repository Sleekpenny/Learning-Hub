import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates the request with Zod BEFORE the controller runs.
 *  - `body` is replaced by the parsed (trimmed, normalised, unknown-keys-stripped) value.
 *  - `query` and `params` are read-only in Express 5, so their parsed values go to
 *    `res.locals.query` / `res.locals.params`.
 * A ZodError is passed to the error handler, which turns it into a 400 response.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) res.locals['query'] = schemas.query.parse(req.query);
      if (schemas.params) res.locals['params'] = schemas.params.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}
