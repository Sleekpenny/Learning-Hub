import type { Control, FieldError, FieldValues, Path } from "react-hook-form";

export type Role = "LEARNER" | "ADMIN";
export type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type LoginPortal = "learner" | "admin";
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: string; message: string;};


export type FormInputProps = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  register: UseFormRegister;
  error?: FieldError;
  validation?: RegisterOptions;
  disabled?: boolean;
  value?: string;
  hint?: ReactNode;
};

// Shapes of the data the API returns. Keep in sync with apps/api/docs.

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  country: string | null;
  areaOfInterest: string | null;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
  lessonCount: number;
  totalDurationSeconds: number;
}

export interface MyCourse extends Course {
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt: string | null;
  completedLessons: number;
  progressPercent: number;
  status: Status;
  resumeLessonId: string | null;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface DashboardData {
  stats: {
    enrolledCourses: number;
    inProgress: number;
    completed: number;
    lessonsCompleted: number;
  };
  continueLearning: MyCourse[];
}

export interface SignUpFormData { 
  name: string;
  email: string;
  password: string;
  country: string;
  areaOfInterest: string;
}

export interface SignInFormData {
    password: string,
    email:string
}
export interface SelectFieldProps<T extends FieldValues = FieldValues> {
  required?: boolean;
  error?: FieldError;
  control: Control<T>;
  options: { label: string; value: string }[];
  placeholder?: string;
  label: string;
  name: Path<T>;
}

export type Props = {
  course: Course;
  progress?: { progressPercent: number; status: Status };
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  country: string | null;
  areaOfInterest: string | null;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
  lessonCount: number;
  totalDurationSeconds: number;
}

// A course the logged in user is enrolled in, with their progress
export interface MyCourse extends Course {
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt: string | null;
  completedLessons: number;
  progressPercent: number;
  status: Status;
  resumeLessonId: string | null;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface DashboardData {
  stats: {
    enrolledCourses: number;
    inProgress: number;
    completed: number;
    lessonsCompleted: number;
  };
  continueLearning: MyCourse[];
}

// One lesson as listed on the course page (the video link is only sent when a lesson is opened)
export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  position: number;
}

export interface CourseDetail extends Course {
  lessons: LessonSummary[];
}

// My progress in one course: GET /courses/:id/progress
export interface CourseProgress {
  enrolled: boolean;
  enrolledAt: string | null;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  status: Status;
  resumeLessonId: string | null;
  lessons: { id: string; status: Status; positionSeconds: number }[];
}

// A lesson card in the "up next" list on the lesson page
export interface LessonCard {
  id: string;
  title: string;
  durationSeconds: number;
  position: number;
  status: Status;
  positionSeconds: number;
}

// GET /lessons/:id
export interface LessonDetail {
  lesson: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    durationSeconds: number;
    position: number;
    courseId: string;
    course: { id: string; title: string };
  };
  progress: { positionSeconds: number; completed: boolean };
  nextLessonId: string | null;
  lessons: LessonCard[];
}

// What PUT /lessons/:id/progress sends back
export interface ProgressSaved {
  course: { lessonCount: number; completedLessons: number; progressPercent: number; completed: boolean };
}

export interface AdminTotals {
  learners: number;
  publishedCourses: number;
  draftCourses: number;
  enrollments: number;
  completedEnrollments: number;
  lessonsCompleted: number;
}

export interface AdminDashboard {
  totals: AdminTotals;
  recentEnrollments: { id: string; learnerName: string; learnerEmail: string; courseTitle: string; enrolledAt: string }[];
  topCourses: { id: string; title: string; enrollments: number }[];
}

// A lesson as the admin sees it: with the video link
export interface AdminLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
  position: number;
}

// GET /admin/courses/:id (also works for drafts)
export interface AdminCourse extends Course {
  lessons: AdminLesson[];
}

export interface CourseInput {
  title: string;
  category: string;
  description: string;
  thumbnailUrl: string | null;
  published: boolean;
}

export interface LessonInput {
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
}

export interface CourseLearner {
  userId: string;
  name: string;
  email: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt: string | null;
  completedLessons: number;
  progressPercent: number;
}

export interface AdminLearner {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrolledCourses: number;
}