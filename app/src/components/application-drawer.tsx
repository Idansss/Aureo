"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription as DialogBody, DialogFooter, DialogHeader as DialogHead, DialogTitle as DialogTitleText } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CompanyBadge } from "@/components/company-badge"
import { StatusPill } from "@/components/status-pill"
import { Timeline } from "@/components/timeline"
import type { Application } from "@/lib/types"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { listApplicationEvents, updateApplicationNotes, withdrawApplication } from "@/app/app/applications/actions"

interface ApplicationDrawerProps {
  application: Application | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplicationDrawer({ application, open, onOpenChange }: ApplicationDrawerProps) {
  if (!application) return null

  const [notes, setNotes] = useState(application.notes ?? "")
  const [status, setStatus] = useState<Application["status"]>(application.status)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [events, setEvents] = useState<Application["timeline"]>(application.timeline ?? [])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setNotes(application.notes ?? "")
    setStatus(application.status)
  }, [application])

  useEffect(() => {
    if (!open || !application?.id) return
    let cancelled = false
    ;(async () => {
      const res = await listApplicationEvents(application.id)
      if (cancelled) return
      if (!res.ok) return
      const mapped: Application["timeline"] = res.data.map((e) => ({
        title: e.to_status ? `Status → ${e.to_status}` : "Update",
        description: e.note ?? undefined,
        timestamp: e.created_at,
      }))
      setEvents(mapped)
    })()
    return () => {
      cancelled = true
    }
  }, [open, application?.id])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div>
            <SheetTitle className="text-xl">{application.job.title}</SheetTitle>
            <SheetDescription className="mt-2">
              <CompanyBadge
                name={application.job.company}
                logo={application.job.companyLogo}
                verified={application.job.verified}
              />
            </SheetDescription>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <span className="text-sm text-muted-foreground">
              Applied {new Date(application.appliedAt).toLocaleDateString()}
            </span>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Application Timeline</h3>
            <Timeline items={(events ?? []).map((event) => ({
              title: event.title,
              description: event.description,
              timestamp: event.timestamp ? new Date(event.timestamp).toLocaleDateString() : undefined,
            }))} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add private notes about this application..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const res = await updateApplicationNotes({ applicationId: application.id, notes })
                  if (!res.ok) {
                    toast.error(res.error)
                    return
                  }
                  toast.success("Notes saved")
                })
              }}
            >
              Save Notes
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary" className="w-full gap-2" asChild>
              <Link
                href={`/jobs/${application.job.id}`}
                onClick={() => onOpenChange(false)}
              >
                <ExternalLink className="h-4 w-4" />
                View Job Details
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setWithdrawOpen(true)}>
              Withdraw Application
            </Button>
          </div>
        </div>
      </SheetContent>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHead>
            <DialogTitleText>Withdraw application?</DialogTitleText>
            <DialogBody>
              This will withdraw your application and update your tracker.
            </DialogBody>
          </DialogHead>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const res = await withdrawApplication({ applicationId: application.id })
                  if (!res.ok) {
                    toast.error(res.error)
                    return
                  }
                  setStatus("withdrawn")
                  setWithdrawOpen(false)
                  onOpenChange(false)
                  toast.success("Application withdrawn")
                })
              }}
            >
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
