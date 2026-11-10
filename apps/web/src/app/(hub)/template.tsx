import { PageTransition } from "@/components/common/page-transition";
import type { ReactNode } from "react";

const Template = ({ children }: { children: ReactNode }) => {
  return <PageTransition>{children}</PageTransition>;
}

export default Template;