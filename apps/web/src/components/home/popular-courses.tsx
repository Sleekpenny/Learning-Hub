"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCategories, useCourses } from "@/lib/queries";
import { reducedMotion, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Container } from "../common/container";
import { Button, buttonVariants } from "../ui/button";
import { StateMessage } from "../ui/state-message";
import CourseCard from "../courses/course-card";
import { CourseGridSkeleton } from "../courses/course-grid-skeleton";

const PopularCourses = () => {
  const ref = useReveal<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("");

  const categories = useCategories();
  const courses = useCourses({ category: category || undefined, limit: 4 }, { live: true });

  const tiles = ["", ...(categories.data ?? []).slice(0, 3)];
  const ids = courses.data?.courses.map((course) => course.id).join(",");

  useGSAP(
    () => {
      if (!ids || reducedMotion()) return;
      gsap.from(gridRef.current?.children ?? [], {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        clearProps: "opacity,transform",
      });
    },
    { scope: gridRef, dependencies: [ids] },
  );

  return (
    <section ref={ref} aria-labelledby="courses-heading" className="bg-white py-16 sm:py-24">
      <Container>
        <div className="text-center">
          <p data-reveal className="text-sm font-semibold uppercase tracking-wide text-primary">
            Popular courses
          </p>
          <h2 id="courses-heading" data-reveal className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Our popular online courses
          </h2>
          <p data-reveal className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-state-success" aria-hidden="true" />
            Updates automatically
          </p>
        </div>

        {/* Category tiles */}
        <div data-reveal role="group" aria-label="Filter by category" className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((name) => (
            <button
              key={name || "all"}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white p-4 text-left text-sm font-semibold shadow-sm transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                category === name ? "border-primary bg-primary text-white" : "hover:border-primary/50 hover:shadow-md",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  category === name ? "bg-white/20" : "bg-primary/10 text-primary",
                )}
              >
                <Layers className="size-4" />
              </span>
              <span className="truncate">{name || "All courses"}</span>
            </button>
          ))}
        </div>

        {/* The courses */}
        <div data-reveal className="mt-8">
          {courses.isPending ? (
            <CourseGridSkeleton count={4} columns="lg:grid-cols-4" />
          ) : courses.isError ? (
            <StateMessage
              tone="error"
              title="We could not load the courses"
              text={courses.error.message}
              action={<Button onClick={() => courses.refetch()}>Try again</Button>}
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

        <div data-reveal className="mt-10 flex justify-center">
          <Link
            href={category ? `/courses?category=${encodeURIComponent(category)}` : "/courses"}
            className={buttonVariants({ size: "lg" })}
          >
            View all courses <ArrowRight />
          </Link>
        </div>
      </Container>
    </section>
  );
}
export default PopularCourses;