import { Skeleton } from "../ui/state-message";

// Shown while the course loads. Same layout as the real page, so nothing jumps.
export function CourseDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading course" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-5 w-2/3 max-w-lg" />
      </div>
      <Skeleton className="h-72 rounded-2xl lg:row-span-2" />
      <div className="space-y-px overflow-hidden rounded-2xl border bg-white">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-none" />
        ))}
      </div>
    </div>
  );
}