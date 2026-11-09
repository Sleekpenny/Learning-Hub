import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ProgressBar, StatusBadge } from "../ui/status";
import { CourseDetail, CourseProgress } from "@/types/global";
import pickGradient from "../courses/pickGradient";

type Props = {
  course: CourseDetail;
  // undefined until the progress has loaded, or when nobody is logged in
  progress: CourseProgress | undefined;
  isAdmin: boolean;
  // true while we still do not know if the user is enrolled
  checking: boolean;
  onEnroll: () => void;
};

// The card next to the lessons. It shows the Enroll button, or the learner's progress once enrolled.
export function CourseEnrollPanel({ course, progress, isAdmin, checking, onEnroll }: Props) {
  const enrolled = progress?.enrolled ?? false;
  const firstLessonId = course.lessons[0]?.id;
  const continueId = progress?.resumeLessonId ?? firstLessonId;

  return (
    <aside className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          // Thumbnails can come from any website, so a plain img is used instead of next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl font-bold text-white/90 ${pickGradient(course.title)}`}
          >
            {course.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        {isAdmin ? (
          <>
            <p className="text-sm text-muted-foreground">You are signed in as an admin, so every lesson is open for you to preview.</p>
            {firstLessonId && (
              <Button asChild size="lg" className="w-full">
                <Link href={`/lessons/${firstLessonId}`}>
                  <PlayIcon /> Preview first lesson
                </Link>
              </Button>
            )}
          </>
        ) : enrolled && progress ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={progress.status} />
              <span className="text-sm font-semibold">{progress.progressPercent}%</span>
            </div>
            <ProgressBar percent={progress.progressPercent} label={`Progress in ${course.title}`} />
            <p className="text-sm text-muted-foreground">
              {progress.completedLessons} of {progress.lessonCount} lessons completed
            </p>
            {continueId && (
              <Button asChild size="lg" className="w-full">
                <Link href={`/lessons/${continueId}`}>
                  <PlayIcon />
                  {progress.status === "COMPLETED" ? "Watch again" : progress.status === "IN_PROGRESS" ? "Continue learning" : "Start course"}
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Enroll to unlock all {course.lessonCount} {course.lessonCount === 1 ? "lesson" : "lessons"} and keep track of your progress.
            </p>
            <Button size="lg" className="w-full" onClick={onEnroll} loading={checking}>
              Enroll in this course
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}