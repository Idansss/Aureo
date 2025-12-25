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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAlert } from "@/app/app/saved/actions";
import { toast } from "sonner";
import { Bell } from "lucide-react";

interface CreateAlertDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CreateAlertDialog({ onSuccess, trigger }: CreateAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Alert name is required");
      return;
    }

    setLoading(true);
    const result = await createAlert({
      name: name.trim(),
      criteria: {
        keywords: keywords.trim() || undefined,
        location: location.trim() || undefined,
        remote: remote || undefined,
      },
      frequency,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Alert created");
      setName("");
      setKeywords("");
      setLocation("");
      setRemote(false);
      setFrequency("daily");
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to create alert");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" aria-hidden />
            Job Alerts
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
            <DialogDescription>Get notified when new jobs match your criteria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-name">Alert Name</Label>
              <Input
                id="alert-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Remote Frontend Jobs"
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., React, TypeScript"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Lagos, Remote"
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="remote">Remote only</Label>
              <Switch id="remote" checked={remote} onCheckedChange={setRemote} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)} disabled={loading}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


