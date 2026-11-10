import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/common/container";
import { CourseCatalogue } from "@/components/courses/course-catalogue";
import { CourseGridSkeleton } from "@/components/courses/course-grid-skeleton";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All courses</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Pick a topic, start a course and learn at your own speed. Your progress is saved on every lesson.
      </p>

      <div className="mt-8">
        <Suspense fallback={<CourseGridSkeleton count={9} />}>
          <CourseCatalogue />
        </Suspense>
      </div>
    </Container>
  );
}