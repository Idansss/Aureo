"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { reportJob } from "./actions";

const ReportSchema = z.object({
  reason: z.string().min(3),
  details: z.string().min(10),
});

type ReportValues = z.infer<typeof ReportSchema>;

interface ReportJobDialogProps {
  jobId: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  triggerClassName?: string;
  triggerIcon?: LucideIcon;
}

export function ReportJobDialog({
  jobId,
  triggerLabel,
  triggerVariant,
  triggerClassName,
  triggerIcon: TriggerIcon,
}: ReportJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<ReportValues>({
    resolver: zodResolver(ReportSchema),
  });

  const onSubmit = (values: ReportValues) => {
    startTransition(async () => {
      const result = await reportJob({ jobId, ...values });
      if (result.ok) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant ?? "ghost"}
          className={cn(TriggerIcon ? "gap-2" : undefined, triggerClassName)}
        >
          {TriggerIcon ? <TriggerIcon className="h-4 w-4" aria-hidden /> : null}
          {triggerLabel ?? "Report job"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this job</DialogTitle>
          <DialogDescription>
            Flag suspicious behavior, scams, or inaccurate information. Our team
            reviews every report within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <Input
              placeholder="Scam suspicion, salary unclear..."
              {...form.register("reason")}
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Details
            </label>
            <Textarea
              placeholder="Share links, recruiter names, or context."
              rows={4}
              {...form.register("details")}
            />
            {form.formState.errors.details && (
              <p className="text-xs text-destructive">
                {form.formState.errors.details.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
