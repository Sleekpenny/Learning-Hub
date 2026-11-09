import { api } from "@/lib/api";
import { toFailure } from "@/lib/utils";
import { ActionResult, ProgressSaved } from "@/types/global";

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