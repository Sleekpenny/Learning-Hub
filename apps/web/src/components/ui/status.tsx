import { Status } from "@/types/global";
import { CheckIcon } from "lucide-react";


const labels: Record<Status, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const styles: Record<Status, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
};

// The text always says the status, so colour is never the only signal
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status === "COMPLETED" && <CheckIcon className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={`h-full rounded-full transition-all ${percent === 100 ? "bg-emerald-500" : "bg-primary"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}