import { Router, type RequestHandler } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { slugify } from '../../lib/slug';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { validate } from '../../middleware/validate';
import { courseSchema, listQuerySchema, updateCourseSchema, type ListQuery } from './courses.schemas';

// Lessons are stored separately, so the course totals are worked out from them
function getTotals(lessons: { durationSeconds: number }[]) {
  return {
    lessonCount: lessons.length,
    totalDurationSeconds: lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0),
  };
}

// Used for both the public catalog (only published) and the admin list (everything)
function listCourses(onlyPublished: boolean): RequestHandler {
  return async (_req, res) => {
    const { q, category, page, limit } = res.locals['query'] as ListQuery;

    const where = {
      ...(onlyPublished && { published: true }),
      ...(category && { category }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { lessons: { select: { durationSeconds: true } } },
      }),
      prisma.course.count({ where }),
    ]);

    const data = courses.map(({ lessons, ...course }) => ({ ...course, ...getTotals(lessons) }));
    res.json({ data, meta: { page, limit, total } });
  };
}

export function createCourseRoutes(env: Env) {
  const router = Router();
  const adminOnly = [authenticate(env), requireRole('ADMIN')];

  // ---------- Public: anyone can browse published courses ----------

  router.get('/courses', validate({ query: listQuerySchema }), listCourses(true));

  // Used for the category filter on the catalog page
  router.get('/courses/categories', async (_req, res) => {
    const rows = await prisma.course.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    res.json({ data: rows.map((row) => row.category) });
  });

  router.get('/courses/:id', async (req, res) => {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        // videoUrl is left out here. It is only sent when a logged in user opens a lesson.
        lessons: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, description: true, durationSeconds: true, position: true },
        },
      },
    });
    if (!course || !course.published) throw AppError.notFound('Course not found');

    res.json({ data: { ...course, ...getTotals(course.lessons) } });
  });

  // ---------- Admin ----------

  router.get('/admin/courses', ...adminOnly, validate({ query: listQuerySchema }), listCourses(false));

  router.get('/admin/courses/:id', ...adminOnly, async (req, res) => {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { lessons: { orderBy: { position: 'asc' } } },
    });
    if (!course) throw AppError.notFound('Course not found');

    res.json({ data: { ...course, ...getTotals(course.lessons) } });
  });

  router.post('/courses', ...adminOnly, validate({ body: courseSchema }), async (req, res) => {
    // The slug is the URL friendly version of the title. Add a random ending if it is taken.
    let slug = slugify(req.body.title);
    const taken = await prisma.course.findUnique({ where: { slug } });
    if (taken) slug += '-' + Math.random().toString(36).slice(2, 6);

    const course = await prisma.course.create({ data: { ...req.body, slug } });
    res.status(201).json({ data: course });
  });

  router.patch('/courses/:id', ...adminOnly, validate({ body: updateCourseSchema }), async (req, res) => {
    const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound('Course not found');

    const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: course });
  });

  // Lessons, enrollments and progress for this course are deleted with it
  router.delete('/courses/:id', ...adminOnly, async (req, res) => {
    const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound('Course not found');

    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).end();
  });

  return router;
}