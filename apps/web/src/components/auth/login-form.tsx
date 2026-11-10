"use client";
import { useForm } from "react-hook-form";
import InputFields from "../forms-components/input-forms";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useStartSession } from "@/lib/auth";
import { LoginPortal, SignInFormData } from "@/types/global";
import { loginAction } from "@/actions/auth";
import { landingPath, safeNext } from "@/lib/utils";
import { toast } from "sonner";

const LogInForm = ({ portal }: { portal: LoginPortal }) => {
  const startSession = useStartSession();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await loginAction(data, portal);

    if (!result.success) {
    toast.error(result.message, { description: Object.values('result').join(". ") || undefined });
    return;
  }

  await startSession(result.data);
  router.replace(landingPath(result.data.role, next));

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <InputFields
        name="email"
        label="Email"
        type="email"
        placeholder={
          portal === "admin" ? "admin@example.com" : "you@example.com"
        }
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

      <InputFields
        name="password"
        label="Password"
        placeholder="Enter a strong password"
        type="password"
        register={register}
        error={errors.password}
        validation={{ required: "Enter a strong password", minLength: 5 }}
      />

      <Button
        disabled={isSubmitting}
        className="w-full rounded-full"
        type="submit"
      >
        {isSubmitting
          ? "Logging in…"
          : portal === "admin"
            ? "Log in as admin"
            : "Log in"}
      </Button>

      <p className="text-sm text-gray-500">Forgot Password</p>
    </form>
  );
};

export default LogInForm;
function setError(arg0: string, arg1: { message: unknown; }) {
  throw new Error("Function not implemented.");
}

