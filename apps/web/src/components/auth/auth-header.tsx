"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../ui/button";

// The top of the login and signup pages: logo on the left, a link to the other page on the right.
// There is no navbar on these pages on purpose.
export function AuthHeader() {
  const onSignup = usePathname() === "/sign-in";

  return (
    <header className="flex items-end justify-end">
      <Link
        href={onSignup ? "/sign-up" : "/sign-in"}
        className={buttonVariants({ variant: "outline", className: "rounded-full" })}
      >
        {!onSignup ? "Log in" : "Register"}
      </Link>
    </header>
  );
}