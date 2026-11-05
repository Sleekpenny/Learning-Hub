/**
 * OpenAPI 3 description of the API. The /api/docs page renders this as an interactive UI
 * where you can read every endpoint and call it from the browser.
 * When you add an endpoint, add it here too.
 */

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const userResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/User' } },
          },
        },
      },
    },
  },
});

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LearnHub API',
    version: '0.1.0',
    description:
      'REST API for the LearnHub learning platform.\n\n' +
      '**How to try protected endpoints:** call `POST /api/auth/login` below first. ' +
      'The browser stores the session cookies automatically, so later calls (like `GET /api/auth/me`) work.\n\n' +
      'Every error has the shape `{ "error": { "code", "message", "details?" } }`.',
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [
    { name: 'System', description: 'Health checks' },
    { name: 'Auth', description: 'Sign up, log in, sessions' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Is the API running?',
        responses: { '200': { description: 'The API is up' } },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a learner account and log in',
        description:
          'Password needs 8-72 characters with a lowercase letter, an uppercase letter and a number. ' +
          'Any `role` you send is ignored: public signup always creates a LEARNER.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SignupBody' } },
          },
        },
        responses: {
          '201': userResponse('Account created. Session cookies are set.'),
          '400': errorResponse('VALIDATION_ERROR: a field is invalid'),
          '409': errorResponse('EMAIL_TAKEN: this email already has an account'),
          '429': errorResponse('RATE_LIMITED: too many attempts'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } },
          },
        },
        responses: {
          '200': userResponse('Logged in. Session cookies are set.'),
          '400': errorResponse('VALIDATION_ERROR'),
          '401': errorResponse('INVALID_CREDENTIALS: wrong email or password'),
          '429': errorResponse('RATE_LIMITED'),
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Get a fresh session using the refresh cookie',
        description:
          'Call this when another endpoint returns `TOKEN_EXPIRED`, then retry the original call. ' +
          'Each refresh token works once; a new one is issued every time.',
        responses: {
          '200': userResponse('New session cookies are set.'),
          '401': errorResponse('SESSION_EXPIRED: log in again'),
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out and revoke the session',
        responses: { '204': { description: 'Logged out. Always succeeds.' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Who am I? (needs login)',
        responses: {
          '200': userResponse('The logged-in user'),
          '401': errorResponse('UNAUTHENTICATED, TOKEN_EXPIRED or INVALID_TOKEN'),
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1a2b3c0000abcd1234efgh' },
          email: { type: 'string', example: 'ada@example.com' },
          name: { type: 'string', example: 'Ada Lovelace' },
          role: { type: 'string', enum: ['LEARNER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SignupBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Ada Lovelace' },
          email: { type: 'string', example: 'ada@example.com' },
          password: { type: 'string', example: 'Sup3rSecret' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'ada@example.com' },
          password: { type: 'string', example: 'Sup3rSecret' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Some fields are invalid' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { field: { type: 'string' }, message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;