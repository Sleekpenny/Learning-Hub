import { AdminDashboard } from "@/types/global";

const TopCourses = ({ items }: { items: AdminDashboard["topCourses"] }) => {
  const most = Math.max(1, ...items.map((item) => item.enrollments));

  return (
    <section aria-labelledby="top-heading" className="rounded-2xl border bg-white shadow-sm">
      <h2 id="top-heading" className="border-b px-5 py-4 font-bold">
        Most popular courses
      </h2>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">No courses yet.</p>
      ) : (
        <ol className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate text-sm font-semibold">{item.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.enrollments} {item.enrollments === 1 ? "learner" : "learners"}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(item.enrollments / most) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default TopCourses;