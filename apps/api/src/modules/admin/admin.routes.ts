import { Router } from 'express';
import type { Env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { loadMyCourses } from '../enrollments/my-courses';

export function createAdminRoutes(env: Env) {
  const router = Router();
  router.use('/admin', authenticate(env), requireRole('ADMIN'));

  // Numbers for the top of the admin page
  router.get('/admin/dashboard', async (_req, res) => {
    const [learners, publishedCourses, draftCourses, enrollments, completedEnrollments, lessonsCompleted, recent, topCourses] =
      await Promise.all([
        prisma.user.count({ where: { role: 'LEARNER' } }),
        prisma.course.count({ where: { published: true } }),
        prisma.course.count({ where: { published: false } }),
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { completedAt: { not: null } } }),
        prisma.lessonProgress.count({ where: { completed: true } }),
        prisma.enrollment.findMany({
          orderBy: { enrolledAt: 'desc' },
          take: 5,
          include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
        }),
        prisma.course.findMany({
          orderBy: { enrollments: { _count: 'desc' } },
          take: 5,
          select: { id: true, title: true, _count: { select: { enrollments: true } } },
        }),
      ]);

    res.json({
      data: {
        totals: { learners, publishedCourses, draftCourses, enrollments, completedEnrollments, lessonsCompleted },
        recentEnrollments: recent.map((e) => ({
          id: e.id,
          learnerName: e.user.name,
          learnerEmail: e.user.email,
          courseTitle: e.course.title,
          enrolledAt: e.enrolledAt,
        })),
        topCourses: topCourses.map((c) => ({ id: c.id, title: c.title, enrollments: c._count.enrollments })),
      },
    });
  });

  // Who is taking one course and how far they have got
  router.get('/admin/courses/:id/learners', async (req, res) => {
    const courseId = String(req.params.id);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, _count: { select: { lessons: true } } },
    });
    if (!course) throw AppError.notFound('Course not found');

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    const doneRows = await prisma.lessonProgress.findMany({
      where: { completed: true, lesson: { courseId } },
      select: { userId: true },
    });

    const lessonCount = course._count.lessons;
    const learners = enrollments.map((e) => {
      const completedLessons = doneRows.filter((row) => row.userId === e.userId).length;
      return {
        userId: e.user.id,
        name: e.user.name,
        email: e.user.email,
        enrolledAt: e.enrolledAt,
        lastAccessedAt: e.lastAccessedAt,
        completedAt: e.completedAt,
        completedLessons,
        progressPercent: lessonCount === 0 ? 0 : Math.round((completedLessons / lessonCount) * 100),
      };
    });

    res.json({ data: { course: { id: course.id, title: course.title, lessonCount }, learners } });
  });

  router.get('/admin/learners', async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: 'LEARNER' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, name: true, email: true, createdAt: true, _count: { select: { enrollments: true } } },
    });

    res.json({
      data: users.map(({ _count, ...user }) => ({ ...user, enrolledCourses: _count.enrollments })),
    });
  });

  // One learner with every course they are taking and how far they have got
  router.get('/admin/learners/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw AppError.notFound('Learner not found');

    const courses = await loadMyCourses(user.id);
    res.json({ data: { user, courses } });
  });

  return router;
}