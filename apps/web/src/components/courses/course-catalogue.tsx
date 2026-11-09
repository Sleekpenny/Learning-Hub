"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { useCategories, useCourses, useMyCourses } from "@/lib/queries";
import { CourseSearch } from "./course-search";
import { CategoryFilter } from "./category-filter";
import { CourseGrid } from "./course-grid";


const PAGE_SIZE = 9;

// The search text, category and page number live in the URL (/courses?q=react&category=Design&page=2),
// so a filtered list can be shared and the back button works.
// This component only keeps that state together. Each part of the screen is its own component.
export function CourseCatalogue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { user } = useCurrentUser();
  const categories = useCategories();
  const courses = useCourses({ q, category, page, limit: PAGE_SIZE });
  const myCourses = useMyCourses(!!user);

  const progressById = new Map(myCourses.data?.map((course) => [course.id, course]));

  function updateUrl(changes: { q?: string; category?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, String(value));
      else params.delete(key);
    }
    // any change except paging goes back to page 1
    if (changes.page === undefined) params.delete("page");

    const text = params.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  const total = courses.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="max-w-2xl">
        <CourseSearch value={q} onSearch={(text) => updateUrl({ q: text })} />
      </div>

      <div className="mt-5">
        <CategoryFilter categories={categories.data} active={category} onChange={(name) => updateUrl({ category: name })} />
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {courses.data ? `${total} ${total === 1 ? "course" : "courses"} found` : " "}
      </p>

      <div className="mt-4">
        <CourseGrid
          courses={courses.data?.courses}
          isPending={courses.isPending}
          isRefreshing={courses.isPlaceholderData}
          error={courses.isError ? courses.error : null}
          progressById={progressById}
          pageSize={PAGE_SIZE}
          onRetry={() => courses.refetch()}
          onClearFilters={() => router.replace(pathname, { scroll: false })}
        />
      </div>
    </div>
  );
}