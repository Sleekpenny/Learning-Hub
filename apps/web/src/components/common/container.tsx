import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// The page width. The body carries the background colour, the content stays inside max-w-7xl.
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}