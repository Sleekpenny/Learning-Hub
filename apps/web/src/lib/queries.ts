"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, request, toQuery } from "./api";
import { AdminCourse, AdminDashboard, AdminLearner, Course, CourseDetail, CourseProgress, DashboardData, LessonDetail, Meta, MyCourse } from "@/types/global";


type CourseFilters = { q?: string; category?: string; page?: number; limit?: number };

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

// One course with its lessons. Public: anyone can read it.
export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => api<CourseDetail>(`/courses/${id}`),
  });
}

// The logged in user's progress in one course: are they enrolled, and which lessons are done.
// staleTime 0: always check again when the page opens, so a lesson finished a minute ago shows as completed.
export function useCourseProgress(courseId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => api<CourseProgress>(`/courses/${courseId}/progress`),
    enabled,
    staleTime: 0,
  });
}

// One lesson to watch, with where the learner stopped and the other lessons of the course
export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => api<LessonDetail>(`/lessons/${id}`),
    staleTime: 0,
  });
}

// Call the returned function after enrolling or finishing a lesson, so every screen that shows
// progress (course page, lesson page, dashboard) loads the new numbers.
export function useRefreshLearning() {
  const queryClient = useQueryClient();
  return (courseId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] }),
      queryClient.invalidateQueries({ queryKey: ["lesson"] }),
      queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<AdminDashboard>("/admin/dashboard"),
    refetchInterval: 60 * 1000,
  });
}

// All courses, drafts included
export function useAdminCourses(filters: { q?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-courses", filters],
    queryFn: async () => {
      const { data, meta } = await request<Course[]>(`/admin/courses${toQuery(filters)}`);
      return { courses: data, meta: meta as Meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminCourse(id: string) {
  return useQuery({
    queryKey: ["admin-course", id],
    queryFn: () => api<AdminCourse>(`/admin/courses/${id}`),
  });
}

export function useAdminLearners() {
  return useQuery({
    queryKey: ["admin-learners"],
    queryFn: () => api<AdminLearner[]>("/admin/learners"),
  });
}

// Call the returned function after the admin changes a course or its lessons, so the admin screens
// and the public catalogue and course page show the change.
export function useRefreshCourses() {
  const queryClient = useQueryClient();
  return (courseId?: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["courses"] }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ...(courseId
        ? [
            queryClient.invalidateQueries({ queryKey: ["admin-course", courseId] }),
            queryClient.invalidateQueries({ queryKey: ["course", courseId] }),
          ]
        : []),
    ]);
}