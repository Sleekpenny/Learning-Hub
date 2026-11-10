import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, ClockIcon } from "lucide-react";
import { formatDuration, lessonLabel } from "@/lib/format";
import { CourseDetail } from "@/types/global";

// The top of the course page: category, title, description and the totals
export function CourseHero({ course }: { course: CourseDetail }) {
  return (
    <div>
      <Link
        href="/courses"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" /> All courses
      </Link>

      <span className="mt-5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{course.category}</span>
      <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{course.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <BookOpenIcon className="size-4" /> {lessonLabel(course.lessonCount)}
        </span>
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="size-4" /> {formatDuration(course.totalDurationSeconds)} in total
        </span>
      </div>
    </div>
  );
}