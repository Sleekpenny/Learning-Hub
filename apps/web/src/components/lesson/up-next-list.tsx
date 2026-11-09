import { LessonCard } from "@/types/global";
import { LessonRow } from "./lesson-row";

type Props = {
  lessons: LessonCard[];
  currentId: string;
};

// The other lessons of the course, next to the video. Each one shows its status.
export function UpNextList({ lessons, currentId }: Props) {
  const done = lessons.filter((lesson) => lesson.status === "COMPLETED").length;

  return (
    <section aria-labelledby="course-lessons" className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3.5">
        <h2 id="course-lessons" className="font-bold">
          Course lessons
        </h2>
        <span className="text-xs text-muted-foreground">
          {done} of {lessons.length} completed
        </span>
      </div>

      <ul className="max-h-[28rem] divide-y overflow-y-auto">
        {lessons.map((lesson, index) => (
          <li key={lesson.id}>
            <LessonRow
              number={index + 1}
              title={lesson.title}
              durationSeconds={lesson.durationSeconds}
              status={lesson.status}
              current={lesson.id === currentId}
              percent={lesson.durationSeconds > 0 ? Math.min(100, Math.round((lesson.positionSeconds / lesson.durationSeconds) * 100)) : 0}
              href={`/lessons/${lesson.id}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}