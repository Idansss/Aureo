"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { routes } from "@/lib/routes";
import { supabaseBrowser } from "@/lib/supabase/client";
import { applyToJob } from "./actions";

type ApplyFlowDialogProps = {
  jobId: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  triggerClassName?: string;
};

export function ApplyFlowDialog({
  jobId,
  triggerLabel,
  triggerVariant,
  triggerClassName,
}: ApplyFlowDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const autoOpenedRef = React.useRef(false);

  React.useEffect(() => {
    if (autoOpenedRef.current) return;
    const shouldOpen = searchParams?.get("apply") === "1";
    if (!shouldOpen) return;
    autoOpenedRef.current = true;
    setOpen(true);
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      // ignore
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setPortfolioUrl("");
      setNotes("");
    }
  }, [open]);

  const steps = [
    {
      title: "Confirm your profile",
      description: "Aureo uses your saved profile to apply quickly.",
      content: (
        <div className="space-y-3 text-sm text-foreground">
          <div className="rounded-[var(--radius)] border border-border bg-secondary p-4">
            <p className="font-semibold text-foreground">What gets sent</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Your name and headline</li>
              <li>Your CV link (if available)</li>
              <li>Your selected portfolio links</li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            You can edit your profile anytime from the dashboard. This application will reference the latest version.
          </p>
        </div>
      ),
    },
    {
      title: "Add links and notes",
      description: "Optional context helps hiring teams review faster.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Portfolio link</label>
            <Input
              placeholder="https://your-portfolio.com"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share one strong link, keep it focused.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Note to the hiring team</label>
            <Textarea
              placeholder="A short message about your fit, availability, and relevant proof."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Review and submit",
      description: "Confirm details before sending.",
      content: (
        <div className="space-y-3 text-sm">
          <div className="rounded-[var(--radius)] border border-border bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Job</span>
              <span className="font-semibold text-foreground">{jobId}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Portfolio</span>
              <span className="font-semibold text-foreground">
                {portfolioUrl ? "Included" : "Not included"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Note</span>
              <span className="font-semibold text-foreground">
                {notes.trim() ? "Included" : "Not included"}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">
            By submitting, you agree to share your profile and links with the employer for this role.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[step];

  const submit = () => {
    startTransition(async () => {
      const sessionResult = await supabaseBrowser().auth.getSession();
      const session = sessionResult.data.session;
      if (!session) {
        toast.error("Please sign in to apply.");
        router.push("/auth/login");
        return;
      }

      const result = await applyToJob({ jobId });
      if (result.ok) {
        toast.success(result.message, {
          action: {
            label: "View applications",
            onClick: () => router.push(routes.app.applications),
          },
        });
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
          className={triggerClassName ?? "w-full md:w-auto"}
          variant={triggerVariant ?? "primary"}
        >
          {triggerLabel ?? "Apply with Aureo"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-background px-4 py-3 text-sm">
            <span className="text-muted-foreground">Step {step + 1} of {steps.length}</span>
            {step === steps.length - 1 ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Ready
              </span>
            ) : null}
          </div>
          {current.content}
        </div>

        <DialogFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={pending || step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                disabled={pending}
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Continue
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={submit}>
                {pending ? "Submitting" : "Submit application"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
