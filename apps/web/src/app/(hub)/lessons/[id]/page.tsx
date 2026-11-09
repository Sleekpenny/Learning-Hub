import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { RequireAuth } from "@/guards/route-guards";
import LessonView from "@/components/lesson/lesson-view";

export const metadata: Metadata = { title: "Lesson" };

export const instant = false

// Needs a login. Someone who is not enrolled gets the "Enroll to watch" message from the API's 403.
const LessonPage = async ({ params }: { params: Promise<{ id: string }> })  => {
  const { id } = await params;
  return (
    <RequireAuth>
      <Container className="py-8 sm:py-12">
        <LessonView id={id} />
      </Container>
    </RequireAuth>
  );
}

export default LessonPage;