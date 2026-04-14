"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "sonner";

export default function Provider({ children }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        {children}
        <Toaster richColors position="top-right" />
      </HeroUIProvider>
    </SessionProvider>
  );
}
