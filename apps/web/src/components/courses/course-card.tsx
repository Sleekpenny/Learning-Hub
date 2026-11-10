import { BookIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { ProgressBar, StatusBadge } from "../ui/status";
import { Props } from "@/types/global";
import pickGradient from "./pickGradient";
import { formatDuration, lessonLabel } from "@/lib/format";

const CourseCard = ({ course, progress }: Props) => {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-4xl font-bold text-white/90 ${pickGradient(course.title)}`}
            aria-hidden="true"
          >
            {course.title.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
          {course.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-foreground">
          {/* The link covers the whole card, so the card is one big click target */}
          <Link href={`/courses/${course.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookIcon /> {lessonLabel(course.lessonCount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon /> {formatDuration(course.totalDurationSeconds)}
          </span>
        </div>

        {progress && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <StatusBadge status={progress.status} />
              <span className="text-xs font-medium text-muted-foreground">{progress.progressPercent}%</span>
            </div>
            <ProgressBar percent={progress.progressPercent} label={`Progress in ${course.title}`} />
          </div>
        )}
      </div>
    </article>
  );

}
export default CourseCard;