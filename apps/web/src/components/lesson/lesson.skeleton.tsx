import { Skeleton } from "../ui/state-message";

const LessonSkeleton = () => {
  return (
    <div role="status" aria-label="Loading lesson" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Skeleton className="aspect-video rounded-2xl" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

export default LessonSkeleton;