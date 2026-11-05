import request from 'supertest';
import { describe, expect, it, type Mock } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { loginAs } from './helpers/tokens';
import { buildTestApp } from './helpers/test-app';

const { app } = buildTestApp();

const course = prisma.course.findUnique as Mock;
const lesson = {
  findMany: prisma.lesson.findMany as Mock,
  findUnique: prisma.lesson.findUnique as Mock,
  aggregate: prisma.lesson.aggregate as Mock,
  create: prisma.lesson.create as Mock,
  update: prisma.lesson.update as Mock,
  delete: prisma.lesson.delete as Mock,
};
const transaction = prisma.$transaction as Mock;

const newLesson = {
  title: 'Intro to components',
  description: 'What a component is and why we use them.',
  videoUrl: 'https://example.com/video.mp4',
  durationSeconds: 300,
};

describe('GET /api/lessons/:id', () => {
  it('needs a login', async () => {
    const res = await request(app).get('/api/lessons/l1');
    expect(res.status).toBe(401);
  });

  it('returns the lesson and the other lessons in the course', async () => {
    lesson.findUnique.mockResolvedValue({
      id: 'l1',
      courseId: 'c1',
      videoUrl: 'https://example.com/video.mp4',
      course: { id: 'c1', title: 'React', published: true },
    });
    lesson.findMany.mockResolvedValue([{ id: 'l1' }, { id: 'l2' }]);

    const res = await request(app).get('/api/lessons/l1').set(loginAs('LEARNER'));

    expect(res.status).toBe(200);
    expect(res.body.data.lesson.videoUrl).toBeTruthy();
    expect(res.body.data.lessons).toHaveLength(2);
  });

  it('hides lessons of a draft course from learners but not from admins', async () => {
    lesson.findUnique.mockResolvedValue({
      id: 'l1',
      courseId: 'c1',
      course: { id: 'c1', title: 'React', published: false },
    });
    lesson.findMany.mockResolvedValue([]);

    expect((await request(app).get('/api/lessons/l1').set(loginAs('LEARNER'))).status).toBe(404);
    expect((await request(app).get('/api/lessons/l1').set(loginAs('ADMIN'))).status).toBe(200);
  });
});

describe('POST /api/courses/:courseId/lessons', () => {
  it('is blocked for learners', async () => {
    const res = await request(app).post('/api/courses/c1/lessons').set(loginAs('LEARNER')).send(newLesson);
    expect(res.status).toBe(403);
  });

  it('puts the new lesson at the end of the course', async () => {
    course.mockResolvedValue({ id: 'c1' });
    lesson.aggregate.mockResolvedValue({ _max: { position: 3 } });
    lesson.create.mockImplementation(async ({ data }) => ({ id: 'l9', ...data }));

    const res = await request(app).post('/api/courses/c1/lessons').set(loginAs('ADMIN')).send(newLesson);

    expect(res.status).toBe(201);
    expect(res.body.data.position).toBe(4);
    expect(res.body.data.courseId).toBe('c1');
  });

  it('starts at position 1 in an empty course', async () => {
    course.mockResolvedValue({ id: 'c1' });
    lesson.aggregate.mockResolvedValue({ _max: { position: null } });
    lesson.create.mockImplementation(async ({ data }) => ({ id: 'l1', ...data }));

    const res = await request(app).post('/api/courses/c1/lessons').set(loginAs('ADMIN')).send(newLesson);

    expect(res.body.data.position).toBe(1);
  });

  it('returns 404 when the course does not exist', async () => {
    course.mockResolvedValue(null);
    const res = await request(app).post('/api/courses/x/lessons').set(loginAs('ADMIN')).send(newLesson);
    expect(res.status).toBe(404);
  });

  it.each([
    ['a bad video url', { videoUrl: 'nope' }, 'videoUrl'],
    ['a zero duration', { durationSeconds: 0 }, 'durationSeconds'],
    ['a decimal duration', { durationSeconds: 10.5 }, 'durationSeconds'],
    ['a short title', { title: 'a' }, 'title'],
  ])('rejects %s', async (_name, change, field) => {
    const res = await request(app)
      .post('/api/courses/c1/lessons')
      .set(loginAs('ADMIN'))
      .send({ ...newLesson, ...change });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });
});

describe('PUT /api/courses/:courseId/lessons/order', () => {
  it('saves the new order', async () => {
    lesson.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    transaction.mockResolvedValue([]);

    const res = await request(app)
      .put('/api/courses/c1/lessons/order')
      .set(loginAs('ADMIN'))
      .send({ lessonIds: ['c', 'a', 'b'] });

    expect(res.status).toBe(204);
    expect(transaction).toHaveBeenCalledTimes(1);
    // 3 moves to temporary positions + 3 final updates
    expect(lesson.update).toHaveBeenCalledTimes(6);
    expect(lesson.update).toHaveBeenLastCalledWith({ where: { id: 'b' }, data: { position: 3 } });
  });

  it('rejects a list that misses a lesson', async () => {
    lesson.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    const res = await request(app)
      .put('/api/courses/c1/lessons/order')
      .set(loginAs('ADMIN'))
      .send({ lessonIds: ['a'] });

    expect(res.status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects a list with a lesson from another course', async () => {
    lesson.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    const res = await request(app)
      .put('/api/courses/c1/lessons/order')
      .set(loginAs('ADMIN'))
      .send({ lessonIds: ['a', 'zzz'] });

    expect(res.status).toBe(400);
  });
});

describe('PATCH and DELETE /api/lessons/:id', () => {
  it('updates a lesson', async () => {
    lesson.findUnique.mockResolvedValue({ id: 'l1' });
    lesson.update.mockImplementation(async ({ data }) => ({ id: 'l1', ...data }));

    const res = await request(app).patch('/api/lessons/l1').set(loginAs('ADMIN')).send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New title');
  });

  it('deletes a lesson', async () => {
    lesson.findUnique.mockResolvedValue({ id: 'l1' });
    const res = await request(app).delete('/api/lessons/l1').set(loginAs('ADMIN'));
    expect(res.status).toBe(204);
  });

  it('returns 404 for a lesson that does not exist', async () => {
    lesson.findUnique.mockResolvedValue(null);
    expect((await request(app).patch('/api/lessons/x').set(loginAs('ADMIN')).send({ title: 'Hello' })).status).toBe(404);
    expect((await request(app).delete('/api/lessons/x').set(loginAs('ADMIN'))).status).toBe(404);
  });

  it('is blocked for learners', async () => {
    expect((await request(app).patch('/api/lessons/l1').set(loginAs('LEARNER')).send({ title: 'Hello' })).status).toBe(403);
    expect((await request(app).delete('/api/lessons/l1').set(loginAs('LEARNER'))).status).toBe(403);
  });
});