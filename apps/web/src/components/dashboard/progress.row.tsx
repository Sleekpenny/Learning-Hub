"use client";

import Link from "next/link";
import { lessonLabel } from "@/lib/format";
import { useFillTo } from "@/lib/use-fill";
import { buttonVariants } from "../ui/button";
import { StatusBadge } from "../ui/status";
import { MyCourse, Status } from "@/types/global";
import pickGradient from "../courses/pickGradient";

const actionLabel: Record<Status, string> = {
  NOT_STARTED: "Start",
  IN_PROGRESS: "Continue",
  COMPLETED: "Review",
};

// One enrolled course: picture, title, how many lessons are done, a bar with the percentage, and a button
const CourseProgressRow = ({ course }: { course: MyCourse }) => {
  const width = useFillTo(course.progressPercent);
  const completed = course.status === "COMPLETED";

  return (
    <li className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {course.thumbnailUrl ? (
          // Thumbnails can come from any website, so a plain img is used instead of next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-bold text-white/90 ${pickGradient(course.title)}`}
          >
            {course.title.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* On a phone the badge sits under the title so the title gets the full width */}
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <Link href={`/courses/${course.id}`} className="block font-semibold hover:text-primary sm:truncate">
                {course.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground sm:truncate">
                {course.category} · {course.completedLessons} of {lessonLabel(course.lessonCount)}
              </p>
            </div>
            <StatusBadge status={course.status} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={`${course.title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={course.progressPercent}
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${completed ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-11 text-right text-sm font-bold tabular-nums">{course.progressPercent}%</span>
          </div>
        </div>
      </div>

      <Link
        href={`/courses/${course.id}`}
        className={buttonVariants({ variant: completed ? "outline" : "default", size: "sm", className: "sm:w-28" })}
      >
        {actionLabel[course.status]}
        <span className="sr-only"> {course.title}</span>
      </Link>
    </li>
  );
}
export default CourseProgressRow;