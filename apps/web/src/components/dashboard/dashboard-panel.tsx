"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/auth";
import { useDashboard } from "@/lib/queries";
import { Skeleton, StateMessage } from "@/components/ui/state-message";
import { CourseGridSkeleton } from "@/components/courses/course-grid-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import CourseCard from "@/components/courses/course-card";
import { ProgressOverview } from "./progressive-overview";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

const DashboardPanel = () => {
  const { user } = useCurrentUser();
  const dashboard = useDashboard();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1.5 text-slate-600">Pick up where you left off.</p>

      {dashboard.isPending ? (
        <div className="mt-8 space-y-10">
          <div role="status" aria-label="Loading your dashboard" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
          <CourseGridSkeleton count={3} />
        </div>
      ) : dashboard.isError ? (
        <div className="mt-8">
          <StateMessage
            tone="error"
            title="We could not load your dashboard"
            text={dashboard.error.message}
            action={<Button onClick={() => dashboard.refetch()}>Try again</Button>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Enrolled courses" value={dashboard.data.stats.enrolledCourses} />
            <StatCard label="In progress" value={dashboard.data.stats.inProgress} />
            <StatCard label="Completed" value={dashboard.data.stats.completed} />
            <StatCard label="Lessons completed" value={dashboard.data.stats.lessonsCompleted} />
          </div>
             <ProgressOverview />
          <section className="mt-12" aria-labelledby="continue-heading">
            <div className="flex items-center justify-between">
              <h2 id="continue-heading" className="text-xl font-bold text-slate-900">
                Continue learning
              </h2>
              <Link href="/courses" className="text-sm font-semibold text-primary hover:text-primary">
                Browse all courses
              </Link>
            </div>

            <div className="mt-5">
              {dashboard.data.continueLearning.length === 0 ? (
                <StateMessage
                  title="Nothing to continue yet"
                  text="Enroll in a course and it will show up here with your progress."
                  action={
                    <Link href="/courses" className={buttonVariants()}>
                      Find a course
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {dashboard.data.continueLearning.map((course) => (
                    <CourseCard key={course.id} course={course} progress={course} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPanel