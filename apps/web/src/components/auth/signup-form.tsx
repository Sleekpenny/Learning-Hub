"use client";

import { useForm } from "react-hook-form";
import InputFields from "../forms-components/input-forms";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { interests, passwordRules } from "@/lib/contstant";
import { cn, landingPath, safeNext, toFailure } from "@/lib/utils";
import { Check } from "lucide-react";
import CountrySelectField from "../forms-components/country-fields";
import Link from "next/link";
import SelectFields from "../forms-components/select-forms";
import { useStartSession } from "@/lib/auth";
import { SignUpFormData } from "@/types/global";
import { signupAction } from "@/actions/auth";
import { toast } from "sonner";

const SignUpForm = () => {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const startSession = useStartSession();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "",
      areaOfInterest: "",
    },
    mode: "onBlur",
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignUpFormData) => {
         const result = await signupAction(data);

      if (!result.success) { 
        toast.error(result.message, { description: Object.values(result).join(". ") || undefined });
        return;        
      }     

      startSession(result.data);
      router.replace(landingPath(result.data.role, next));
    
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputFields
          name="name"
          label="Full Name"
          placeholder="John Doe"
          register={register}
          error={errors.name}
          validation={{ required: "Full name is required", minLength: 2 }}
        />

        <InputFields
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
        />

        <div>
          <InputFields
            name="password"
            label="Password"
            placeholder="Enter a strong password"
            type="password"
            register={register}
            error={errors.password}
            validation={{
              required: "Enter a password",
              validate: (value: string) =>
                passwordRules.every((rule) => rule.test(value)) ||
                "Password does not meet all the rules below",
            }}
            hint={
              <ul
                className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1"
                aria-label="Password rules"
              >
                {passwordRules.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        passed ? "text-emerald-700" : "text-muted-foreground",
                      )}
                    >
                      <Check
                        className={cn("size-3", !passed && "opacity-30")}
                      />
                      {rule.label}
                      <span className="sr-only">
                        {passed ? " (done)" : " (not yet)"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CountrySelectField
            name="country"
            label="Country"
            control={control}
            error={errors.country}
            required
          />

          

          <SelectFields
            name="areaOfInterest"
            label="Area of interest"
            placeholder="Select your preferred industry"
            options={interests}
            control={control}
            error={errors.areaOfInterest}
            required
          />
        </div>

        <Button
          disabled={isSubmitting}
          className="w-full rounded-full"
          type="submit"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <div>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/sign-in"}
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
