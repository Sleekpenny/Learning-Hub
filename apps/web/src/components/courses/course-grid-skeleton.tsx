import CourseCardSkeleton from "./course-skeleton";

export function CourseGridSkeleton({ count = 6, columns = "lg:grid-cols-3" }: { count?: number; columns?: string }) {
  return (
    <div role="status" aria-label="Loading courses" className={`grid gap-6 sm:grid-cols-2 ${columns}`}>
      {Array.from({ length: count }, (_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}