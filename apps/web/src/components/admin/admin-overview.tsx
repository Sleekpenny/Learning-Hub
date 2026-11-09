"use client";

import Link from "next/link";
import { BookOpenIcon, CheckCheckIcon, FileEditIcon, GraduationCapIcon, UsersIcon, VideoIcon } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "../ui/button";
import { Skeleton, StateMessage } from "../ui/state-message";
import AdminHeader from "./admin-header";
import { useAdminDashboard } from "@/lib/queries";
import TopCourses from "./top-courses";
import { LearnersTable } from "./learners-table";
import StatCard from "./stat-card";
import RecentEnrollments from "./recent-enrollments";


// The admin home: the numbers, the latest enrollments and the most popular courses.
// All of it comes from /api/admin/dashboard, which the API only answers for admins.
const AdminOverview = () => {
  const { user } = useCurrentUser();
  const dashboard = useAdminDashboard();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Overview"
        description={`Signed in as ${user?.email}`}
        action={
          <Button asChild>
            <Link href="/admin/courses">Manage courses</Link>
          </Button>
        }
      />

      {dashboard.isPending ? (
        <div className="space-y-6" role="status" aria-label="Loading the overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : dashboard.isError ? (
        <StateMessage
          tone="error"
          title="We could not load the overview"
          text={dashboard.error.message}
          action={<Button onClick={() => dashboard.refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Learners" value={dashboard.data.totals.learners} icon={<UsersIcon className="size-5" />} />
            <StatCard label="Published courses" value={dashboard.data.totals.publishedCourses} icon={<BookOpenIcon className="size-5" />} href="/admin/courses" />
            <StatCard label="Draft courses" value={dashboard.data.totals.draftCourses} icon={<FileEditIcon className="size-5" />} href="/admin/courses" />
            <StatCard label="Enrollments" value={dashboard.data.totals.enrollments} icon={<GraduationCapIcon className="size-5" />} />
            <StatCard label="Courses completed" value={dashboard.data.totals.completedEnrollments} icon={<CheckCheckIcon className="size-5" />} />
            <StatCard label="Lessons completed" value={dashboard.data.totals.lessonsCompleted} icon={<VideoIcon className="size-5" />} />
          </dl>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentEnrollments items={dashboard.data.recentEnrollments} />
            <TopCourses items={dashboard.data.topCourses} />
          </div>

          <LearnersTable />
        </>
      )}
    </div>
  );
}

export default AdminOverview;