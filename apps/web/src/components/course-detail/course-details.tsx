"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/lib/auth";
import { useCourse, useCourseProgress } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { Button } from "../ui/button";
import { StateMessage } from "../ui/state-message";
import { CourseHero } from "./course-hero";
import { LessonList } from "./lesson-list";
import { CourseDetailSkeleton } from "./course-detail-skeleton";
import { LessonSummary } from "@/types/global";
import { CourseEnrollPanel } from "./course-enroll-panel";
import { EnrollDialog } from "./enroll-dialog";

// The course page. It loads the course and my progress, and decides what a click on a lesson does:
//  - enrolled (or admin): the lesson row is a link to the lesson page
//  - not enrolled: the row opens the enroll dialog
export function CourseDetail({ id }: { id: string }) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const course = useCourse(id);
  const progress = useCourseProgress(id, !!user);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedLesson, setClickedLesson] = useState<LessonSummary | null>(null);

  if (course.isPending) return <CourseDetailSkeleton />;

  if (course.isError) {
    const notFound = course.error instanceof ApiError && course.error.status === 404;
    return (
      <StateMessage
        tone={notFound ? "neutral" : "error"}
        title={notFound ? "We could not find that course" : "We could not load this course"}
        text={notFound ? "It may have been removed, or the link is wrong." : course.error.message}
        action={
          notFound ? (
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          ) : (
            <Button onClick={() => course.refetch()}>Try again</Button>
          )
        }
      />
    );
  }

  const isAdmin = user?.role === "ADMIN";
  const enrolled = progress.data?.enrolled ?? false;
  const canWatch = enrolled || isAdmin;
  // Still working out whether this user is enrolled: do not open the dialog for someone who already is
  const checking = userLoading || (!!user && progress.isPending);
  const progressById = new Map(progress.data?.lessons.map((lesson) => [lesson.id, lesson]));

  function openEnroll(lesson: LessonSummary | null) {
    if (checking) return;
    setClickedLesson(lesson);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <CourseHero course={course.data} />

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-24">
            <CourseEnrollPanel
              course={course.data}
              progress={progress.data}
              isAdmin={isAdmin}
              checking={checking}
              onEnroll={() => openEnroll(null)}
            />
          </div>
        </div>

        <section aria-labelledby="lessons-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="lessons-heading" className="text-xl font-bold">
              Lessons
            </h2>
            {!canWatch && <p className="text-sm text-muted-foreground">Enroll to start watching</p>}
          </div>
          <LessonList lessons={course.data.lessons} progressById={progressById} canWatch={canWatch} onLockedClick={openEnroll} />
        </section>
      </div>

      <EnrollDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={course.data}
        lesson={clickedLesson}
        loggedIn={!!user}
      />
    </>
  );
}