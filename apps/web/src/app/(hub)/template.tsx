import { PageTransition } from "@/components/common/page-transition";
import { Suspense, type ReactNode } from "react";

const Template = ({ children }: { children: ReactNode }) => {
  return(
    <main id="main" className="...">
  <Suspense fallback={null}>
    <PageTransition>{children}</PageTransition>
  </Suspense>
</main>
  )
}

export default Template;