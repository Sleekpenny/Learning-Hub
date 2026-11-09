"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";
import { useLesson } from "@/lib/queries";
import { Button } from "../ui/button";
import { StateMessage } from "../ui/state-message";
import LessonSkeleton from "./lesson.skeleton";
import useLessonProgress from "./use-lesson-progress";
import { LessonInfo } from "./lesson-info";
import VideoPlayer from "./video-player";
import { UpNextList } from "./up-next-list";

// The lesson page. The id comes from the URL, and the lesson's details are fetched with it.
const LessonView = ({ id }: { id: string }) => {
  const { user } = useCurrentUser();
  const lesson = useLesson(id);
  const { savePosition, complete } = useLessonProgress(id, lesson.data?.lesson.courseId ?? "");
  const [marking, setMarking] = useState(false);

  if (lesson.isPending) return <LessonSkeleton />;

  if (lesson.isError) {
    const error = lesson.error;
    const notEnrolled = error instanceof ApiError && error.code === "NOT_ENROLLED";
    const notFound = error instanceof ApiError && error.status === 404;

    if (notEnrolled || notFound) {
      return (
        <StateMessage
          title={notEnrolled ? "Enroll to watch this lesson" : "We could not find that lesson"}
          text={notEnrolled ? "Lessons open once you are enrolled in the course. Pick the course and enroll to start." : "It may have been removed, or the link is wrong."}
          action={
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        />
      );
    }
    return <StateMessage tone="error" title="We could not load this lesson" text={error.message} action={<Button onClick={() => lesson.refetch()}>Try again</Button>} />;
  }

  const { lesson: details, progress, nextLessonId, lessons } = lesson.data;
  const canSave = user?.role !== "ADMIN";

  async function markComplete() {
    setMarking(true);
    await complete(details.durationSeconds);
    setMarking(false);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="min-w-0 space-y-6">
        {/* key: a new lesson gets a fresh player that starts from its own saved position */}
        <VideoPlayer
          key={details.id}
          src={details.videoUrl}
          title={details.title}
          startAt={progress.completed ? 0 : progress.positionSeconds}
          canSave={canSave}
          onSave={savePosition}
          onEnded={(duration) => {
            if (!progress.completed) void complete(duration);
          }}
        />
        <LessonInfo
          lesson={details}
          completed={progress.completed}
          canMark={canSave}
          marking={marking}
          nextLessonId={nextLessonId}
          onMarkComplete={markComplete}
        />
      </div>

      <div className="lg:sticky lg:top-24">
        <UpNextList lessons={lessons} currentId={details.id} />
      </div>
    </div>
  );
}
export default LessonView;