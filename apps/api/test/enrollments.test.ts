import request from 'supertest';
import { describe, expect, it, type Mock } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { loginAs } from './helpers/tokens';
import { buildTestApp } from './helpers/test-app';

const { app } = buildTestApp();

const course = prisma.course.findUnique as Mock;
const enrollment = {
  findUnique: prisma.enrollment.findUnique as Mock,
  findMany: prisma.enrollment.findMany as Mock,
  create: prisma.enrollment.create as Mock,
};
const lessonFindMany = prisma.lesson.findMany as Mock;

describe('POST /api/courses/:courseId/enroll', () => {
  it('needs a login', async () => {
    const res = await request(app).post('/api/courses/c1/enroll');
    expect(res.status).toBe(401);
  });

  it('enrolls the logged in user', async () => {
    course.mockResolvedValue({ id: 'c1', published: true });
    enrollment.create.mockImplementation(async ({ data }) => ({ id: 'e1', ...data }));

    const res = await request(app).post('/api/courses/c1/enroll').set(loginAs('LEARNER'));

    expect(res.status).toBe(201);
    expect(enrollment.create).toHaveBeenCalledWith({ data: { userId: 'user-1', courseId: 'c1' } });
  });

  it('returns 404 for a draft or missing course', async () => {
    course.mockResolvedValueOnce({ id: 'c1', published: false });
    expect((await request(app).post('/api/courses/c1/enroll').set(loginAs('LEARNER'))).status).toBe(404);

    course.mockResolvedValueOnce(null);
    expect((await request(app).post('/api/courses/zzz/enroll').set(loginAs('LEARNER'))).status).toBe(404);
    expect(enrollment.create).not.toHaveBeenCalled();
  });

  it('returns 409 ALREADY_ENROLLED when the database says the pair exists', async () => {
    course.mockResolvedValue({ id: 'c1', published: true });
    enrollment.create.mockRejectedValue({ code: 'P2002' });

    const res = await request(app).post('/api/courses/c1/enroll').set(loginAs('LEARNER'));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_ENROLLED');
  });
});

describe('GET /api/courses/:courseId/progress', () => {
  it('needs a login', async () => {
    expect((await request(app).get('/api/courses/c1/progress')).status).toBe(401);
  });

  it('says enrolled: false for a learner who has not enrolled', async () => {
    course.mockResolvedValue({ id: 'c1', published: true });
    enrollment.findUnique.mockResolvedValue(null);
    lessonFindMany.mockResolvedValue([
      { id: 'l1', progress: [] },
      { id: 'l2', progress: [] },
    ]);

    const res = await request(app).get('/api/courses/c1/progress').set(loginAs('LEARNER'));

    expect(res.status).toBe(200);
    expect(res.body.data.enrolled).toBe(false);
    expect(res.body.data.progressPercent).toBe(0);
    expect(res.body.data.status).toBe('NOT_STARTED');
  });

  it('returns progress and a status for every lesson', async () => {
    course.mockResolvedValue({ id: 'c1', published: true });
    enrollment.findUnique.mockResolvedValue({ enrolledAt: new Date('2026-01-01') });
    lessonFindMany.mockResolvedValue([
      { id: 'l1', progress: [{ completed: true, positionSeconds: 60 }] },
      { id: 'l2', progress: [{ completed: false, positionSeconds: 15 }] },
      { id: 'l3', progress: [] },
    ]);

    const res = await request(app).get('/api/courses/c1/progress').set(loginAs('LEARNER'));

    expect(res.body.data.enrolled).toBe(true);
    expect(res.body.data.completedLessons).toBe(1);
    expect(res.body.data.progressPercent).toBe(33);
    expect(res.body.data.resumeLessonId).toBe('l2');
    expect(res.body.data.lessons).toEqual([
      { id: 'l1', status: 'COMPLETED', positionSeconds: 60 },
      { id: 'l2', status: 'IN_PROGRESS', positionSeconds: 15 },
      { id: 'l3', status: 'NOT_STARTED', positionSeconds: 0 },
    ]);
  });

  it('returns 404 for a draft course', async () => {
    course.mockResolvedValue({ id: 'c1', published: false });
    expect((await request(app).get('/api/courses/c1/progress').set(loginAs('LEARNER'))).status).toBe(404);
  });
});

// One enrolled course as the database would return it
function enrolled(id: string, title: string, lessons: { done: boolean; seconds: number }[]) {
  return {
    enrolledAt: new Date('2026-01-01'),
    lastAccessedAt: new Date('2026-01-02'),
    completedAt: null,
    course: {
      id,
      title,
      lessons: lessons.map((l, i) => ({
        id: `${id}-l${i + 1}`,
        durationSeconds: 100,
        progress: l.done || l.seconds > 0 ? [{ completed: l.done, positionSeconds: l.seconds }] : [],
      })),
    },
  };
}

describe('GET /api/me/courses', () => {
  it('needs a login', async () => {
    expect((await request(app).get('/api/me/courses')).status).toBe(401);
  });

  it('returns my courses with progress, status and the lesson to resume', async () => {
    enrollment.findMany.mockResolvedValue([
      enrolled('c1', 'React', [{ done: true, seconds: 100 }, { done: false, seconds: 30 }]),
    ]);

    const res = await request(app).get('/api/me/courses').set(loginAs('LEARNER'));

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({
      id: 'c1',
      lessonCount: 2,
      completedLessons: 1,
      progressPercent: 50,
      status: 'IN_PROGRESS',
      resumeLessonId: 'c1-l2',
      totalDurationSeconds: 200,
    });
  });

  it('only asks the database for the logged in user', async () => {
    enrollment.findMany.mockResolvedValue([]);
    await request(app).get('/api/me/courses').set(loginAs('LEARNER'));
    expect(enrollment.findMany.mock.calls[0]?.[0].where).toEqual({ userId: 'user-1' });
  });
});

describe('GET /api/me/dashboard', () => {
  it('counts courses by status and lists the ones to continue', async () => {
    enrollment.findMany.mockResolvedValue([
      enrolled('c1', 'React', [{ done: true, seconds: 100 }, { done: true, seconds: 100 }]), // completed
      enrolled('c2', 'TypeScript', [{ done: true, seconds: 100 }, { done: false, seconds: 0 }]), // in progress
      enrolled('c3', 'Design', [{ done: false, seconds: 0 }]), // not started
    ]);

    const res = await request(app).get('/api/me/dashboard').set(loginAs('LEARNER'));

    expect(res.status).toBe(200);
    expect(res.body.data.stats).toEqual({
      enrolledCourses: 3,
      inProgress: 1,
      completed: 1,
      lessonsCompleted: 3,
    });
    // finished courses are not offered under "continue learning"
    expect(res.body.data.continueLearning.map((c: { id: string }) => c.id)).toEqual(['c2', 'c3']);
  });

  it('works for a learner with no courses yet', async () => {
    enrollment.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/me/dashboard').set(loginAs('LEARNER'));
    expect(res.body.data.stats.enrolledCourses).toBe(0);
    expect(res.body.data.continueLearning).toEqual([]);
  });
});