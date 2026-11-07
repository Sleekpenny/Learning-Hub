"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SignUpForm from "../signup-form";

// The login page: a Learner / Admin switch, and the form for the chosen one.
// Radix removes the hidden tab from the page, so switching tabs also clears the form and its errors.
const RegisterPanel = ()=> {
  const params = useSearchParams();
  const next = params.get("next");

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Login to your account</h1>
    <SignUpForm />

        {/* <TabsContent value="learner" className="mt-2">
          <p className="mb-5 text-sm text-muted-foreground">Welcome back. Continue learning where you left off.</p>
          <LoginForm portal="learner" />
          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </TabsContent> */}

     
    </div>
  );
}

export default RegisterPanel;