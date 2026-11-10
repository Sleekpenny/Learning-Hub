import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sampleCourses } from './sample.courses';

const prisma = new PrismaClient();

/**
 * Creates (or updates) the first admin account. Public signup can never create admins,
 * so this script is the only way to get one.
 * Usage: set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env, then run `npm run db:seed`.
 */
async function main() {
  const email = process.env['ADMIN_EMAIL']?.trim().toLowerCase();
  const password = process.env['ADMIN_PASSWORD'];
  const name = process.env['ADMIN_NAME'] ?? 'Platform Admin';

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before seeding.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash, name },
    create: { email, name, passwordHash, role: 'ADMIN' },
  });

  console.log(`Admin ready: ${admin.email}`);

  // Sample courses are matched by slug, so running the seed again is safe.
  // New courses are created. Existing ones only get their lesson videos refreshed,
  // so titles, descriptions and publish status you changed in the admin are kept.
  let created = 0;
  for (const { lessons, ...courseData } of sampleCourses) {
    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });

    if (!existing) {
      await prisma.course.create({
        data: {
          ...courseData,
          published: true,
          lessons: { create: lessons.map((lesson, index) => ({ ...lesson, position: index + 1 })) },
        },
      });
      created += 1;
      continue;
    }

    for (const [index, lesson] of lessons.entries()) {
      const position = index + 1;
      await prisma.lesson.upsert({
        where: { courseId_position: { courseId: existing.id, position } },
        update: { videoUrl: lesson.videoUrl, durationSeconds: lesson.durationSeconds },
        create: { ...lesson, courseId: existing.id, position },
      });
    }
  }
  console.log(`Sample courses: ${created} added, ${sampleCourses.length - created} refreshed`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());