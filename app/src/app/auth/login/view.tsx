"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";
import { resolvePostAuthRedirect } from "@/lib/safe-redirect";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional(),
});

type LoginValues = z.infer<typeof LoginSchema>;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { next },
  });

  const onSubmit = async (values: LoginValues) => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      toast.error("Sign-in succeeded but no session was created. Try again.");
      return;
    }

    const user = session.user;
    let role: string | null | undefined = user.user_metadata?.role;

    // Ensure a profiles row exists for this user (older accounts may be missing it).
    const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
    const email = user.email ?? null;
    if (user?.id) {
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        email,
        full_name: fullName,
        role: role ?? "seeker",
      });
      if (upsertError) {
        console.warn("[auth] profile upsert failed", upsertError.message);
      }
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileRow?.role) role = profileRow.role;

    const destination = resolvePostAuthRedirect({
      role,
      next: values.next ?? next,
    });

    toast.success("Welcome back to Aureo.");
    router.replace(destination);
    router.refresh();
  };

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Access your applications, recommendations, and employer tools.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-foreground">Password</label>
            <button
              type="button"
              className="text-xs font-semibold text-primary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <input type="hidden" {...register("next")} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/auth/register" className="font-semibold text-primary">
          Create one
        </Link>
        .
      </p>
    </div>
  );
}
