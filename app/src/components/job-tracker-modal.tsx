"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabaseBrowser } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { JobTracker } from "@/lib/types-extended"

interface JobTrackerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  onSuccess?: () => void
}

export function JobTrackerModal({
  open,
  onOpenChange,
  jobId,
  onSuccess,
}: JobTrackerModalProps) {
  const [status, setStatus] = useState<JobTracker["status"]>("saved")
  const [notes, setNotes] = useState("")
  const [existing, setExisting] = useState<JobTracker | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && jobId) {
      const supabase = supabaseBrowser()
      ;(async () => {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) {
          toast.error("Please log in")
          onOpenChange(false)
          return
        }

        const { data, error } = await supabase
          .from("job_tracker_items")
          .select("id, user_id, job_id, status, notes, created_at, updated_at")
          .eq("user_id", auth.user.id)
          .eq("job_id", jobId)
          .maybeSingle()

        if (error) {
          console.error("Failed to load tracker:", error)
          setExisting(null)
          setStatus("saved")
          setNotes("")
          return
        }

        if (data) {
          const tracker: JobTracker = {
            id: String(data.id),
            userId: String(data.user_id),
            jobId: String(data.job_id),
            status: data.status as JobTracker["status"],
            notes: data.notes ?? undefined,
            createdAt: String(data.created_at),
            updatedAt: String(data.updated_at ?? data.created_at),
          }
          setExisting(tracker)
          setStatus(tracker.status)
          setNotes(tracker.notes || "")
        } else {
          setExisting(null)
          setStatus("saved")
          setNotes("")
        }
      })()
    }
  }, [open, jobId])

  const handleSubmit = async () => {
    const supabase = supabaseBrowser()
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        toast.error("Please log in")
        return
      }

      const payload = {
        user_id: auth.user.id,
        job_id: jobId,
        status,
        notes: notes ? notes : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("job_tracker_items").upsert(payload as any, {
        onConflict: "user_id,job_id",
      } as any)

      if (error) {
        console.error("Failed to save tracker:", error)
        toast.error("Could not save tracker")
        return
      }

      toast.success(existing ? "Tracker updated" : "Job added to tracker")
      onSuccess?.()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Update Job Status" : "Track Job"}</DialogTitle>
          <DialogDescription>
            Track the status of this job application
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: JobTracker["status"]) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this job..."
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {saving ? "Saving..." : existing ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



