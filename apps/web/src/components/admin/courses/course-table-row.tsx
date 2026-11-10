import { ListVideoIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { lessonLabel } from "@/lib/format";
import { Button } from "../../ui/button";
import { Course } from "@/types/global";
import pickGradient from "@/components/courses/pickGradient";
import PublishBadge from "../publsh-badge";

type Props = {
  course: Course;
  onEdit: () => void;
  onLessons: () => void;
  onDelete: () => void;
};

// One course as a row of the admin table
const CourseTableRow = ({ course, onEdit, onLessons, onDelete }: Props) => {
  return (
    <tr>
      <td className="px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-bold text-white/90 ${pickGradient(course.title)}`}
          >
            {course.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{course.title}</p>
            {/* On phones the category and status sit under the title so the table stays narrow */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden">
              <PublishBadge published={course.published} />
              <span className="text-xs text-muted-foreground">{course.category}</span>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block md:hidden">{course.category}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{course.category}</td>
      <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">{lessonLabel(course.lessonCount)}</td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <PublishBadge published={course.published} />
      </td>
      <td className="px-2 py-3 sm:px-4">
        <div className="flex justify-end gap-0.5">
          <Button variant="ghost" size="icon" className="size-9" onClick={onLessons}>
            <ListVideoIcon />
            <span className="sr-only">Lessons of {course.title}</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-9" onClick={onEdit}>
            <PencilIcon />
            <span className="sr-only">Edit {course.title}</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-9 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2Icon />
            <span className="sr-only">Delete {course.title}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default CourseTableRow;