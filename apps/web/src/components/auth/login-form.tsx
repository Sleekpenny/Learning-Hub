"use client";
import { useForm } from "react-hook-form";
import InputFields from "../forms-components/input-forms";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useStartSession } from "@/lib/auth";
import { LoginPortal, SignInFormData } from "@/types/global";
import { loginAction } from "@/actions/auth";

const LogInForm = ({ portal }: { portal: LoginPortal }) => {
  const startSession = useStartSession();
  const router = useRouter();
  //const next = safeNext(useSearchParams().get("next"));

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
    try {
      const result = await loginAction(data, portal);
      console.log(data);
      //startSession(result);
      //router.replace(landingPath(result.data.role, next));
    } catch (e) {
      console.error(e);
      //     toast.error('Sign in failed', {
      //     description: Object.keys(result.fields).length === 0 ? result.message : null
      //   })
    }
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
