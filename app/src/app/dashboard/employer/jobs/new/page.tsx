"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createEmployerJob } from "./actions";

const JobFormSchema = z.object({
  title: z.string().min(4, "Add a clear role title."),
  location: z.string().optional(),
  remoteFriendly: z.boolean().optional(),
  employmentType: z.string().optional(),
  salaryCurrency: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  description: z.string().min(20, "Describe the role so candidates can decide."),
  requirements: z.string().optional(),
  status: z.enum(["Draft", "Live"]).default("Live"),
});

type JobFormValues = z.infer<typeof JobFormSchema>;

export default function NewEmployerJobPage() {
  const router = useRouter();
  const [remote, setRemote] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema) as any,
    defaultValues: {
      status: "Live",
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    const salaryMin = values.salaryMin ? Number(values.salaryMin) : undefined;
    const salaryMax = values.salaryMax ? Number(values.salaryMax) : undefined;

    const result = await createEmployerJob({
      title: values.title,
      description: values.description,
      requirements: values.requirements,
      employment_type: values.employmentType,
      location: values.location,
      remote: Boolean(values.remoteFriendly),
      salary_min: salaryMin && !Number.isNaN(salaryMin) ? salaryMin : undefined,
      salary_max: salaryMax && !Number.isNaN(salaryMax) ? salaryMax : undefined,
      currency: values.salaryCurrency,
    });

    if (!result.ok) {
      toast.error(result.error ?? "Unable to create job.");
      return;
    }

    toast.success("Job created.");
    router.push(`/dashboard/employer/jobs/${result.id}`);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Create job"
        description="Shape a role that sets expectations clearly, then track applicants through the pipeline."
      />

      <form
        className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Role title</Label>
            <Input id="title" placeholder="Lead Product Designer" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe the mission, impact, and expectations for this role."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            rows={4}
            placeholder="Required experience, skills, and working style."
            {...register("requirements")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment type</Label>
            <Input id="employmentType" placeholder="Full-time, Contract" {...register("employmentType")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Remote, Lagos, Hybrid" {...register("location")} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={remote}
            onCheckedChange={(checked) => {
              setRemote(checked);
              setValue("remoteFriendly", checked);
            }}
          />
          <span className="text-sm text-foreground">Remote friendly</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="salaryCurrency">Currency</Label>
            <Input id="salaryCurrency" placeholder="USD" {...register("salaryCurrency")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Min salary</Label>
            <Input id="salaryMin" type="number" placeholder="90000" {...register("salaryMin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax">Max salary</Label>
            <Input id="salaryMax" type="number" placeholder="120000" {...register("salaryMax")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="Draft"
                {...register("status")}
                className="h-4 w-4 border border-input text-primary"
              />
              Draft
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="Live"
                defaultChecked
                {...register("status")}
                className="h-4 w-4 border border-input text-primary"
              />
              Live
            </label>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-secondary p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Trust check</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            <li>Share salary ranges and employment type.</li>
            <li>Describe tasks clearly, avoid vague language.</li>
            <li>Never request sensitive info or upfront payments.</li>
          </ul>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? "Saving..." : "Create job"}
        </Button>
      </form>
    </div>
  );
}
