import { AdminDashboard } from "@/types/global";

// The latest sign-ups to courses
const RecentEnrollments = ({ items }: { items: AdminDashboard["recentEnrollments"] }) => {
  return (
    <section aria-labelledby="recent-heading" className="rounded-2xl border bg-white shadow-sm">
      <h2 id="recent-heading" className="border-b px-5 py-4 font-bold">
        Recent enrollments
      </h2>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nobody has enrolled yet.</p>
      ) : (
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.learnerName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.courseTitle}</p>
              </div>
              <time dateTime={item.enrolledAt} className="shrink-0 text-xs text-muted-foreground">
                {item.enrolledAt}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentEnrollments