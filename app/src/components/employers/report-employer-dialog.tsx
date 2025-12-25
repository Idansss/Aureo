"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reportEmployer } from "@/components/employers/report-employer-actions";

const Schema = z.object({
  reason: z.string().min(3, "Add a short reason."),
  details: z.string().min(10, "Add a few details."),
});

type Values = z.infer<typeof Schema>;

export function ReportEmployerDialog({ employerId, employerName }: { employerId: string; employerName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(Schema) });

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      const result = await reportEmployer({
        companyId: employerId,
        reason: values.reason,
        details: values.details,
      });
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
        <Button type="button" variant="ghost">
          <Flag className="mr-2 h-4 w-4" aria-hidden />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this employer</DialogTitle>
          <DialogDescription>
            Flag suspicious behavior, impersonation, or inaccurate company details. Reports help keep the marketplace trustworthy.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <Input placeholder="Impersonation, suspicious outreach, unclear ownership." {...form.register("reason")} />
            {form.formState.errors.reason ? (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Details</label>
            <Textarea placeholder="Share links, recruiter names, or context." rows={4} {...form.register("details")} />
            {form.formState.errors.details ? (
              <p className="text-xs text-destructive">{form.formState.errors.details.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

