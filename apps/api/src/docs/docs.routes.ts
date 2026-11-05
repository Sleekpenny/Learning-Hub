import { Router } from 'express';
import { openApiSpec } from './openapi';

const SWAGGER_VERSION = '5.17.14';
const CDN = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}`;

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LearnHub API docs</title>
    <link rel="stylesheet" href="${CDN}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${CDN}/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        tryItOutEnabled: true,
        persistAuthorization: true,
      });
    </script>
  </body>
</html>`;

// helmet's default security policy blocks external scripts and inline code. This relaxed policy
// applies ONLY to the docs page, and only allows the one CDN host the page needs.
const docsCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`,
  `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`,
  `img-src 'self' data: https://cdn.jsdelivr.net`,
  "connect-src 'self'",
].join('; ');

export function createDocsRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });

  router.get('/docs', (_req, res) => {
    res.setHeader('Content-Security-Policy', docsCsp);
    res.type('html').send(page);
  });

  return router;
}