import { MyCourse } from "@/types/global";
import ProgressRing from "./progress-ring";

const ProgressSummary = ({ courses }: { courses: MyCourse[] }) => {
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const doneLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const percent = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);

  const count = (status: MyCourse["status"]) => courses.filter((course) => course.status === status).length;
  const states = [
    { label: "in progress", value: count("IN_PROGRESS"), dot: "bg-amber-400" },
    { label: "not started", value: count("NOT_STARTED"), dot: "bg-muted-foreground/40" },
    { label: "completed", value: count("COMPLETED"), dot: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <ProgressRing percent={percent} label={`${percent}% of all your lessons completed`} />
      <div className="text-center sm:text-left">
        <p className="text-lg font-semibold">
          {doneLessons} of {totalLessons} lessons completed
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Across {courses.length} enrolled {courses.length === 1 ? "course" : "courses"}
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
          {states.map((state) => (
            <li key={state.label} className="flex items-center gap-2 text-sm">
              <span className={`size-2.5 rounded-full ${state.dot}`} aria-hidden="true" />
              <span className="font-semibold">{state.value}</span>
              <span className="text-muted-foreground">{state.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProgressSummary