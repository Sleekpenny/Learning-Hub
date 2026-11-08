"use client";

import { BookOpen, Clock, Smartphone, TrendingUp, Video } from "lucide-react";
import { useReveal } from "@/lib/motion";
import { Container } from "../common/container";

const features = [
  { icon: Video, label: "Short video lessons" },
  { icon: Clock, label: "Resume anywhere" },
  { icon: TrendingUp, label: "Progress tracking" },
  { icon: Smartphone, label: "Works on any device" },
  { icon: BookOpen, label: "Free to join" },
];

const FeaturesStrip = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} aria-label="What you get" className="bg-white">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5">
          {features.map((feature) => (
            <li key={feature.label} data-reveal className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <span className="text-sm font-semibold">{feature.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default FeaturesStrip;