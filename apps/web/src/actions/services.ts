import { api } from "@/lib/api";
import { toFailure } from "@/lib/utils";
import { ActionResult, AdminLesson, Course, CourseInput, LessonInput, ProgressSaved } from "@/types/global";

export async function enrollAction(courseId: string): Promise<ActionResult<{ alreadyEnrolled: boolean }>> {
  try {
    await api(`/courses/${courseId}/enroll`, { method: "POST" });
    return { success: true, data: { alreadyEnrolled: false } };
  } catch (error) {
    const failure = toFailure(error);
    if (failure.code === "ALREADY_ENROLLED") return { success: true, data: { alreadyEnrolled: true } };
    return failure;
  }
}

export async function saveProgressAction(
  lessonId: string,
  input: { positionSeconds: number; completed?: boolean },
): Promise<ActionResult<ProgressSaved>> {
  try {
    const data = await api<ProgressSaved>(`/lessons/${lessonId}/progress`, { method: "PUT", body: input });
    return { success: true, data };
  } catch (error) {
    return toFailure(error);
  }
}

export async function createCourseAction(input: CourseInput): Promise<ActionResult<Course>> {
  try {
    return { success: true, data: await api<Course>("/courses", { method: "POST", body: input }) };
  } catch (error) {
    return toFailure(error);
  }
}

// Send only the fields that changed. A publish toggle is updateCourseAction(id, { published: true }).
export async function updateCourseAction(id: string, input: Partial<CourseInput>): Promise<ActionResult<Course>> {
  try {
    return { success: true, data: await api<Course>(`/courses/${id}`, { method: "PATCH", body: input }) };
  } catch (error) {
    return toFailure(error);
  }
}

// Also deletes the course's lessons, enrollments and progress
export async function deleteCourseAction(id: string): Promise<ActionResult<null>> {
  try {
    await api(`/courses/${id}`, { method: "DELETE" });
    return { success: true, data: null };
  } catch (error) {
    return toFailure(error);
  }
}

export async function createLessonAction(courseId: string, input: LessonInput): Promise<ActionResult<AdminLesson>> {
  try {
    return { success: true, data: await api<AdminLesson>(`/courses/${courseId}/lessons`, { method: "POST", body: input }) };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateLessonAction(id: string, input: Partial<LessonInput>): Promise<ActionResult<AdminLesson>> {
  try {
    return { success: true, data: await api<AdminLesson>(`/lessons/${id}`, { method: "PATCH", body: input }) };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteLessonAction(id: string): Promise<ActionResult<null>> {
  try {
    await api(`/lessons/${id}`, { method: "DELETE" });
    return { success: true, data: null };
  } catch (error) {
    return toFailure(error);
  }
}