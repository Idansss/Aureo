"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createReminder } from "@/app/app/saved/actions";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface CreateReminderDialogProps {
  savedJobId: string;
  jobTitle?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CreateReminderDialog({ savedJobId, jobTitle, onSuccess, trigger }: CreateReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Set default to tomorrow at 10 AM
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [remindAt, setRemindAt] = useState(getDefaultDateTime());
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindAt) {
      toast.error("Reminder date and time is required");
      return;
    }

    const remindDate = new Date(remindAt);
    if (remindDate <= new Date()) {
      toast.error("Reminder time must be in the future");
      return;
    }

    setLoading(true);
    const result = await createReminder({
      saved_job_id: savedJobId,
      remind_at: remindDate.toISOString(),
      note: note.trim() || undefined,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Reminder set");
      setRemindAt("");
      setNote("");
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to create reminder");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="h-3 w-3" aria-hidden />
            Set Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
            <DialogDescription>
              {jobTitle ? `Remind me about: ${jobTitle}` : "Set a reminder to follow up on this job"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <DateTimePicker
              id="remind-at"
              label="Date & Time"
              value={remindAt}
              onChange={setRemindAt}
              min={new Date().toISOString().slice(0, 16)}
              disabled={loading}
              required
            />
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Check application status, follow up with recruiter"
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !remindAt}>
              {loading ? "Setting..." : "Set Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

