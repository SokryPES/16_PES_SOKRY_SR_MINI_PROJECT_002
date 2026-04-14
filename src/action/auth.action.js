"use client";

import { signIn } from "next-auth/react";

const REGISTER_ENDPOINT = "https://homework-api.noevchanmakara.site/api/v1/auths/register";

export const handleLoginAction = async (data, callbackUrl = "/") => {
  const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
    callbackUrl,
  });

  return {
    ok: Boolean(result?.ok ?? !result?.error),
    error: result?.error ?? null,
    url: result?.url ?? callbackUrl,
  };
};

export const handleRegisterAction = async (payload) => {
  try {
    const response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        ok: false,
        message: data?.message || "Registration failed. Please try again.",
      };
    }

    return {
      ok: true,
      message: data?.message || "Account created successfully.",
      data,
    };
  } catch {
    return {
      ok: false,
      message: "Unable to reach register service. Please try again.",
    };
  }
};