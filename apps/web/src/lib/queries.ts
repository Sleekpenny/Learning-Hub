"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, request, toQuery } from "./api";
import { Course, DashboardData, Meta, MyCourse } from "@/types/global";

type CourseFilters = { q?: string; category?: string; page?: number; limit?: number };

// Published courses, with search, category filter and pages.
// live: true keeps the list fresh while the tab is open (checks every minute and when the user returns).
export function useCourses(filters: CourseFilters, { live = false } = {}) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const { data, meta } = await request<Course[]>(`/courses${toQuery(filters)}`);
      return { courses: data, meta: meta as Meta };
    },
    // keep showing the old page while the next one loads
    placeholderData: keepPreviousData,
    refetchInterval: live ? 60 * 1000 : false,
    refetchOnWindowFocus: live,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<string[]>("/courses/categories"),
    staleTime: 5 * 60 * 1000,
  });
}

// Courses the logged in user is enrolled in. Pass enabled=false when nobody is logged in.
export function useMyCourses(enabled: boolean) {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: () => api<MyCourse[]>("/me/courses"),
    enabled,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>("/me/dashboard"),
  });
}