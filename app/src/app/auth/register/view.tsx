"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabaseBrowser } from "@/lib/supabase/client";
import { resolvePostAuthRedirect, resolveSafeNext } from "@/lib/safe-redirect";

const RegisterSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Minimum 8 characters."),
  accountType: z.enum(["seeker", "employer"] as const, {
    message: "Select an account type.",
  }),
  next: z.string().optional(),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

function buildEmailRedirectTo(next: string | null) {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "").replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const url = new URL("/auth/confirm", base);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getValues,
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      accountType: "seeker",
      next,
    },
  });

  const safeNextFromProps = useMemo(() => resolveSafeNext(next), [next]);

  const onSubmit = async (values: RegisterValues) => {
    const safeNext = resolveSafeNext(values.next) ?? safeNextFromProps;

    const supabase = supabaseBrowser();
    const emailRedirectTo = buildEmailRedirectTo(safeNext);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: values.accountType,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      setConfirmationEmail(values.email);
      toast.success("Check your email to confirm your account.");
      return;
    }

    const user = session.user ?? data.user;
    if (user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: values.fullName,
        role: values.accountType,
      });
      if (profileError) {
        console.warn("[auth] profile upsert failed", profileError.message);
      }
    }

    const destination = resolvePostAuthRedirect({
      role: values.accountType,
      next: safeNext,
    });

    toast.success("Account created. Welcome!");
    router.replace(destination);
    router.refresh();
  };

  if (confirmationEmail) {
    return (
      <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Confirm your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{confirmationEmail}</span>.
            Open it to finish creating your account.
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-secondary p-4 text-sm text-muted-foreground">
          If you don't see it, check your spam folder. The link expires after a
          short time.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={resending}
            onClick={async () => {
              setResending(true);
              try {
                const supabase = supabaseBrowser();
                const safeNext = resolveSafeNext(getValues("next")) ?? safeNextFromProps;
                const emailRedirectTo = buildEmailRedirectTo(safeNext);
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: confirmationEmail,
                  options: { emailRedirectTo },
                });
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success("Confirmation email resent.");
                }
              } finally {
                setResending(false);
              }
            }}
          >
            {resending ? "Resending..." : "Resend email"}
          </Button>

          <Button asChild>
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold text-foreground">
          Create your Aureo account
        </h2>
        <p className="text-sm text-muted-foreground">
          Verified employers and seekers share the same calm toolkit.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <Input placeholder="Ada Lovelace" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
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
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-semibold text-primary"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Account type</label>
          <Controller
            name="accountType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose who you are" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeker">Job seeker</SelectItem>
                  <SelectItem value="employer">Employer / recruiter</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountType && (
            <p className="text-xs text-destructive">{errors.accountType.message}</p>
          )}
        </div>

        <input type="hidden" {...register("next")} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
