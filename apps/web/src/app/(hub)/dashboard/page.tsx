"use client";
import { LazySection } from "@/components/common/lazy-section";
import CourseCard from "@/components/courses/course-card";
import { CourseGridSkeleton } from "@/components/courses/course-grid-skeleton";
import DashboardPanel from "@/components/dashboard/dashboard-panel";
import HeroSection from "@/components/home/hero-section";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { useCourses } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

const DashboardView = () => {
  const [category, setCategory] = useState("");

  const courses = useCourses(
    { category: category || undefined, limit: 4 },
    { live: true },
  );

  const ids = courses.data?.courses.map((course) => course.id).join(",");
  const gridRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <LazySection id="features" height={140}>
        <DashboardPanel />
      </LazySection>

      <LazySection id="popular" height={560}>
        <h2 id="courses-heading" data-reveal className="mt-3 text-md">
          Our popular online courses
        </h2>
        <div data-reveal className="mt-8">
          {courses.isPending ? (
            <CourseGridSkeleton count={4} columns="lg:grid-cols-4" />
          ) : courses.isError ? (
            <StateMessage
              tone="error"
              title="We could not load the courses"
              text={courses.error.message}
              action={
                <Button onClick={() => courses.refetch()}>Try again</Button>
              }
            />
          ) : courses.data.courses.length === 0 ? (
            <StateMessage
              title="No courses here yet"
              text="New courses are on the way. Check back soon."
              action={
                category ? (
                  <Button variant="outline" onClick={() => setCategory("")}>
                    Show all courses
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div
              ref={gridRef}
              className={cn(
                "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
                courses.isPlaceholderData && "opacity-60 transition-opacity",
              )}
            >
              {courses.data.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </LazySection>
    </>
  );
};

export default DashboardView;
