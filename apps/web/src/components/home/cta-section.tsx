"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/auth";
import { useReveal } from "@/lib/motion";
import { Container } from "../common/container";
import { buttonVariants } from "../ui/button";

const CtaSection = () => {
  const ref = useReveal<HTMLElement>();
  const { user } = useCurrentUser();

  return (
    <section ref={ref} aria-labelledby="cta-heading" className="pb-16 sm:pb-24">
      <Container>
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl bg-bg-surface px-6 py-14 text-center sm:px-12"
        >
          <div
            className="absolute -left-10 -top-10 size-48 rounded-full bg-accent-primary/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-12 -right-10 size-56 rounded-full bg-accent-ai/30 blur-3xl"
            aria-hidden="true"
          />
          <h2
            id="cta-heading"
            className="relative text-3xl font-bold text-white sm:text-4xl"
          >
            Ready to start your first course?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-text-secondary">
            Create a free account, enroll in a course and watch your first
            lesson today.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href={user ? "/courses" : "/sign-up"}
              className={`${buttonVariants({ size: "lg" })} bg-accent-primary text-bg-surface hover:bg-accent-primary/90`}
            >
              {user ? "Browse courses" : "Create free account"}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
export default CtaSection