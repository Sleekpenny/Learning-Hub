import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Role } from "@/types/global";
import { ApiError } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Only allow redirects to pages on this site
export function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

// Where a user lands after logging in. Admins stay in /admin, learners never go there.
export function landingPath(role: Role, next: string | null) {
  if (role === "ADMIN") return next?.startsWith("/admin") ? next : "/admin";
  return next && !next.startsWith("/admin") ? next : "/dashboard";
}

export function toFailure(error: unknown): { success: false; code: string; message: string;  } {
  if (error instanceof ApiError) {
    return { success: false, code: error.code, message: `error.message ${error.details},`  };
  }
  console.error(error);
  return { success: false, code: "UNKNOWN", message: "Something went wrong. Please try again.", };
}

export function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export function isUrl(value: string) {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

export function splitDuration(totalSeconds: number) {
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}