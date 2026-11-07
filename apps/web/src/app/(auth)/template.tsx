import { PageTransition } from "@/components/common/page-transition";
import type { ReactNode } from "react";

// A template is remounted on every page change, which is what lets the page fade in each time
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}