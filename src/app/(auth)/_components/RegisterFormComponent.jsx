"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { handleRegisterAction } from "../../../action/auth.action";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, "Full name must be at least 5 characters."),
  email: z
    .email("Please enter a valid email address.")
    .regex(/@gmail\.com$/i, "Email must end with @gmail.com."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[0-9]/, "Password must include at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must include at least one special character."),
  birthDate: z
    .string()
    .min(1, "Birthdate is required.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Birthdate is invalid.")
    .refine((value) => {
      const birthDate = new Date(value);
      const eighteenBirthday = new Date(birthDate);
      eighteenBirthday.setFullYear(eighteenBirthday.getFullYear() + 18);
      return eighteenBirthday <= new Date();
    }, "You must be at least 18 years old."),
});

export default function RegisterFormComponent() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      birthDate: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    const normalizedFullName = data.fullName.trim().replace(/\s+/g, " ");
    const nameParts = normalizedFullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "-";

    const payload = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      birthDate: data.birthDate,
    };

    const result = await handleRegisterAction(payload);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    setSubmitSuccess(result.message || "Account created successfully.");
    reset();

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {submitSuccess}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Full name</label>
        <input
          type="text"
          {...register("fullName")}
          placeholder="Jane Doe"
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
        />
        {errors.fullName && (
          <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-20 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Birthdate
        </label>
        <input
          type="date"
          {...register("birthDate")}
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-lime-400/20 focus:border-lime-400 focus:ring-2"
        />
        {errors.birthDate && (
          <p className="mt-2 text-sm text-red-600">{errors.birthDate.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="solid"
        isDisabled={isSubmitting}
        className="w-full rounded-full bg-lime-400 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-lime-300"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
