"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { reducedMotion } from "@/lib/motion";

// The path of the page we were on. Lives outside React so it survives page changes.
let previousPath: string | null = null;

// Wraps the page content in each layout's template.tsx. Next.js remounts a template on every page
// change, so this fades and lifts the new page in. The navbar and footer sit outside it and stay still.
// The very first page load is not animated (the page is already on screen from the server).
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const isNavigation = previousPath !== null && previousPath !== pathname;
      previousPath = pathname;
      if (!isNavigation || reducedMotion()) return;

      gsap.from(ref.current, { opacity: 0, y: 18, duration: 0.45, ease: "power2.out", clearProps: "opacity,transform" });
      window.scrollTo({ top: 0 });
    },
    { scope: ref, dependencies: [pathname] },
  );

  return (
    <div ref={ref} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}