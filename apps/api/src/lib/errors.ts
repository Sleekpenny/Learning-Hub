/**
 * An error the API intentionally returns to the client.
 * Anything that is NOT an AppError is treated as a bug and returned as a generic 500.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHENTICATED') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'You do not have permission to do this') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(409, code, message);
  }
}
