import type { ReactNode } from "react";
import { Spinner } from "./spinner";

// Used for empty lists and failed requests
export function StateMessage({
  title,
  text,
  action,
  tone = "neutral",
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-2xl border border-dashed px-6 py-12 text-center ${
        tone === "error" ? "border-red-300 bg-red-50" : "border-input bg-white"
      }`}
    >
      <h3 className={`text-base font-semibold ${tone === "error" ? "text-red-800" : "text-foreground"}`}>{title}</h3>
      {text && <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="h-5 w-5" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} aria-hidden="true" />;
}