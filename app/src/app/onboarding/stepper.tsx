"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { completeOnboarding, type OnboardingPayload } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfileRecord } from "@/lib/types";

const schema = z.object({
  fullName: z.string().min(2),
  headline: z.string().min(10),
  location: z.string().min(2),
  interests: z.array(z.string()).min(1),
  cvUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

const interestOptions = [
  "Product Design",
  "Engineering",
  "Marketing",
  "Operations",
  "Customer Success",
];

const steps = [
  { key: "profile", title: "Profile basics" },
  { key: "interests", title: "Role interests" },
  { key: "assets", title: "Proof & CV" },
];

export function OnboardingFlow({ profile }: { profile: ProfileRecord | null }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      headline: profile?.headline ?? "",
      location: profile?.location ?? "",
      interests:
        profile?.bio
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? ["Product Design"],
      cvUrl: profile?.cv_url ?? "",
      portfolioUrl: "",
    },
  });

  const onSubmit = async (values: OnboardingPayload) => {
    const result = await completeOnboarding(values);
    if (!result.ok) {
      toast.error(result.error ?? "Unable to save onboarding.");
      return;
    }
    toast.success("You're all set.");
    router.push("/app");
    router.refresh();
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-8 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-2">
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground",
              ].join(" ")}
            >
              {index + 1}
            </span>
            <span className="text-sm font-medium text-foreground">
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full name
              </label>
              <Input placeholder="Your full name" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Headline
              </label>
              <Textarea
                placeholder="What describes you best?"
                {...register("headline")}
              />
              {errors.headline && (
                <p className="text-xs text-destructive">
                  {errors.headline.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Location / timezone
              </label>
              <Input
                placeholder="e.g. Remote • GMT +1"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select at least one area you want Aureo to recommend roles for.
            </p>
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => {
                    const active = field.value.includes(interest);
                    return (
                      <Badge
                        key={interest}
                        variant={active ? "accent" : "outline"}
                        className="cursor-pointer select-none"
                        onClick={() => {
                          if (active) {
                            field.onChange(
                              field.value.filter((item) => item !== interest),
                            );
                          } else {
                            field.onChange([...field.value, interest]);
                          }
                        }}
                      >
                        {interest}
                      </Badge>
                    );
                  })}
                </div>
              )}
            />
            {errors.interests && (
              <p className="text-xs text-destructive">
                {errors.interests.message}
              </p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                CV or resume link
              </label>
              <Input placeholder="https://..." {...register("cvUrl")} />
              {errors.cvUrl && (
                <p className="text-xs text-destructive">
                  {errors.cvUrl.message?.toString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Portfolio link
              </label>
              <Input
                placeholder="https://notion.so/portfolio"
                {...register("portfolioUrl")}
              />
              {errors.portfolioUrl && (
                <p className="text-xs text-destructive">
                  {errors.portfolioUrl.message?.toString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next step
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Finishing..." : "Complete onboarding"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
