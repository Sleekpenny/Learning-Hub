import { loadEnv } from '../src/config/env';
import { prisma } from '../src/lib/prisma';

/**
 * `npm run check`: tells you, in plain English, whether the backend is set up correctly.
 * It never changes anything; it only reads.
 */

const ok = (msg: string) => console.log(`  ${msg}`);
const bad = (msg: string, fix: string) => console.log(`  ${msg}\n     → ${fix}`);

async function main() {
  let failures = 0;
  console.log('\nLearnHub backend check\n');

  // 1. Environment variables
  console.log('1. Your .env file');
  try {
    const env = loadEnv();
    ok('All required values are present and valid');
    if (env.JWT_ACCESS_SECRET.includes('replace-with')) {
      failures++;
      bad('JWT_ACCESS_SECRET is still the placeholder', 'Generate one: see apps/api/docs/SETUP.md, step 4');
    }
  } catch (error) {
    failures++;
    bad(
      (error as Error).message.replace('Invalid environment configuration:\n', '').trim(),
      'Open apps/api/.env and fix the lines listed above (compare with .env.example)',
    );
    console.log('\nFix the .env file first, then run this check again.\n');
    process.exit(1);
  }
  if (!process.env['DIRECT_URL']) {
    failures++;
    bad('DIRECT_URL is missing', 'Add the Neon direct connection string to .env (SETUP.md, step 3)');
  } else {
    ok('DIRECT_URL is set');
  }

  // 2. Database connection
  console.log('\n2. Database connection');
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok('Connected to Postgres');
  } catch (error) {
    failures++;
    const message = (error as Error).message;
    const hint = /password authentication|P1000/i.test(message)
      ? 'The password in DATABASE_URL is wrong. Copy the connection string from Neon again.'
      : /P1001|ENOTFOUND|ECONNREFUSED|timed out/i.test(message)
        ? "Can't reach the database. Check DATABASE_URL for typos and that your internet works."
        : 'Re-copy DATABASE_URL from the Neon dashboard.';
    bad('Could not connect to the database', hint);
    console.log('\nFix the connection first, then run this check again.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  // 3. Tables
  console.log('\n3. Database tables');
  try {
    const users = await prisma.user.count();
    ok('Tables exist');
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (admins > 0) ok(`Admin account exists (${admins})`);
    else {
      failures++;
      bad('No admin account yet', 'Run: npm run db:seed');
    }
    console.log(`     (${users} user${users === 1 ? '' : 's'} in total)`);
  } catch {
    failures++;
    bad('Tables are missing', 'Run: npm run db:migrate -- --name init');
  }

  await prisma.$disconnect();
  console.log(
    failures === 0
      ? '\n Everything looks good. Start the API with: npm run dev\n'
      : `\n${failures} problem${failures === 1 ? '' : 's'} found. Fix the items above and run this again.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main();