export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

type LessonRow = { completed: boolean; positionSeconds: number };

// Status of one lesson for one learner. No row means they never opened it.
export function lessonStatus(row?: LessonRow): Status {
  if (row?.completed) return 'COMPLETED';
  if (row && row.positionSeconds > 0) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

// Progress of one learner in one course.
// lessons: every lesson of the course in order. rows: the learner's progress rows for them.
export function courseProgress(lessons: { id: string }[], rows: (LessonRow & { lessonId: string })[]) {
  const rowFor = (lessonId: string) => rows.find((row) => row.lessonId === lessonId);

  const completedLessons = lessons.filter((lesson) => rowFor(lesson.id)?.completed).length;
  const started = lessons.some((lesson) => lessonStatus(rowFor(lesson.id)) !== 'NOT_STARTED');

  let status: Status = 'NOT_STARTED';
  if (lessons.length > 0 && completedLessons === lessons.length) status = 'COMPLETED';
  else if (started) status = 'IN_PROGRESS';

  // Where "Continue" should take them: the first lesson they have not finished
  const resumeLesson = lessons.find((lesson) => !rowFor(lesson.id)?.completed) ?? lessons[0];

  return {
    lessonCount: lessons.length,
    completedLessons,
    progressPercent: lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100),
    status,
    resumeLessonId: resumeLesson?.id ?? null,
  };
}