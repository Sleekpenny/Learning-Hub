"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

// People who ask their system for less motion get none
export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Fades up every [data-reveal] element inside the returned ref, one after another, when the section appears.
// Sections only mount when the user scrolls to them (see LazySection), so this plays at the right moment.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from("[data-reveal]", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        clearProps: "opacity,transform",
      });
    },
    { scope: ref },
  );

  return ref;
}