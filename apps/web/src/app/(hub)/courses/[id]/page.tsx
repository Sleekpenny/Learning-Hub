import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { CourseDetail } from "@/components/course-detail/course-details";

export const metadata: Metadata = { title: "Course" };

// In Next.js 16 the route params arrive as a Promise
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container className="py-8 sm:py-12">
      <CourseDetail id={id} />
    </Container>
  );
}