"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { handleLoginAction } from "../../../action/auth.action";
import { Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";


export default function LoginFormComponent() {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitError("");
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const result = await handleLoginAction(data, callbackUrl);

    if (!result.ok) {
      setSubmitError("Email or password is incorrect.");
      return;
    }

    toast.success("Login successful");

    setTimeout(() => {
      window.location.assign(result.url || callbackUrl);
    }, 600);
  };

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {submitError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          {...register("email", { required: true })}
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">Email is required.</p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password", { required: true })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-20 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
            placeholder="Your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ?  <EyeOff size={18}/>: <Eye size={18}/> }
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">Password is required.</p>
        )}
      </div>

      <Button
        type="submit"
        variant="solid"
        isDisabled={isSubmitting}
        className="w-full rounded-full bg-lime-400 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-lime-200"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

