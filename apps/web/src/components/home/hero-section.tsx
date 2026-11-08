"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useCurrentUser } from "@/lib/auth";
import { reducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Container } from "../common/container";
import { buttonVariants } from "../ui/button";
import HeroVisual from "./home-visual";

const points = ["Pick up any lesson where you stopped", "Progress saved automatically", "Learn on your phone or laptop"];

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { user, isLoading } = useCurrentUser();
  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.set("[data-hero]", { opacity: 1 });
        return;
      }
      gsap.fromTo(
        "[data-hero]",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 },
      );
      gsap.to("[data-float]", { y: -10, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.6 });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="overflow-x-clip bg-gradient-to-b from-accent-ai/10 via-bg-base to-bg-base">
      <Container className="grid items-center gap-14 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p data-hero className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-primary opacity-0">
            <span className="h-0.5 w-10 bg-accent-primary" />
            Online learning platform
          </p>
          <h1 data-hero className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight opacity-0 sm:text-5xl">
            Learn at your own pace.
            <span className="block text-primary">Finish what you start.</span>
          </h1>
          <p data-hero className="mt-6 max-w-xl text-lg text-muted-foreground opacity-0">
            Watch short video lessons, continue exactly where you left off and see your progress grow across every course.
          </p>

          <ul data-hero className="mt-6 space-y-2.5 opacity-0">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div data-hero className="mt-9 flex flex-col gap-3 opacity-0 sm:flex-row">
            <Link href="/courses" className={buttonVariants({ size: "lg" })}>
              Browse courses <ArrowRight />
            </Link>
            
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : "/signup"}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), isLoading && "invisible")}
            >
              {user ? "Go to my dashboard" : "Create free account"}
            </Link>
          </div>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}

export default HeroSection;