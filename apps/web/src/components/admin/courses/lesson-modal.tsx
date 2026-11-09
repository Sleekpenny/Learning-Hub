"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/format";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Skeleton, StateMessage } from "../../ui/state-message";
import { AdminLesson, Course } from "@/types/global";
import { useAdminCourse, useRefreshCourses } from "@/lib/queries";
import { deleteLessonAction } from "@/actions/services";
import { LessonForm } from "./lesson-fom";
import ConfirmDialog from "../confirm-dialog";


type Props = {
  course: Course;
  onClose: () => void;
};

// What the modal is showing: the list, the add form ("new"), or the edit form for one lesson
type View = "list" | "new" | AdminLesson;

// All the lessons of one course in a single modal. The same modal swaps to a form to add or edit a lesson.
const LessonsModal = ({ course, onClose }: Props) => {
  const refresh = useRefreshCourses();
  const lessons = useAdminCourse(course.id);
  const [view, setView] = useState<View>("list");
  const [toDelete, setToDelete] = useState<AdminLesson | null>(null);

  async function remove(lesson: AdminLesson) {
    const result = await deleteLessonAction(lesson.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success("Lesson deleted");
    await refresh(course.id);
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{view === "list" ? "Lessons" : view === "new" ? "Add a lesson" : "Edit lesson"}</DialogTitle>
            <DialogDescription>{course.title}</DialogDescription>
          </DialogHeader>

          {view !== "list" ? (
            <LessonForm courseId={course.id} lesson={view === "new" ? undefined : view} onBack={() => setView("list")} />
          ) : lessons.isPending ? (
            <div role="status" aria-label="Loading lessons" className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : lessons.isError ? (
            <StateMessage tone="error" title="We could not load the lessons" text={lessons.error.message} action={<Button onClick={() => lessons.refetch()}>Try again</Button>} />
          ) : (
            <div className="space-y-4">
              {lessons.data.lessons.length === 0 ? (
                <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">No lessons yet.</p>
              ) : (
                <ol className="divide-y rounded-xl border">
                  {lessons.data.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{lesson.position}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(lesson.durationSeconds)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-9" onClick={() => setView(lesson)}>
                        <PencilIcon />
                        <span className="sr-only">Edit {lesson.title}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-9 text-destructive hover:text-destructive" onClick={() => setToDelete(lesson)}>
                        <Trash2Icon />
                        <span className="sr-only">Delete {lesson.title}</span>
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
              <Button onClick={() => setView("new")} className="w-full sm:w-auto">
                <PlusIcon /> Add lesson
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {toDelete && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setToDelete(null)}
          title="Delete this lesson?"
          description={`"${toDelete.title}" and every learner's progress in it will be removed. This cannot be undone.`}
          confirmLabel="Delete lesson"
          onConfirm={() => remove(toDelete)}
        />
      )}
    </>
  );
}

export default LessonsModal;