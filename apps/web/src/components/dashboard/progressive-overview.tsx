"use client";

import Link from "next/link";
import { useState } from "react";
import { useMyCourses } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Skeleton, StateMessage } from "../ui/state-message";
import { MyCourse, Status } from "@/types/global";
import CourseProgressRow from "./progress.row";
import ProgressSummary from "./progress-summary";

type Filter = "ALL" | Status;

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "COMPLETED", label: "Completed" },
];

// In progress first (the one you opened last on top), then not started, then completed
const order: Record<Status, number> = { IN_PROGRESS: 0, NOT_STARTED: 1, COMPLETED: 2 };

function sortCourses(courses: MyCourse[]) {
  return [...courses].sort(
    (a, b) => order[a.status] - order[b.status] || b.lastAccessedAt.localeCompare(a.lastAccessedAt),
  );
}

// The "Your progress" card on the dashboard: one overall ring and a progress bar for every enrolled course
export function ProgressOverview() {
  const courses = useMyCourses(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  return (
    <section className="mt-12" aria-labelledby="progress-heading">
      <h2 id="progress-heading" className="text-xl font-bold">
        Your progress
      </h2>

      <div className="mt-5 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
        {courses.isPending ? (
          <div role="status" aria-label="Loading your progress" className="space-y-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : courses.isError ? (
          <StateMessage
            tone="error"
            title="We could not load your progress"
            text={courses.error.message}
            action={<Button onClick={() => courses.refetch()}>Try again</Button>}
          />
        ) : courses.data.length === 0 ? (
          <StateMessage
            title="You have not enrolled in a course yet"
            text="Enroll in a course and your progress will be tracked here."
            action={
              <Link href="/courses" className={buttonVariants()}>
                Find a course
              </Link>
            }
          />
        ) : (
          <Content courses={courses.data} filter={filter} onFilter={setFilter} />
        )}
      </div>
    </section>
  );
}

function Content({ courses, filter, onFilter }: { courses: MyCourse[]; filter: Filter; onFilter: (value: Filter) => void }) {
  const countOf = (value: Filter) => (value === "ALL" ? courses.length : courses.filter((c) => c.status === value).length);
  const shown = sortCourses(courses).filter((course) => filter === "ALL" || course.status === filter);

  return (
    <div className="space-y-6">
      <ProgressSummary courses={courses} />

      <div role="group" aria-label="Filter courses by status" className="flex flex-wrap gap-2 border-t pt-6">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilter(item.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              filter === item.value ? "border-primary bg-primary text-white" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {item.label} <span className="opacity-70">{countOf(item.value)}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "course" : "courses"} shown
      </p>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          No courses with this status yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((course) => (
            <CourseProgressRow key={course.id} course={course} />
          ))}
        </ul>
      )}
    </div>
  );
}