"use client";

import { useEffect, useState } from "react";

type State = "checking" | "online" | "offline";

/** Temporary connectivity check: proves the browser -> Next.js -> Express proxy works. */
export function ApiStatus() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    fetch("/api/health", { credentials: "include" })
      .then((res) => setState(res.ok ? "online" : "offline"))
      .catch(() => setState("offline"));
  }, []);

  const styles: Record<State, string> = {
    checking: "bg-zinc-100 text-zinc-600",
    online: "bg-emerald-100 text-emerald-800",
    offline: "bg-red-100 text-red-800",
  };
  const labels: Record<State, string> = {
    checking: "Checking API…",
    online: "API connected",
    offline: "API unreachable: is `npm run dev:api` running?",
  };

  return (
    <span
      role="status"
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}
