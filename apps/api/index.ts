import type { Express } from 'express';
import { createProductionApp } from './src/bootstrap';

// Vercel entry point. Vercel looks for this file in the project root and needs the Express app
// as the default export. Local development uses src/server.ts instead (npm run dev).
const app: Express = createProductionApp();

export default app;