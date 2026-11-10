import { Award, Check, Play } from "lucide-react";
import type { ReactNode } from "react";
import { ProgressBar, StatusBadge } from "../ui/status";

// The four clipart drawings shown in the login carousel. They are made from divs and the app's own
// pieces, so there are no image files to host. `data-float` makes a piece bob up and down (see auth-illustration.tsx).

// Every slide has the same height, so the carousel does not jump when it moves
function Slide({ children }: { children: ReactNode }) {
  return <div className="flex h-[22rem] items-center justify-center px-10">{children}</div>;
}

// 1. A laptop playing a lesson
export function WatchSlide() {
  return (
    <Slide>
      <div className="relative w-full">
        <div className="rounded-t-2xl border-[10px] border-bg-surface bg-white p-4 shadow-xl">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent-ai to-[#2e2796]">
            <div className="absolute -bottom-6 -left-6 size-28 rounded-full bg-accent-primary/30 blur-2xl" />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg">
              <Play className="size-6 translate-x-0.5 fill-current" />
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-muted" />
            <ProgressBar percent={72} label="Progress" />
          </div>
        </div>
        <div className="mx-auto h-3 w-[112%] -translate-x-[5.5%] rounded-b-2xl bg-gradient-to-b from-border-subtle to-bg-surface" />

        <div data-float className="absolute -left-8 top-10 rounded-2xl border bg-white px-4 py-3 shadow-lg">
          <p className="text-xs text-muted-foreground">Your progress</p>
          <p className="text-xl font-bold text-primary">72%</p>
        </div>
        <div data-float className="absolute -right-6 bottom-16 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-lg">
          <span className="flex size-7 items-center justify-center rounded-full bg-state-success/20 text-emerald-700">
            <Check className="size-4" />
          </span>
          <span className="text-sm font-semibold">Lesson 5 done</span>
        </div>
      </div>
    </Slide>
  );
}

// 2. A stack of course cards
const courses = [
  { title: "Web Development", status: "IN_PROGRESS" as const, percent: 60, colors: "from-accent-ai to-accent-primary", offset: "" },
  { title: "Product Design", status: "NOT_STARTED" as const, percent: 0, colors: "from-accent-primary to-emerald-400", offset: "ml-6" },
  { title: "Data and AI", status: "COMPLETED" as const, percent: 100, colors: "from-amber-400 to-pink-500", offset: "" },
];

export function CoursesSlide() {
  return (
    <Slide>
      <div className="w-full space-y-3">
        {courses.map((course) => (
          <div key={course.title} data-float className={`flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-md ${course.offset}`}>
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
    </Slide>
  );
}

// 3. A progress ring with two numbers
export function ProgressSlide() {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const percent = 72;

  return (
    <Slide>
      <div className="relative w-full">
        <div className="mx-auto flex w-56 flex-col items-center rounded-3xl border bg-white px-6 py-7 shadow-xl">
          <div className="relative size-36">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="12" className="stroke-muted" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - percent / 100)}
                className="stroke-primary"
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{percent}%</span>
              <span className="text-xs text-muted-foreground">complete</span>
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold">Build your first website</p>
        </div>

        <div data-float className="absolute -left-2 top-6 rounded-2xl border bg-white px-4 py-3 shadow-lg">
          <p className="text-xl font-bold text-primary">6</p>
          <p className="text-xs text-muted-foreground">lessons done</p>
        </div>
        <div data-float className="absolute -right-2 bottom-8 rounded-2xl border bg-white px-4 py-3 shadow-lg">
          <p className="text-xl font-bold text-emerald-600">2</p>
          <p className="text-xs text-muted-foreground">courses active</p>
        </div>
      </div>
    </Slide>
  );
}

// 4. A finished course
export function FinishSlide() {
  return (
    <Slide>
      <div className="relative w-full">
        {/* Confetti */}
        <span className="absolute -top-3 left-6 size-3 rounded-full bg-accent-primary" />
        <span className="absolute top-8 -right-1 size-2.5 rounded-full bg-amber-400" />
        <span className="absolute bottom-10 -left-3 size-2.5 rounded-full bg-pink-400" />
        <span className="absolute -bottom-3 right-10 size-3 rounded-full bg-accent-ai" />

        <div className="mx-auto flex w-64 flex-col items-center rounded-3xl border bg-white px-6 py-8 text-center shadow-xl">
          <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-ai to-accent-primary text-white shadow-lg">
            <Award className="size-8" />
          </span>
          <p className="mt-4 text-lg font-bold">Course completed</p>
          <p className="mt-1 text-sm text-muted-foreground">Design basics for everyone</p>
          <div className="mt-5 w-full">
            <ProgressBar percent={100} label="Course progress" />
          </div>
        </div>

        <div data-float className="absolute -right-2 top-4 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-lg">
          <span className="flex size-7 items-center justify-center rounded-full bg-state-success/20 text-emerald-700">
            <Check className="size-4" />
          </span>
          <span className="text-sm font-semibold">8 of 8 lessons</span>
        </div>
      </div>
    </Slide>
  );
}