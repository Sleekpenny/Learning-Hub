import request from 'supertest';
import { describe, expect, it, type Mock } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { loginAs } from './helpers/tokens';
import { buildTestApp } from './helpers/test-app';

const { app } = buildTestApp();

const db = {
  findMany: prisma.course.findMany as Mock,
  findUnique: prisma.course.findUnique as Mock,
  count: prisma.course.count as Mock,
  create: prisma.course.create as Mock,
  update: prisma.course.update as Mock,
  delete: prisma.course.delete as Mock,
};

const newCourse = {
  title: 'Modern React',
  description: 'Build real apps with React and TypeScript.',
  category: 'Web Development',
};

describe('GET /api/courses', () => {
  it('lists published courses with lesson count and total duration', async () => {
    db.findMany.mockResolvedValue([
      {
        id: 'c1',
        title: 'Modern React',
        lessons: [{ durationSeconds: 60 }, { durationSeconds: 90 }],
      },
    ]);
    db.count.mockResolvedValue(1);

    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({ id: 'c1', lessonCount: 2, totalDurationSeconds: 150 });
    expect(res.body.data[0]).not.toHaveProperty('lessons');
    expect(res.body.meta).toEqual({ page: 1, limit: 12, total: 1 });
    // drafts must never show up in the public catalog
    expect(db.findMany.mock.calls[0]?.[0].where.published).toBe(true);
  });

  it('filters by category and search text', async () => {
    db.findMany.mockResolvedValue([]);
    db.count.mockResolvedValue(0);

    await request(app).get('/api/courses?category=Design&q=figma&page=2&limit=5');

    const args = db.findMany.mock.calls[0]?.[0];
    expect(args.where.category).toBe('Design');
    expect(args.where.OR).toHaveLength(2);
    expect(args.skip).toBe(5);
    expect(args.take).toBe(5);
  });

  it('search looks at the title and the category, not the description', async () => {
    db.findMany.mockResolvedValue([]);
    db.count.mockResolvedValue(0);

    await request(app).get('/api/courses?q=web%20development');

    const searched = db.findMany.mock.calls[0]?.[0].where.OR.map((clause: object) => Object.keys(clause)[0]);
    expect(searched).toEqual(['title', 'category']);
    expect(db.findMany.mock.calls[0]?.[0].where.OR[1].category.contains).toBe('web development');
  });

  it('rejects a limit above 50', async () => {
    const res = await request(app).get('/api/courses?limit=1000');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/courses/:id', () => {
  it('returns a published course with its lessons', async () => {
    db.findUnique.mockResolvedValue({
      id: 'c1',
      published: true,
      lessons: [{ id: 'l1', durationSeconds: 120, position: 1 }],
    });

    const res = await request(app).get('/api/courses/c1');

    expect(res.status).toBe(200);
    expect(res.body.data.lessonCount).toBe(1);
    expect(res.body.data.totalDurationSeconds).toBe(120);
  });

  it('returns 404 for a draft course', async () => {
    db.findUnique.mockResolvedValue({ id: 'c1', published: false, lessons: [] });
    const res = await request(app).get('/api/courses/c1');
    expect(res.status).toBe(404);
  });

  it('returns 404 when the course does not exist', async () => {
    db.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/courses/nope');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/courses/categories', () => {
  it('returns a plain list of category names', async () => {
    db.findMany.mockResolvedValue([{ category: 'Data' }, { category: 'Design' }]);
    const res = await request(app).get('/api/courses/categories');
    expect(res.body.data).toEqual(['Data', 'Design']);
  });
});

describe('admin routes are protected', () => {
  it('GET /api/admin/courses: 401 without login, 403 for a learner', async () => {
    expect((await request(app).get('/api/admin/courses')).status).toBe(401);
    expect((await request(app).get('/api/admin/courses').set(loginAs('LEARNER'))).status).toBe(403);
  });

  it('POST /api/courses: 401 without login, 403 for a learner', async () => {
    expect((await request(app).post('/api/courses').send(newCourse)).status).toBe(401);
    expect((await request(app).post('/api/courses').set(loginAs('LEARNER')).send(newCourse)).status).toBe(403);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('PATCH and DELETE are blocked for a learner', async () => {
    expect((await request(app).patch('/api/courses/c1').set(loginAs('LEARNER')).send({ title: 'New' })).status).toBe(403);
    expect((await request(app).delete('/api/courses/c1').set(loginAs('LEARNER'))).status).toBe(403);
  });

  it('admin list includes drafts', async () => {
    db.findMany.mockResolvedValue([]);
    db.count.mockResolvedValue(0);

    const res = await request(app).get('/api/admin/courses').set(loginAs('ADMIN'));

    expect(res.status).toBe(200);
    expect(db.findMany.mock.calls[0]?.[0].where).not.toHaveProperty('published');
  });
});

describe('POST /api/courses (admin)', () => {
  it('creates a course and makes a slug from the title', async () => {
    db.findUnique.mockResolvedValue(null); // slug is free
    db.create.mockImplementation(async ({ data }) => ({ id: 'c1', ...data }));

    const res = await request(app).post('/api/courses').set(loginAs('ADMIN')).send(newCourse);

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('modern-react');
  });

  it('adds a random ending when the slug is already taken', async () => {
    db.findUnique.mockResolvedValue({ id: 'other' });
    db.create.mockImplementation(async ({ data }) => ({ id: 'c2', ...data }));

    const res = await request(app).post('/api/courses').set(loginAs('ADMIN')).send(newCourse);

    expect(res.body.data.slug).toMatch(/^modern-react-[a-z0-9]+$/);
  });

  it.each([
    ['a short title', { title: 'ab' }, 'title'],
    ['a missing category', { category: '' }, 'category'],
    ['a bad thumbnail url', { thumbnailUrl: 'not a url' }, 'thumbnailUrl'],
  ])('rejects %s', async (_name, change, field) => {
    const res = await request(app)
      .post('/api/courses')
      .set(loginAs('ADMIN'))
      .send({ ...newCourse, ...change });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe('PATCH and DELETE /api/courses/:id (admin)', () => {
  it('updates only the fields that were sent', async () => {
    db.findUnique.mockResolvedValue({ id: 'c1' });
    db.update.mockImplementation(async ({ data }) => ({ id: 'c1', ...data }));

    const res = await request(app).patch('/api/courses/c1').set(loginAs('ADMIN')).send({ published: true });

    expect(res.status).toBe(200);
    expect(db.update.mock.calls[0]?.[0].data).toEqual({ published: true });
  });

  it('returns 404 when the course does not exist', async () => {
    db.findUnique.mockResolvedValue(null);
    expect((await request(app).patch('/api/courses/x').set(loginAs('ADMIN')).send({ title: 'Hello' })).status).toBe(404);
    expect((await request(app).delete('/api/courses/x').set(loginAs('ADMIN'))).status).toBe(404);
  });

  it('deletes a course', async () => {
    db.findUnique.mockResolvedValue({ id: 'c1' });
    const res = await request(app).delete('/api/courses/c1').set(loginAs('ADMIN'));
    expect(res.status).toBe(204);
    expect(db.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });
});