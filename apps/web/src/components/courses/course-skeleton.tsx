import { Skeleton } from "../ui/state-message";

const CourseCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white" aria-hidden="true">
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
      </div>
    </div>
  );
}
export default CourseCardSkeleton;