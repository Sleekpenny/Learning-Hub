"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useRefreshLearning } from "@/lib/queries";
import { saveProgressAction } from "@/actions/services";

const useLessonProgress = (lessonId: string, courseId: string) => {
  const refresh = useRefreshLearning();

  // Quiet save: where the learner is in the video. No message, nothing to refresh.
  const savePosition = useCallback(
    (positionSeconds: number) => {
      void saveProgressAction(lessonId, { positionSeconds: Math.floor(positionSeconds) });
    },
    [lessonId],
  );

  // The lesson is finished: save it, tell the learner, and reload the numbers that show progress
  const complete = useCallback(
    async (positionSeconds: number) => {
      const result = await saveProgressAction(lessonId, { positionSeconds: Math.floor(positionSeconds), completed: true });
      if (!result.success) {
        toast.error(result.message);
        return false;
      }
      toast.success(result.data.course.completed ? "Course completed. Well done!" : "Lesson completed");
      await refresh(courseId);
      return true;
    },
    [lessonId, courseId, refresh],
  );

  return { savePosition, complete };
}

export default useLessonProgress 