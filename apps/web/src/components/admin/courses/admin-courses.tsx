"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { CourseSearch } from "../../courses/course-search";
import { Button } from "../../ui/button";
import { Skeleton, StateMessage } from "../../ui/state-message";
import { useAdminCourses, useRefreshCourses } from "@/lib/queries";
import { Course } from "@/types/global";
import { deleteCourseAction } from "@/actions/services";
import AdminHeader from "../admin-header";
import { CoursesTable } from "./courses-table";
import { CourseFormModal } from "./course-form-modal";
import LessonsModal from "./lesson-modal";
import ConfirmDialog from "../confirm-dialog";


const PAGE_SIZE = 10;

type Modal = { type: "create" } | { type: "edit" | "lessons" | "delete"; course: Course } | null;

const AdminCoursesView = () => {
  const refresh = useRefreshCourses();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Modal>(null);
  const courses = useAdminCourses({ q, page, limit: PAGE_SIZE });

  const total = courses.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const close = () => setModal(null);

  async function remove(course: Course) {
    const result = await deleteCourseAction(course.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(`"${course.title}" was deleted`);
    await refresh(course.id);
    if (page > 1 && courses.data?.courses.length === 1) setPage(page - 1);
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Courses"
        description={`${total} ${total === 1 ? "course" : "courses"}, drafts included.`}
        action={
          <Button onClick={() => setModal({ type: "create" })}>
            <PlusIcon /> New course
          </Button>
        }
      />

      <div className="max-w-xl">
        <CourseSearch
          value={q}
          onSearch={(text) => {
            setQ(text);
            setPage(1);
          }}
        />
      </div>

      {courses.isPending ? (
        <div role="status" aria-label="Loading courses" className="space-y-px overflow-hidden rounded-2xl border bg-white">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-none" />
          ))}
        </div>
      ) : courses.isError ? (
        <StateMessage tone="error" title="We could not load the courses" text={courses.error.message} action={<Button onClick={() => courses.refetch()}>Try again</Button>} />
      ) : courses.data.courses.length === 0 ? (
        <StateMessage
          title={q ? "No courses match your search" : "No courses yet"}
          text={q ? "Try a different word." : "Create the first course to get started."}
          action={!q && <Button onClick={() => setModal({ type: "create" })}>New course</Button>}
        />
      ) : (
        <CoursesTable
          courses={courses.data.courses}
          loading={courses.isPlaceholderData}
          onEdit={(course) => setModal({ type: "edit", course })}
          onLessons={(course) => setModal({ type: "lessons", course })}
          onDelete={(course) => setModal({ type: "delete", course })}
        />
      )}

      {modal?.type === "create" && <CourseFormModal open onOpenChange={(open) => !open && close()} />}
      {modal?.type === "edit" && <CourseFormModal open onOpenChange={(open) => !open && close()} course={modal.course} />}
      {modal?.type === "lessons" && <LessonsModal course={modal.course} onClose={close} />}
      {modal?.type === "delete" && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && close()}
          title="Delete this course?"
          description={`"${modal.course.title}" will be deleted with its lessons and every learner's progress in it. This cannot be undone.`}
          confirmLabel="Delete course"
          onConfirm={() => remove(modal.course)}
        />
      )}
    </div>
  );
}

export default AdminCoursesView;