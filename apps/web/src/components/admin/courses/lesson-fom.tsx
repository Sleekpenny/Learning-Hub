"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { AdminLesson } from "@/types/global";
import { useRefreshCourses } from "@/lib/queries";
import { createLessonAction, updateLessonAction } from "@/actions/services";
import InputFields from "@/components/forms-components/input-forms";
import { isUrl, splitDuration, toFailure } from "@/lib/utils";


type Props = {
  courseId: string;
  // Pass a lesson to edit it. Leave it out to add a new one at the end of the course.
  lesson?: AdminLesson;
  onBack: () => void;
};

type FormValues = {
  title: string;
  description: string;
  videoUrl: string;
  minutes: string;
  seconds: string;
};

const totalSeconds = (values: Pick<FormValues, "minutes" | "seconds">) => Number(values.minutes || 0) * 60 + Number(values.seconds || 0);

// The add / edit lesson form inside the lessons modal
export function LessonForm({ courseId, lesson, onBack }: Props) {
  const refresh = useRefreshCourses();
  const start = lesson ? splitDuration(lesson.durationSeconds) : null;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      minutes: start ? String(start.minutes) : "",
      seconds: start ? String(start.seconds) : "",
    },
  });

  async function onSubmit(values: FormValues) {

    try{
    const input = { title: values.title.trim(), description: values.description.trim(), videoUrl: values.videoUrl.trim(), durationSeconds: totalSeconds(values) };
    const result = lesson ? await updateLessonAction(lesson.id, input) : await createLessonAction(courseId, input);

     if(!result.success) {
        toast.error(result.message)
     }

    toast.success(lesson ? "Lesson updated" : "Lesson added");
    await refresh(courseId);
    onBack();
    } catch(e) {
        return toFailure(e)
    }

  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <InputFields
        name="title"
        label="Title"
        placeholder="Your first component"
        register={register}
        error={errors.title}
        validation={{ required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } }}
      />
      <InputFields
        name="description"
        label="Description"
        placeholder="What this lesson covers"
        register={register}
        error={errors.description}
        validation={{ required: "Description is required", minLength: { value: 5, message: "Description must be at least 5 characters" } }}
      />
      <InputFields
        name="videoUrl"
        label="Video link"
        placeholder="https://.../lesson.mp4"
        hint="A direct link to an mp4 or webm file."
        register={register}
        error={errors.videoUrl}
        validation={{ required: "Video link is required", validate: (value: string) => isUrl(value) || "Video must be a valid link" }}
      />
      <div className="grid grid-cols-2 gap-3">
        <InputFields
          name="minutes"
          label="Minutes"
          type="number"
          placeholder="0"
          register={register}
          error={errors.minutes}
          validation={{
            min: { value: 0, message: "Cannot be negative" },
            validate: (_: string, values: FormValues) => totalSeconds(values) <= 36000 || "Duration can be 10 hours at most",
          }}
        />
        <InputFields
          name="seconds"
          label="Seconds"
          type="number"
          placeholder="0"
          register={register}
          error={errors.seconds}
          validation={{
            min: { value: 0, message: "Cannot be negative" },
            max: { value: 59, message: "Use 0 to 59" },
            validate: (_: string, values: FormValues) => totalSeconds(values) >= 1 || "Duration must be at least 1 second",
          }}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back to lessons
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {lesson ? "Save lesson" : "Add lesson"}
        </Button>
      </div>
    </form>
  );
}