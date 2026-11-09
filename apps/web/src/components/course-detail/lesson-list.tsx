
import { StateMessage } from "../ui/state-message";
import { LessonRow } from "../lesson/lesson-row";
import { LessonSummary, Status } from "@/types/global";

type Props = {
  lessons: LessonSummary[];
  // lesson id -> my status and position. Empty when I am not enrolled.
  progressById: Map<string, { status: Status; positionSeconds: number }>;
  // true when the user is enrolled (or is an admin): rows open the lesson page
  canWatch: boolean;
  onLockedClick: (lesson: LessonSummary) => void;
};

export function LessonList({ lessons, progressById, canWatch, onLockedClick }: Props) {
  if (lessons.length === 0) {
    return <StateMessage title="No lessons yet" text="This course has no lessons so far. Check back soon." />;
  }

  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-white shadow-sm">
      {lessons.map((lesson, index) => {
        const mine = progressById.get(lesson.id);
        const percent = mine && lesson.durationSeconds > 0 ? Math.min(100, Math.round((mine.positionSeconds / lesson.durationSeconds) * 100)) : 0;
        return (
          <li key={lesson.id}>
            <LessonRow
              number={index + 1}
              title={lesson.title}
              durationSeconds={lesson.durationSeconds}
              status={mine?.status}
              percent={percent}
              locked={!canWatch}
              href={`/lessons/${lesson.id}`}
              onLockedClick={() => onLockedClick(lesson)}
            />
          </li>
        );
      })}
    </ul>
  );
}