"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Course } from "@/types/global";
import { useRefreshCourses } from "@/lib/queries";
import { createCourseAction, updateCourseAction } from "@/actions/services";
import InputFields from "@/components/forms-components/input-forms";
import SelectFields from "@/components/forms-components/select-forms";
import { isUrl, toFailure } from "@/lib/utils";
import { categoryOptions, statusOptions } from "@/lib/contstant";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
};

type FormValues = {
  title: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  status: string;
};

// Create and edit share one modal. The form lives inside the dialog, so it starts fresh every time it opens.
export function CourseFormModal({ open, onOpenChange, course }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>{course ? "Change the details and save." : "Fill in the details. You can add lessons after."}</DialogDescription>
        </DialogHeader>
        <CourseForm course={course} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CourseForm({ course, onDone }: { course?: Course; onDone: () => void }) {
  const refresh = useRefreshCourses();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: course?.title ?? "",
      category: course?.category ?? "",
      description: course?.description ?? "",
      thumbnailUrl: course?.thumbnailUrl ?? "",
      status: course?.published ? "published" : "draft",
    },
  });

  const onSubmit = async (values: FormValues) => {

    try {        
    const input = {
      title: values.title.trim(),
      category: values.category,
      description: values.description.trim(),
      thumbnailUrl: values.thumbnailUrl.trim() || null,
      published: values.status === "published",
    };

    const result = course ? await updateCourseAction(course.id, input) : await createCourseAction(input);
    if(!result.success) {
    toast.error(result.message);
      return;
    }

        toast.success(course ? "Course updated" : "Course created");
        await refresh(course?.id);
        onDone();
  
  
    } catch (e) {
       return toFailure(e)
    }

    }

const categories =  course && !categoryOptions.some((option) => option.value === course.category)
    ? [...categoryOptions, { label: course.category, value: course.category }]
    : categoryOptions;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <InputFields
        name="title"
        label="Title"
        placeholder="Modern React from Scratch"
        register={register}
        error={errors.title}
        validation={{ required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } }}
      />
      <SelectFields name="category" label="Category" placeholder="Choose a category" options={categories} control={control} error={errors.category} required />
      <InputFields
        name="description"
        label="Description"
        placeholder="What will learners get from this course?"
        register={register}
        error={errors.description}
        validation={{ required: "Description is required", minLength: { value: 10, message: "Description must be at least 10 characters" } }}
      />
      <InputFields
        name="thumbnailUrl"
        label="Thumbnail link (optional)"
        placeholder="https://..."
        register={register}
        error={errors.thumbnailUrl}
        validation={{ validate: (value: string) => !value.trim() || isUrl(value) || "Thumbnail must be a valid link" }}
      />
      <SelectFields name="status" label="Status" options={statusOptions} control={control} error={errors.status} required placeholder={""} />

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {course ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}