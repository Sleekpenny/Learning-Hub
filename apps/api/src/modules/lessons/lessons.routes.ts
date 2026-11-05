import { Router } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { validate } from '../../middleware/validate';
import { lessonSchema, reorderSchema, updateLessonSchema } from './lessons.schemas';

export function createLessonRoutes(env: Env) {
  const router = Router();
  const adminOnly = [authenticate(env), requireRole('ADMIN')];

  // Open one lesson. Needs login. Also returns the course's other lessons for the "up next" list.
  router.get('/lessons/:id', authenticate(env), async (req, res) => {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { course: { select: { id: true, title: true, published: true } } },
    });

    const isAdmin = req.user?.role === 'ADMIN';
    if (!lesson || (!lesson.course.published && !isAdmin)) {
      throw AppError.notFound('Lesson not found');
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId },
      orderBy: { position: 'asc' },
      select: { id: true, title: true, durationSeconds: true, position: true },
    });

    res.json({ data: { lesson, lessons } });
  });

  router.post('/courses/:courseId/lessons', ...adminOnly, validate({ body: lessonSchema }), async (req, res) => {
    const courseId = req.params.courseId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw AppError.notFound('Course not found');

    // New lessons go to the end of the course
    const last = await prisma.lesson.aggregate({ where: { courseId }, _max: { position: true } });
    const position = (last._max.position ?? 0) + 1;

    const lesson = await prisma.lesson.create({ data: { ...req.body, courseId, position } });
    res.status(201).json({ data: lesson });
  });

  // Body: { "lessonIds": ["id3", "id1", "id2"] } in the order you want
  router.put('/courses/:courseId/lessons/order', ...adminOnly, validate({ body: reorderSchema }), async (req, res) => {
    const courseId = req.params.courseId;
    const { lessonIds } = req.body as { lessonIds: string[] };

    const lessons = await prisma.lesson.findMany({ where: { courseId }, select: { id: true } });
    if (lessons.length === 0) throw AppError.notFound('Course not found or it has no lessons');

    const listsEveryLesson = lessons.length === lessonIds.length && lessons.every((l) => lessonIds.includes(l.id));
    if (!listsEveryLesson) {
      throw AppError.badRequest('lessonIds must list every lesson in this course exactly once');
    }

    // Two lessons cannot share a position, so move them all to temporary negative
    // positions first, then set the real ones.
    await prisma.$transaction([
      ...lessonIds.map((id, i) => prisma.lesson.update({ where: { id }, data: { position: -(i + 1) } })),
      ...lessonIds.map((id, i) => prisma.lesson.update({ where: { id }, data: { position: i + 1 } })),
    ]);

    res.status(204).end();
  });

  router.patch('/lessons/:id', ...adminOnly, validate({ body: updateLessonSchema }), async (req, res) => {
    const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound('Lesson not found');

    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: lesson });
  });

  router.delete('/lessons/:id', ...adminOnly, async (req, res) => {
    const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound('Lesson not found');

    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.status(204).end();
  });

  return router;
}