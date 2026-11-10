import Link from "next/link";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";


// tone="light" is for dark backgrounds (the footer)
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-xl font-bold tracking-tight",
        tone === "dark" ? "text-foreground" : "text-white",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-ai to-accent-primary text-white shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <span>
        Learning<span className={tone === "dark" ? "text-primary" : "text-accent-primary"}>Hub</span>
      </span>
    </Link>
  );
}