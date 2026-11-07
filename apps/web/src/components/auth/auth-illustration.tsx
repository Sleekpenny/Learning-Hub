"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Check, Play } from "lucide-react";
import { useRef } from "react";
import { reducedMotion } from "@/lib/motion";
import { ProgressBar } from "../ui/status";
// The picture on the right of the login and signup pages. Decoration only.
const AuthIllustration = () => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.to("[data-float]", { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.7 });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden="true" className="relative mx-auto hidden w-full max-w-md lg:block">
      <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-accent-ai/20 to-accent-primary/25 blur-3xl" />

      {/* Laptop */}
      <div className="relative">
        <div className="rounded-t-2xl border-[10px] border-bg-surface bg-white p-4 shadow-xl">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent-ai to-[#2e2796]">
            <div className="absolute -left-6 -bottom-6 size-28 rounded-full bg-accent-primary/30 blur-2xl" />
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
      </div>

      {/* Floating cards */}
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
  );
}

export default AuthIllustration;