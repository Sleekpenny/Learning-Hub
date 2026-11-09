"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useReveal } from "@/lib/motion";
import { Container } from "../common/container";
import { buttonVariants } from "../ui/button";
import { ProgressBar, StatusBadge } from "../ui/status";
import { courses, points } from "@/lib/contstant";

const AboutSection = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="about-heading"
      className="py-16 sm:py-24"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

           <div data-reveal aria-hidden="true" className="mx-auto w-full max-w-md space-y-3">
      {courses.map((course) => (
        <div key={course.title} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-md ${course.offset}`}>
          <div className={`size-14 shrink-0 rounded-xl bg-gradient-to-br ${course.colors}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{course.title}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <StatusBadge status={course.status} />
              <span className="text-xs font-semibold text-muted-foreground">{course.percent}%</span>
            </div>
            <div className="mt-1.5">
              <ProgressBar percent={course.percent} label={`${course.title} progress`} />
            </div>
          </div>
        </div>
      ))}
    </div>

        <div>
          <p
            data-reveal
            className="text-sm font-semibold uppercase tracking-wide text-primary"
          >
            Why LearnHub
          </p>
          <h2
            id="about-heading"
            data-reveal
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Learning that fits around your day
          </h2>
          <p data-reveal className="mt-4 text-muted-foreground">
            No long lectures and no losing your place. Learn in small steps and
            always know what to do next.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} data-reveal className="flex gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            data-reveal
            href="/courses"
            className={`${buttonVariants({ size: "lg" })} mt-8`}
          >
            Explore courses <ArrowRight />
          </Link>
        </div>
      </Container>
    </section>
  );
};
export default AboutSection;
