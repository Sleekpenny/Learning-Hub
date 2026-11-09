"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "@/lib/auth";
import { PageSpinner } from "@/components/ui/state-message";
import { Role } from "@/types/global";
import { landingPath, safeNext } from "@/lib/utils";


// Wrap pages that need a login. Pass role="ADMIN" for admin-only pages.
//  - nobody logged in  -> sent to the login page (the Admin tab for admin pages)
//  - a learner on an admin page -> sent to their dashboard, and the admin page never renders
// This only decides what is shown. The API checks the login and the role again on every request.
export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const wrongRole = !!user && !!role && user.role !== role;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const portal = role === "ADMIN" ? "&portal=admin" : "";
      router.replace(`/login?next=${encodeURIComponent(pathname)}${portal}`);
    } else if (wrongRole) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, wrongRole, role, pathname, router]);

  if (isLoading || !user || wrongRole) return <PageSpinner label="Checking your session" />;
  return <>{children}</>;
}

// Wrap the login and signup pages. A user who is already logged in is sent on to their page.
// Uses useSearchParams, so the page must put this inside <Suspense>.
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  useEffect(() => {
    if (user) router.replace(landingPath(user.role, next));
  }, [user, next, router]);

  if (isLoading || user) return <PageSpinner />;
  return <>{children}</>;
}