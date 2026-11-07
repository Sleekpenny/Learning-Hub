"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../ui/button";

// The top of the login and signup pages: logo on the left, a link to the other page on the right.
// There is no navbar on these pages on purpose.
export function AuthHeader() {
  const onSignup = usePathname() === "/sign-up";

  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
      <Link
        href={onSignup ? "/sign-in" : "/sign-up"}
        className={buttonVariants({ variant: "outline", className: "rounded-full" })}
      >
        {onSignup ? "Log in" : "Register"}
      </Link>
    </header>
  );
}