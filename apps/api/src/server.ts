import { createProductionApp } from './bootstrap';
import { loadEnv } from './config/env';

// Local development entry point: `npm run dev`. On Vercel, api/index.ts is used instead.
const { PORT } = loadEnv();
const app = createProductionApp();

app.listen(PORT, () => {
  console.log(`LearnHub API listening on http://localhost:${PORT}`);
});
