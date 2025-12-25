"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ProfileRecord } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateProfileDetails } from "./actions";

const schema = z.object({
  fullName: z.string().min(2),
  headline: z.string().min(6),
  location: z.string().min(2),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileDetailsForm({
  profile,
}: {
  profile: ProfileRecord | null;
}) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      headline: profile?.headline ?? "",
      location: profile?.location ?? "",
      bio: profile?.bio ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await updateProfileDetails(values);
      if (!result.ok) {
        toast.error(result.error ?? "Unable to update profile.");
      } else {
        toast.success("Profile updated.");
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Profile basics</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <Input {...register("fullName")} />
          {formState.errors.fullName && (
            <p className="text-xs text-destructive">
              {formState.errors.fullName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Headline</label>
          <Input {...register("headline")} />
          {formState.errors.headline && (
            <p className="text-xs text-destructive">
              {formState.errors.headline.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Location / timezone
          </label>
          <Input {...register("location")} />
          {formState.errors.location && (
            <p className="text-xs text-destructive">
              {formState.errors.location.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bio</label>
          <Textarea rows={4} {...register("bio")} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
