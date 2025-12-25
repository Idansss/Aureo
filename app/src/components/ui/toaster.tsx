"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="light"
      richColors
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "1rem",
          border: "1px solid rgba(210,216,226,0.8)",
          boxShadow: "0 30px 80px -45px rgba(8,12,31,0.45)",
        },
      }}
    />
  );
}
