import { Check, Play } from "lucide-react";
import { ProgressBar, StatusBadge } from "../ui/status";
import { lessons } from "@/lib/contstant";

const HeroVisual = () => {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-accent-ai/25 via-transparent to-accent-primary/25 blur-2xl" />

      <div data-hero className="relative rounded-3xl border bg-white p-3 opacity-0 shadow-xl">
        {/* The video */}
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent-ai to-[#2e2796]">
          <div className="absolute -right-8 -top-8 size-36 rounded-full bg-accent-primary/30 blur-2xl" />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
          <div className="absolute inset-x-4 bottom-4 h-1.5 rounded-full bg-white/30">
            <div className="h-full w-2/3 rounded-full bg-accent-primary" />
          </div>
        </div>

        {/* The course and the lessons */}
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Web Development</p>
            <p className="mt-1 text-lg font-bold">Build your first website</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar percent={66} label="Course progress" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">66%</span>
            </div>
          </div>
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.title} className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-3 py-2.5">
                <span className="truncate text-sm font-medium">{lesson.title}</span>
                <StatusBadge status={lesson.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Two chips that float gently. The outer div slides in, the inner one floats. */}
      <div data-hero className="absolute -right-1 top-8 opacity-0 sm:-right-6">
        <div data-float className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-xs font-semibold shadow-lg">
          <span className="flex size-6 items-center justify-center rounded-full bg-state-success/20 text-emerald-700">
            <Check className="size-3.5" />
          </span>
          Lesson completed
        </div>
      </div>
      <div data-hero className="absolute -bottom-5 left-4 opacity-0 sm:left-8">
        <div data-float className="rounded-2xl border bg-white px-3 py-2 text-xs font-semibold shadow-lg">
          <span className="text-muted-foreground">Resume at</span> 04:32
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;