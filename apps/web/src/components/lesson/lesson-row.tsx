import Link from "next/link";
import { CheckIcon, ChevronRightIcon, ClockIcon, LockIcon } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProgressBar, StatusBadge } from "../ui/status";
import { Status } from "@/types/global";

type Props = {
  number: number;
  title: string;
  durationSeconds: number;
  status?: Status;
  locked?: boolean;
  current?: boolean;
  percent?: number;
  href?: string;
  onLockedClick?: () => void;
};

// One lesson in a list: number, title, duration and a status badge.
// Used on the course page and in the lesson page's side list.
export function LessonRow({ number, title, durationSeconds, status, locked, current, percent, href, onLockedClick }: Props) {
  const completed = status === "COMPLETED";
  // Not started needs no badge. Only show the ones that tell the learner something.
  const badge = status === "COMPLETED" || status === "IN_PROGRESS" ? <StatusBadge status={status} /> : null;

  const content = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          completed ? "bg-emerald-100 text-emerald-700" : current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {completed ? <CheckIcon className="size-4" /> : number}
      </span>

      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm leading-snug font-medium", current && "text-primary")}>{title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3.5" /> {formatDuration(durationSeconds)}
          </span>
          {/* On a phone the badge sits under the title, on bigger screens it sits at the end of the row */}
          {badge && <span className="sm:hidden">{badge}</span>}
        </span>
        {status === "IN_PROGRESS" && percent !== undefined && percent > 0 && (
          <span className="mt-2 block max-w-48">
            <ProgressBar percent={percent} label={`Watched ${percent}% of ${title}`} />
          </span>
        )}
      </span>

      {badge && <span className="hidden sm:block">{badge}</span>}
      {locked ? (
        <LockIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const className = cn(
    "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
    current && "bg-primary/5",
  );

  if (href && !locked) {
    return (
      <Link href={href} aria-current={current ? "true" : undefined} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onLockedClick} aria-label={`${title}. Locked, enroll to watch`} className={className}>
      {content}
    </button>
  );
}