"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CoursesSlide, FinishSlide, ProgressSlide, WatchSlide } from "./auth.slides";

const slides = [
  { Drawing: WatchSlide, caption: "Watch lessons and pick up where you stopped" },
  { Drawing: CoursesSlide, caption: "Browse courses across every topic" },
  { Drawing: ProgressSlide, caption: "See your progress at a glance" },
  { Drawing: FinishSlide, caption: "Finish courses and keep going" },
];

const SECONDS_PER_SLIDE = 5;

// The picture on the right of the login and signup pages: four drawings you can swipe or drag.
// It also moves on by itself every few seconds, and stops while the mouse is over it.
const  AuthIllustration = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewportRef, embla] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  // Auto-advance. Visitors who asked for less motion only move it by hand.
  useEffect(() => {
    if (!embla || reducedMotion()) return;
    const timer = setInterval(() => {
      if (!paused.current) embla.scrollNext();
    }, SECONDS_PER_SLIDE * 1000);
    return () => clearInterval(timer);
  }, [embla]);

  // The small cards in each drawing float up and down
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.to("[data-float]", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.5 });
    },
    { scope: rootRef },
  );

  const goTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="How LearnHub works"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      className="relative mx-auto hidden w-full max-w-md lg:block"
    >
      <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-gradient-to-br from-accent-ai/20 to-accent-primary/25 blur-3xl" />

      <div ref={viewportRef} className="relative cursor-grab overflow-hidden active:cursor-grabbing">
        <div className="flex">
          {slides.map(({ Drawing, caption }, i) => (
            <div
              key={caption}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${caption}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              {/* The drawing is decoration, the caption says what it shows */}
              <div aria-hidden="true">
                <Drawing />
              </div>
              <p className="px-6 pb-1 text-center text-sm font-medium text-muted-foreground">{caption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The dots. The wide one is the drawing you are on. */}
      <div className="relative mt-4 flex justify-center gap-2">
        {slides.map(({ caption }, i) => (
          <button
            key={caption}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-2 rounded-full transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              i === index ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default AuthIllustration