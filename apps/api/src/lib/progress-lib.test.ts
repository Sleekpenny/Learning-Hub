import { describe, expect, it } from 'vitest';
import { courseProgress, lessonStatus } from '../src/lib/progress';

describe('lessonStatus', () => {
  it('is NOT_STARTED when there is no progress row', () => {
    expect(lessonStatus(undefined)).toBe('NOT_STARTED');
  });

  it('is NOT_STARTED when the position is still 0', () => {
    expect(lessonStatus({ completed: false, positionSeconds: 0 })).toBe('NOT_STARTED');
  });

  it('is IN_PROGRESS once the video was watched a bit', () => {
    expect(lessonStatus({ completed: false, positionSeconds: 12 })).toBe('IN_PROGRESS');
  });

  it('is COMPLETED when completed, whatever the position', () => {
    expect(lessonStatus({ completed: true, positionSeconds: 0 })).toBe('COMPLETED');
  });
});

describe('courseProgress', () => {
  const lessons = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

  it('starts at 0% with NOT_STARTED and resumes at the first lesson', () => {
    const result = courseProgress(lessons, []);
    expect(result).toEqual({
      lessonCount: 4,
      completedLessons: 0,
      progressPercent: 0,
      status: 'NOT_STARTED',
      resumeLessonId: 'a',
    });
  });

  it('counts completed lessons and resumes at the first unfinished one', () => {
    const rows = [
      { lessonId: 'a', completed: true, positionSeconds: 60 },
      { lessonId: 'b', completed: true, positionSeconds: 60 },
      { lessonId: 'c', completed: false, positionSeconds: 20 },
    ];
    const result = courseProgress(lessons, rows);
    expect(result.completedLessons).toBe(2);
    expect(result.progressPercent).toBe(50);
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.resumeLessonId).toBe('c');
  });

  it('is IN_PROGRESS when a lesson was started but none are finished', () => {
    const result = courseProgress(lessons, [{ lessonId: 'b', completed: false, positionSeconds: 5 }]);
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.progressPercent).toBe(0);
  });

  it('is COMPLETED at 100% and resumes at the first lesson', () => {
    const rows = lessons.map((l) => ({ lessonId: l.id, completed: true, positionSeconds: 10 }));
    const result = courseProgress(lessons, rows);
    expect(result.status).toBe('COMPLETED');
    expect(result.progressPercent).toBe(100);
    expect(result.resumeLessonId).toBe('a');
  });

  it('rounds the percentage', () => {
    const rows = [{ lessonId: 'a', completed: true, positionSeconds: 1 }];
    expect(courseProgress([{ id: 'a' }, { id: 'b' }, { id: 'c' }], rows).progressPercent).toBe(33);
  });

  it('handles a course with no lessons', () => {
    expect(courseProgress([], [])).toEqual({
      lessonCount: 0,
      completedLessons: 0,
      progressPercent: 0,
      status: 'NOT_STARTED',
      resumeLessonId: null,
    });
  });
});