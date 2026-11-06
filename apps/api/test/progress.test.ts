import request from 'supertest';
import { describe, expect, it, type Mock } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { loginAs } from './helpers/tokens';
import { buildTestApp } from './helpers/test-app';

const { app } = buildTestApp();

const lesson = prisma.lesson.findUnique as Mock;
const lessonCount = prisma.lesson.count as Mock;
const enrollment = {
  findUnique: prisma.enrollment.findUnique as Mock,
  update: prisma.enrollment.update as Mock,
};
const progress = {
  findUnique: prisma.lessonProgress.findUnique as Mock,
  upsert: prisma.lessonProgress.upsert as Mock,
  count: prisma.lessonProgress.count as Mock,
};

// Sets up a published lesson that the user is enrolled in, with nothing watched yet
function setup({ totalLessons = 4, completedAfterSave = 1, existing = null as null | { completed: boolean } } = {}) {
  lesson.mockResolvedValue({ id: 'l1', courseId: 'c1', course: { published: true } });
  enrollment.findUnique.mockResolvedValue({ id: 'e1', completedAt: null });
  progress.findUnique.mockResolvedValue(existing);
  progress.upsert.mockImplementation(async ({ create }) => create);
  lessonCount.mockResolvedValue(totalLessons);
  progress.count.mockResolvedValue(completedAfterSave);
}

const save = (body: object) => request(app).put('/api/lessons/l1/progress').set(loginAs('LEARNER')).send(body);

describe('PUT /api/lessons/:id/progress', () => {
  it('needs a login', async () => {
    const res = await request(app).put('/api/lessons/l1/progress').send({ positionSeconds: 10 });
    expect(res.status).toBe(401);
  });

  it.each([
    ['a negative position', { positionSeconds: -1 }],
    ['a decimal position', { positionSeconds: 1.5 }],
    ['a missing position', {}],
    ['a text position', { positionSeconds: 'ten' }],
  ])('rejects %s', async (_name, body) => {
    const res = await save(body);
    expect(res.status).toBe(400);
    expect(progress.upsert).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing lesson or a draft course', async () => {
    lesson.mockResolvedValueOnce(null);
    expect((await save({ positionSeconds: 5 })).status).toBe(404);

    lesson.mockResolvedValueOnce({ id: 'l1', courseId: 'c1', course: { published: false } });
    expect((await save({ positionSeconds: 5 })).status).toBe(404);
  });

  it('returns 403 NOT_ENROLLED when the learner has not enrolled', async () => {
    lesson.mockResolvedValue({ id: 'l1', courseId: 'c1', course: { published: true } });
    enrollment.findUnique.mockResolvedValue(null);

    const res = await save({ positionSeconds: 5 });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_ENROLLED');
    expect(progress.upsert).not.toHaveBeenCalled();
  });

  it('saves the watched position without completing the lesson', async () => {
    setup();

    const res = await save({ positionSeconds: 42 });

    expect(res.status).toBe(200);
    expect(res.body.data.progress).toMatchObject({ positionSeconds: 42, completed: false, completedAt: null });
    expect(progress.upsert.mock.calls[0]?.[0].where).toEqual({
      userId_lessonId: { userId: 'user-1', lessonId: 'l1' },
    });
  });

  it('marks the lesson completed when the video ended', async () => {
    setup();

    const res = await save({ positionSeconds: 300, completed: true });

    expect(res.body.data.progress.completed).toBe(true);
    expect(res.body.data.progress.completedAt).toBeTruthy();
  });

  it('keeps a completed lesson completed when it is replayed', async () => {
    setup({ existing: { completed: true } });

    const res = await save({ positionSeconds: 5 });

    expect(res.body.data.progress.completed).toBe(true);
    // completedAt is not touched again, because it was already completed
    expect(progress.upsert.mock.calls[0]?.[0].update).not.toHaveProperty('completedAt');
  });

  it('reports the course progress after saving', async () => {
    setup({ totalLessons: 4, completedAfterSave: 1 });

    const res = await save({ positionSeconds: 10, completed: true });

    expect(res.body.data.course).toEqual({
      lessonCount: 4,
      completedLessons: 1,
      progressPercent: 25,
      completed: false,
    });
  });

  it('marks the enrollment completed when the last lesson is finished', async () => {
    setup({ totalLessons: 4, completedAfterSave: 4 });

    const res = await save({ positionSeconds: 10, completed: true });

    expect(res.body.data.course.completed).toBe(true);
    const data = enrollment.update.mock.calls[0]?.[0].data;
    expect(data.completedAt).toBeInstanceOf(Date);
    expect(data.lastAccessedAt).toBeInstanceOf(Date);
  });

  it('leaves the enrollment open while lessons remain', async () => {
    setup({ totalLessons: 4, completedAfterSave: 3 });

    await save({ positionSeconds: 10, completed: true });

    expect(enrollment.update.mock.calls[0]?.[0].data.completedAt).toBeNull();
  });
});