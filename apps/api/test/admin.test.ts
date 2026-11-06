import request from 'supertest';
import { describe, expect, it, type Mock } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { loginAs } from './helpers/tokens';
import { buildTestApp } from './helpers/test-app';

const { app } = buildTestApp();

const count = {
  user: prisma.user.count as Mock,
  course: prisma.course.count as Mock,
  enrollment: prisma.enrollment.count as Mock,
  progress: prisma.lessonProgress.count as Mock,
};

describe('admin routes are protected', () => {
  const paths = [
    '/api/admin/dashboard',
    '/api/admin/learners',
    '/api/admin/learners/u1',
    '/api/admin/courses/c1/learners',
  ];

  it.each(paths)('GET %s returns 401 without login', async (path) => {
    expect((await request(app).get(path)).status).toBe(401);
  });

  it.each(paths)('GET %s returns 403 for a learner', async (path) => {
    expect((await request(app).get(path).set(loginAs('LEARNER'))).status).toBe(403);
  });
});

describe('GET /api/admin/dashboard', () => {
  it('returns totals, recent enrollments and top courses', async () => {
    count.user.mockResolvedValue(12);
    count.course.mockResolvedValueOnce(5).mockResolvedValueOnce(2); // published, then drafts
    count.enrollment.mockResolvedValueOnce(30).mockResolvedValueOnce(8); // all, then completed
    count.progress.mockResolvedValue(77);
    (prisma.enrollment.findMany as Mock).mockResolvedValue([
      {
        id: 'e1',
        enrolledAt: new Date('2026-01-01'),
        user: { name: 'Ada', email: 'ada@example.com' },
        course: { title: 'React' },
      },
    ]);
    (prisma.course.findMany as Mock).mockResolvedValue([
      { id: 'c1', title: 'React', _count: { enrollments: 20 } },
    ]);

    const res = await request(app).get('/api/admin/dashboard').set(loginAs('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.data.totals).toEqual({
      learners: 12,
      publishedCourses: 5,
      draftCourses: 2,
      enrollments: 30,
      completedEnrollments: 8,
      lessonsCompleted: 77,
    });
    expect(res.body.data.recentEnrollments[0]).toMatchObject({
      learnerName: 'Ada',
      courseTitle: 'React',
    });
    expect(res.body.data.topCourses).toEqual([{ id: 'c1', title: 'React', enrollments: 20 }]);
  });
});

describe('GET /api/admin/courses/:id/learners', () => {
  it('returns 404 for a missing course', async () => {
    (prisma.course.findUnique as Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/admin/courses/x/learners').set(loginAs('ADMIN'));
    expect(res.status).toBe(404);
  });

  it('shows each learner with their progress in the course', async () => {
    (prisma.course.findUnique as Mock).mockResolvedValue({ id: 'c1', title: 'React', _count: { lessons: 4 } });
    (prisma.enrollment.findMany as Mock).mockResolvedValue([
      {
        userId: 'u1',
        enrolledAt: new Date('2026-01-01'),
        lastAccessedAt: new Date('2026-01-03'),
        completedAt: null,
        user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
      },
      {
        userId: 'u2',
        enrolledAt: new Date('2026-01-02'),
        lastAccessedAt: new Date('2026-01-02'),
        completedAt: null,
        user: { id: 'u2', name: 'Bayo', email: 'bayo@example.com' },
      },
    ]);
    (prisma.lessonProgress.findMany as Mock).mockResolvedValue([
      { userId: 'u1' },
      { userId: 'u1' },
      { userId: 'u1' },
    ]);

    const res = await request(app).get('/api/admin/courses/c1/learners').set(loginAs('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.data.course).toEqual({ id: 'c1', title: 'React', lessonCount: 4 });
    expect(res.body.data.learners[0]).toMatchObject({ name: 'Ada', completedLessons: 3, progressPercent: 75 });
    expect(res.body.data.learners[1]).toMatchObject({ name: 'Bayo', completedLessons: 0, progressPercent: 0 });
  });
});

describe('GET /api/admin/learners', () => {
  it('lists learners with how many courses each is enrolled in', async () => {
    (prisma.user.findMany as Mock).mockResolvedValue([
      { id: 'u1', name: 'Ada', email: 'ada@example.com', createdAt: new Date(), _count: { enrollments: 3 } },
    ]);

    const res = await request(app).get('/api/admin/learners').set(loginAs('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({ name: 'Ada', enrolledCourses: 3 });
    expect(res.body.data[0]).not.toHaveProperty('_count');
    expect((prisma.user.findMany as Mock).mock.calls[0]?.[0].where).toEqual({ role: 'LEARNER' });
  });
});

describe('GET /api/admin/learners/:id', () => {
  it('returns 404 for an unknown learner', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/admin/learners/x').set(loginAs('ADMIN'));
    expect(res.status).toBe(404);
  });

  it('returns the learner with their courses and progress', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'u1', name: 'Ada', email: 'ada@example.com' });
    (prisma.enrollment.findMany as Mock).mockResolvedValue([
      {
        enrolledAt: new Date('2026-01-01'),
        lastAccessedAt: new Date('2026-01-02'),
        completedAt: null,
        course: {
          id: 'c1',
          title: 'React',
          lessons: [
            { id: 'l1', durationSeconds: 60, progress: [{ completed: true, positionSeconds: 60 }] },
            { id: 'l2', durationSeconds: 60, progress: [] },
          ],
        },
      },
    ]);

    const res = await request(app).get('/api/admin/learners/u1').set(loginAs('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Ada');
    expect(res.body.data.courses[0]).toMatchObject({ id: 'c1', progressPercent: 50, status: 'IN_PROGRESS' });
    // the admin page is about this learner, not the admin who is logged in
    expect((prisma.enrollment.findMany as Mock).mock.calls[0]?.[0].where).toEqual({ userId: 'u1' });
  });
});