
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { StateMessage } from "../ui/state-message";
import { CourseGridSkeleton } from "./course-grid-skeleton";
import { Course, MyCourse } from "@/types/global";
import CourseCard from "./course-card";

type Props = {
  courses: Course[] | undefined;
  isPending: boolean;
  // true while the next page or a new search is loading and the old list is still on screen
  isRefreshing: boolean;
  error: Error | null;
  // course id -> my progress, for the cards of courses I am enrolled in
  progressById: Map<string, MyCourse>;
  pageSize: number;
  onRetry: () => void;
  onClearFilters: () => void;
};

// Shows the right thing for each state: loading, failed, nothing found, or the courses
export function CourseGrid({ courses, isPending, isRefreshing, error, progressById, pageSize, onRetry, onClearFilters }: Props) {
  if (isPending) return <CourseGridSkeleton count={pageSize} columns="lg:grid-cols-3" />;

  if (error) {
    return (
      <StateMessage
        tone="error"
        title="We could not load the courses"
        text={error.message}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <StateMessage
        title="No courses match your search"
        text="Try a different word or remove the filters."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3", isRefreshing && "opacity-60")}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} progress={progressById.get(course.id)} />
      ))}
    </div>
  );
}