"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Container } from "./container";

// The grey block shown while a section has not appeared yet
export function SectionSkeleton({ height = 320 }: { height?: number }) {
  return (
    <Container>
      <div
        role="status"
        aria-label="Loading section"
        style={{ height }}
        className="animate-pulse rounded-3xl bg-muted/70"
      />
    </Container>
  );
}

// Nothing inside a LazySection is rendered, downloaded or fetched until the user scrolls close to it.
// Combine it with next/dynamic (see lazy-sections.tsx) and the section's code is only downloaded then too.
export function LazySection({ id, children, height = 320 }: { id?: string; children: ReactNode; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Very old browsers have no IntersectionObserver: just show the section
    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }

    // The bottom margin means "the section is a little way into the screen", so the reveal is seen
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div id={id} ref={ref} className="scroll-mt-20">
      {visible ? children : <SectionSkeleton height={height} />}
    </div>
  );
}