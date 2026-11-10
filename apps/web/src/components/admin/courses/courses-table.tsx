import { Course } from "@/types/global";
import CourseTableRow from "./course-table-row";

type Props = {
  courses: Course[];
  // Dims the table while the next page loads
  loading?: boolean;
  onEdit: (course: Course) => void;
  onLessons: (course: Course) => void;
  onDelete: (course: Course) => void;
};

const head = "px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export function CoursesTable({ courses, loading, onEdit, onLessons, onDelete }: Props) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-opacity ${loading ? "opacity-60" : ""}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className={head}>Course</th>
            <th className={`${head} hidden md:table-cell`}>Category</th>
            <th className={`${head} hidden sm:table-cell`}>Lessons</th>
            <th className={`${head} hidden sm:table-cell`}>Status</th>
            <th className={head}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {courses.map((course) => (
            <CourseTableRow key={course.id} course={course} onEdit={() => onEdit(course)} onLessons={() => onLessons(course)} onDelete={() => onDelete(course)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}