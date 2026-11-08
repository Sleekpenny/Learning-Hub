export type Role = "LEARNER" | "ADMIN";
export type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type LoginPortal = "learner" | "admin";
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: string; message: string; };


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
    fullName: string;
  email: string;
  password: string;
  country: string;
  areaOfInterest: string;
}

export interface SignInFormData {
    password: string,
    email:string
}

export type SelectFieldProps = {
        name: string;
        label: string;
        placeholder: string;
        options: readonly Option[];
        control: Control;
        error?: FieldError;
        required?: boolean;
    };

export type Props = {
  course: Course;
  progress?: { progressPercent: number; status: Status };
};