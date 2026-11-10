import { Router } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { progressSchema } from './progress.schemas';

export function createProgressRoutes(env: Env) {
  const router = Router();

  // The video player calls this every few seconds and when the video ends
  router.put('/lessons/:id/progress', authenticate(env), validate({ body: progressSchema }), async (req, res) => {
    const lessonId = String(req.params.id);
    const userId = req.user!.id;
    const { positionSeconds, completed } = req.body as { positionSeconds: number; completed?: boolean };

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { published: true } } },
    });
    if (!lesson || !lesson.course.published) throw AppError.notFound('Lesson not found');

    const courseId = lesson.courseId;
    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (!enrollment) throw new AppError(403, 'NOT_ENROLLED', 'Enroll in this course first');

    // Once a lesson is completed it stays completed, even if the learner replays it
    const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
    const isCompleted = existing?.completed === true || completed === true;
    const justCompleted = isCompleted && !existing?.completed;

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, positionSeconds, completed: isCompleted, completedAt: isCompleted ? new Date() : null },
      update: { positionSeconds, completed: isCompleted, ...(justCompleted && { completedAt: new Date() }) },
    });

    // Update the course totals, and mark the whole course complete when every lesson is done
    const lessonCount = await prisma.lesson.count({ where: { courseId } });
    const completedLessons = await prisma.lessonProgress.count({
      where: { userId, completed: true, lesson: { courseId } },
    });
    const courseDone = lessonCount > 0 && completedLessons >= lessonCount;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lastAccessedAt: new Date(),
        completedAt: courseDone ? (enrollment.completedAt ?? new Date()) : null,
      },
    });

    res.json({
      data: {
        progress,
        course: {
          lessonCount,
          completedLessons,
          progressPercent: lessonCount === 0 ? 0 : Math.round((completedLessons / lessonCount) * 100),
          completed: courseDone,
        },
      },
    });
  });

  return router;
}