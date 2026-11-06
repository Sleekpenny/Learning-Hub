import { Router } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { courseProgress, lessonStatus } from '../../lib/progress';
import { authenticate } from '../../middleware/authenticate';
import { loadMyCourses } from './my-courses';

export function createEnrollmentRoutes(env: Env) {
  const router = Router();

  router.post('/courses/:courseId/enroll', authenticate(env), async (req, res) => {
    const courseId = String(req.params.courseId);
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.published) throw AppError.notFound('Course not found');

    try {
      const enrollment = await prisma.enrollment.create({ data: { userId, courseId } });
      res.status(201).json({ data: enrollment });
    } catch (error) {
      // P2002 means the (user, course) pair already exists. The database enforces this,
      // so even a double click cannot enroll twice.
      if ((error as { code?: string }).code === 'P2002') {
        throw AppError.conflict('You are already enrolled in this course', 'ALREADY_ENROLLED');
      }
      throw error;
    }
  });

  // My progress in one course: used on the course detail page to show the badges and progress bar
  router.get('/courses/:courseId/progress', authenticate(env), async (req, res) => {
    const courseId = String(req.params.courseId);
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.published) throw AppError.notFound('Course not found');

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        progress: { where: { userId }, select: { completed: true, positionSeconds: true } },
      },
    });
    const rows = lessons.flatMap((lesson) => lesson.progress.map((p) => ({ lessonId: lesson.id, ...p })));

    res.json({
      data: {
        enrolled: enrollment !== null,
        enrolledAt: enrollment?.enrolledAt ?? null,
        ...courseProgress(lessons, rows),
        lessons: lessons.map((lesson) => ({
          id: lesson.id,
          status: lessonStatus(lesson.progress[0]),
          positionSeconds: lesson.progress[0]?.positionSeconds ?? 0,
        })),
      },
    });
  });

  router.get('/me/courses', authenticate(env), async (req, res) => {
    const courses = await loadMyCourses(req.user!.id);
    res.json({ data: courses });
  });

  // Everything the learner dashboard needs in one call
  router.get('/me/dashboard', authenticate(env), async (req, res) => {
    const courses = await loadMyCourses(req.user!.id);

    const stats = {
      enrolledCourses: courses.length,
      inProgress: courses.filter((c) => c.status === 'IN_PROGRESS').length,
      completed: courses.filter((c) => c.status === 'COMPLETED').length,
      lessonsCompleted: courses.reduce((sum, c) => sum + c.completedLessons, 0),
    };
    const continueLearning = courses.filter((c) => c.status !== 'COMPLETED').slice(0, 4);

    res.json({ data: { stats, continueLearning } });
  });

  return router;
}