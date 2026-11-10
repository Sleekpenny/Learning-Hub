"use client";

import { useReveal } from "@/lib/motion";
import { Container } from "../common/container";
import { steps } from "@/lib/contstant";

const HowItWorks = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} aria-labelledby="steps-heading" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p data-reveal className="text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 id="steps-heading" data-reveal className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Start learning in three steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} data-reveal className="rounded-2xl border bg-white p-6 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
export default HowItWorks;