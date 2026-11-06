import { prisma } from '../../lib/prisma';
import { courseProgress } from '../../lib/progress';

// Every course a learner is enrolled in, with their progress in each.
// Used by the learner dashboard, "My courses" and the admin learner page.
export async function loadMyCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { lastAccessedAt: 'desc' },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              durationSeconds: true,
              progress: { where: { userId }, select: { completed: true, positionSeconds: true } },
            },
          },
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const { lessons, ...course } = enrollment.course;
    const rows = lessons.flatMap((lesson) => lesson.progress.map((p) => ({ lessonId: lesson.id, ...p })));

    return {
      ...course,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedAt: enrollment.completedAt,
      totalDurationSeconds: lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0),
      ...courseProgress(lessons, rows),
    };
  });
}