import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/status";
import { LessonDetail } from "@/types/global";

type Props = {
  lesson: LessonDetail["lesson"];
  completed: boolean;
  // false for admins: no progress to mark
  canMark: boolean;
  marking: boolean;
  nextLessonId: string | null;
  onMarkComplete: () => void;
};

// Under the video: the title, the course it belongs to, the description and the buttons
export function LessonInfo({ lesson, completed, canMark, marking, nextLessonId, onMarkComplete }: Props) {
  return (
    <div>
      <Link href={`/courses/${lesson.course.id}`} className="text-sm font-medium text-primary hover:underline">
        {lesson.course.title}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
        {completed && <StatusBadge status="COMPLETED" />}
      </div>

      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ClockIcon className="size-4" /> Lesson {lesson.position} · {formatDuration(lesson.durationSeconds)}
      </p>

      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{lesson.description}</p>

      {!canMark && <p className="mt-4 text-sm text-muted-foreground">Admin preview: your progress is not saved.</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {canMark && !completed && (
          <Button variant="outline" onClick={onMarkComplete} loading={marking}>
            <CheckIcon /> Mark as complete
          </Button>
        )}
        {nextLessonId && (
          <Button asChild>
            <Link href={`/lessons/${nextLessonId}`}>
              Next lesson <ArrowRightIcon />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}