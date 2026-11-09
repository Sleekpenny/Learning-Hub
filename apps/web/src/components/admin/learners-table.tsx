"use client";

import { useAdminLearners } from "@/lib/queries";
import { Button } from "../ui/button";
import { Skeleton, StateMessage } from "../ui/state-message";

const SHOWN = 10;

// The newest learners as rows, with how many courses each one joined
export function LearnersTable() {
  const learners = useAdminLearners();

  return (
    <section aria-labelledby="learners-heading" className="rounded-2xl border bg-white shadow-sm">
      <h2 id="learners-heading" className="border-b px-5 py-4 font-bold">
        Learners {learners.data && <span className="font-normal text-muted-foreground">({learners.data.length})</span>}
      </h2>

      {learners.isPending ? (
        <div role="status" aria-label="Loading learners" className="p-5">
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : learners.isError ? (
        <div className="p-5">
          <StateMessage tone="error" title="We could not load the learners" text={learners.error.message} action={<Button onClick={() => learners.refetch()}>Try again</Button>} />
        </div>
      ) : learners.data.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nobody has signed up yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Learner</th>
              <th className="hidden px-5 py-3 font-semibold sm:table-cell">Joined</th>
              <th className="px-5 py-3 text-right font-semibold">Courses</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {learners.data.slice(0, SHOWN).map((learner) => (
              <tr key={learner.id}>
                <td className="px-5 py-3">
                  <p className="font-semibold">{learner.name}</p>
                  <p className="text-xs break-all text-muted-foreground">{learner.email}</p>
                </td>
                <td className="hidden px-5 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">{learner.createdAt}</td>
                <td className="px-5 py-3 text-right tabular-nums">{learner.enrolledCourses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {learners.data && learners.data.length > SHOWN && (
        <p className="border-t px-5 py-3 text-xs text-muted-foreground">
          Showing {SHOWN} of {learners.data.length} learners.
        </p>
      )}
    </section>
  );
}