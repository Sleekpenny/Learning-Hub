"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useRefreshLearning } from "@/lib/queries";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { LessonSummary } from "@/types/global";
import { enrollAction } from "@/actions/services";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: { id: string; title: string };
  lesson: LessonSummary | null;
  loggedIn: boolean;
};

export function EnrollDialog({ open, onOpenChange, course, lesson, loggedIn }: Props) {
  const router = useRouter();
  const refresh = useRefreshLearning();
  const [loading, setLoading] = useState(false);

  async function enroll() {
    setLoading(true);
    const result = await enrollAction(course.id);
    if (!result.success) {
      setLoading(false);
      toast.error(result.message);
      return;
    }

    if (result.data.alreadyEnrolled) toast.info(`You are already enrolled in ${course.title}`);
    else toast.success(`You just enrolled in ${course.title}`);

    // Load the new progress so the lessons on the page unlock before the dialog closes
    await refresh(course.id);
    setLoading(false);
    onOpenChange(false);
    if (lesson) router.push(`/lessons/${lesson.id}`);
  }

  const next = encodeURIComponent(`/courses/${course.id}`);

  return (
    <Dialog open={open} onOpenChange={(value) => !loading && onOpenChange(value)}>
      <DialogContent>
        {loggedIn ? (
          <>
            <DialogHeader>
              <DialogTitle>{lesson ? "Enroll to watch this lesson" : `Enroll in ${course.title}`}</DialogTitle>
              <DialogDescription>
                {lesson ? (
                  <>
                    <strong className="font-semibold text-foreground">{lesson.title}</strong> is part of{" "}
                    <strong className="font-semibold text-foreground">{course.title}</strong>. Enroll to unlock it and every other lesson in the course.
                  </>
                ) : (
                  "Enrolling unlocks every lesson in the course. Your progress is saved as you watch."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Not now
              </Button>
              <Button onClick={enroll} loading={loading}>
                Enroll now
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sign in to enroll</DialogTitle>
              <DialogDescription>
                You need an account to enroll in <strong className="font-semibold text-foreground">{course.title}</strong>. It only takes a minute, and you will come back to this course afterwards.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild variant="outline">
                <Link href={`/sign-up?next=${next}`}>Create account</Link>
              </Button>
              <Button asChild>
                <Link href={`/sign-in?next=${next}`}>Sign in</Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}