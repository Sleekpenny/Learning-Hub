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

  // Add the sample courses only when there are no courses yet
  const courseCount = await prisma.course.count();
  if (courseCount > 0) {
    console.log(`Skipped sample courses (${courseCount} already exist)`);
    return;
  }

  for (const course of sampleCourses) {
    const { lessons, ...courseData } = course;
    await prisma.course.create({
      data: {
        ...courseData,
        published: true,
        lessons: {
          create: lessons.map((lesson:any, index:any) => ({ ...lesson, position: index + 1 })),
        },
      },
    });
  }
  console.log(`Added ${sampleCourses.length} sample courses`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());