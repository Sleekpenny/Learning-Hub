import { clips } from './sample.courses';

// Checks that every sample video is reachable and served as video.
// Usage: npm run db:check-videos
async function main() {
  let failed = 0;
  for (const [name, { url }] of Object.entries(clips)) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      const type = res.headers.get('content-type') ?? 'unknown';
      const ok = res.ok && type.startsWith('video');
      if (!ok) failed += 1;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(7)} ${res.status} ${type}  ${url}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL ${name.padEnd(7)} ${(error as Error).message}  ${url}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();