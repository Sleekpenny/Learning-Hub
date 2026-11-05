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
    { name: 'Courses', description: 'Public catalog' },
    { name: 'Lessons', description: 'Open a lesson (needs login)' },
    { name: 'Admin', description: 'Manage courses and lessons (admin only)' },
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
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'List published courses',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search title and description' },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 } },
        ],
        responses: { '200': { description: 'Courses with lessonCount and totalDurationSeconds, plus meta { page, limit, total }' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a course (admin)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CourseBody' } } },
        },
        responses: {
          '201': { description: 'Created. The slug is made from the title.' },
          '400': errorResponse('VALIDATION_ERROR'),
          '401': errorResponse('Not logged in'),
          '403': errorResponse('Not an admin'),
        },
      },
    },
    '/api/courses/categories': {
      get: {
        tags: ['Courses'],
        summary: 'List category names of published courses',
        responses: { '200': { description: 'An array of strings' } },
      },
    },
    '/api/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'One published course with its lessons (no video links)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'The course' }, '404': errorResponse('Not found, or not published') },
      },
      patch: {
        tags: ['Admin'],
        summary: 'Edit a course (admin). Send only the fields to change.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CourseBody' } } },
        },
        responses: { '200': { description: 'Updated course' }, '404': errorResponse('Not found') },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a course and its lessons (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' }, '404': errorResponse('Not found') },
      },
    },
    '/api/admin/courses': {
      get: {
        tags: ['Admin'],
        summary: 'List all courses including drafts (admin)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 } },
        ],
        responses: { '200': { description: 'Courses' }, '403': errorResponse('Not an admin') },
      },
    },
    '/api/admin/courses/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'One course with full lesson details, drafts included (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'The course' }, '404': errorResponse('Not found') },
      },
    },
    '/api/courses/{courseId}/lessons': {
      post: {
        tags: ['Admin'],
        summary: 'Add a lesson to the end of a course (admin)',
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LessonBody' } } },
        },
        responses: {
          '201': { description: 'Created. The position is set automatically.' },
          '400': errorResponse('VALIDATION_ERROR'),
          '404': errorResponse('Course not found'),
        },
      },
    },
    '/api/courses/{courseId}/lessons/order': {
      put: {
        tags: ['Admin'],
        summary: 'Reorder the lessons of a course (admin)',
        description: 'Send every lesson id of the course, in the new order.',
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lessonIds'],
                properties: { lessonIds: { type: 'array', items: { type: 'string' } } },
              },
            },
          },
        },
        responses: { '204': { description: 'Order saved' }, '400': errorResponse('The list does not match the course lessons') },
      },
    },
    '/api/lessons/{id}': {
      get: {
        tags: ['Lessons'],
        summary: 'Open a lesson: video link plus the other lessons in the course (needs login)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: '{ lesson, lessons }' },
          '401': errorResponse('Not logged in'),
          '404': errorResponse('Not found'),
        },
      },
      patch: {
        tags: ['Admin'],
        summary: 'Edit a lesson (admin). Send only the fields to change.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LessonBody' } } },
        },
        responses: { '200': { description: 'Updated lesson' }, '404': errorResponse('Not found') },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a lesson (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' }, '404': errorResponse('Not found') },
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
      CourseBody: {
        type: 'object',
        required: ['title', 'description', 'category'],
        properties: {
          title: { type: 'string', example: 'Modern React from Scratch' },
          description: { type: 'string', example: 'Build real apps with React and TypeScript.' },
          category: { type: 'string', example: 'Web Development' },
          thumbnailUrl: { type: 'string', nullable: true, example: 'https://picsum.photos/seed/react/640/360' },
          published: { type: 'boolean', example: false },
        },
      },
      LessonBody: {
        type: 'object',
        required: ['title', 'description', 'videoUrl', 'durationSeconds'],
        properties: {
          title: { type: 'string', example: 'Intro to components' },
          description: { type: 'string', example: 'What a component is and why we use them.' },
          videoUrl: { type: 'string', example: 'https://example.com/video.mp4' },
          durationSeconds: { type: 'integer', example: 300 },
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