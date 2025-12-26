"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/lib/auth-guard"
import { Bookmark, FolderPlus, Bell, Clock, MapPin, DollarSign, Trash2, Play, Edit, X, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"
import { IconBadge } from "@/components/ui/icon-badge"
import type { JobRecord } from "@/lib/types"
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog"
import { CreateAlertDialog } from "@/components/alerts/create-alert-dialog"
import { CreateReminderDialog } from "@/components/reminders/create-reminder-dialog"
import {
  listSavedJobs,
  toggleSavedJob,
  listFolders,
  deleteFolder,
  listAlerts,
  deleteAlert,
  toggleAlert,
  runAlertNow,
  listReminders,
  cancelReminder,
} from "@/app/app/saved/actions"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SavedJobsPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <SupabaseSavedJobsPageContent />
    </AuthGuard>
  )
}

function SupabaseSavedJobsPageContent() {
  const [activeTab, setActiveTab] = useState("jobs")
  const [savedJobs, setSavedJobs] = useState<Array<{ id: string; folder_id: string | null; job: JobRecord }>>([])
  const [folders, setFolders] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    const qp = searchParams.get("tab")
    if (qp) setActiveTab(qp)
    loadSavedJobs()
    loadFolders()
    loadAlerts()
    loadReminders()
  }, [searchParams])

  const loadSavedJobs = async () => {
    const result = await listSavedJobs()
    if (result.ok) {
      setSavedJobs(result.data || [])
    }
  }

  const loadFolders = async () => {
    const result = await listFolders()
    if (result.ok) {
      setFolders(result.data || [])
    }
  }

  const loadAlerts = async () => {
    const result = await listAlerts()
    if (result.ok) {
      setAlerts(result.data || [])
    }
  }

  const loadReminders = async () => {
    const result = await listReminders()
    if (result.ok) {
      setReminders(result.data || [])
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder? Jobs in this folder won't be deleted.")) return
    setLoading(true)
    const result = await deleteFolder(id)
    setLoading(false)
    if (result.ok) {
      toast.success("Folder deleted")
      loadFolders()
    } else {
      toast.error(result.error || "Failed to delete folder")
    }
  }

  const handleDeleteAlert = async (id: string) => {
    if (!confirm("Delete this alert?")) return
    setLoading(true)
    const result = await deleteAlert(id)
    setLoading(false)
    if (result.ok) {
      toast.success("Alert deleted")
      loadAlerts()
    } else {
      toast.error(result.error || "Failed to delete alert")
    }
  }

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    setLoading(true)
    const result = await toggleAlert(id, !isActive)
    setLoading(false)
    if (result.ok) {
      toast.success(isActive ? "Alert paused" : "Alert activated")
      loadAlerts()
    } else {
      toast.error(result.error || "Failed to toggle alert")
    }
  }

  const handleRunAlert = async (id: string) => {
    setLoading(true)
    const result = await runAlertNow(id)
    setLoading(false)
    if (result.ok) {
      toast.success(result.data?.matches ? `${result.data.matches} new matches found` : "Alert run complete")
      loadAlerts()
    } else {
      toast.error(result.error || "Failed to run alert")
    }
  }

  const handleCancelReminder = async (id: string) => {
    setLoading(true)
    const result = await cancelReminder(id)
    setLoading(false)
    if (result.ok) {
      toast.success("Reminder cancelled")
      loadReminders()
    } else {
      toast.error(result.error || "Failed to cancel reminder")
    }
  }

  const handleRemoveJob = (jobId: string) => {
    setLoading(true)
    toggleSavedJob(jobId)
      .then((res) => {
        if (!res.ok) {
          toast.error(res.error || "Failed to remove job")
          return
        }
        toast.success("Job removed from saved")
        loadSavedJobs()
      })
      .finally(() => setLoading(false))
  }

  if (!mounted) {
    return null
  }

  const filteredJobs = selectedFolder
    ? savedJobs.filter((row) => row.folder_id === selectedFolder)
    : savedJobs

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            title="Saved Jobs"
            description="Organize jobs with folders, alerts, and reminders"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6 mt-6">
            <div className="flex gap-4 mb-6">
              <Select value={selectedFolder || "all"} onValueChange={(v) => setSelectedFolder(v === "all" ? null : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Search saved jobs..." className="flex-1 max-w-md" />
            </div>

            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <IconBadge icon={Bookmark} size="lg" tone="neutral" className="mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No saved jobs yet</p>
                  <Button variant="primary" asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(({ id: savedJobId, job }) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge variant="outline" className="gap-1">
                              <Bookmark className="h-3 w-3" aria-hidden />
                              Saved
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {job.companies?.name ?? "Company"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" aria-hidden />
                              {job.location || "Remote"}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" aria-hidden />
                              {(job.salary_min || job.salary_max)
                                ? `${job.currency ?? ""} ${job.salary_min ?? ""}${job.salary_max ? ` - ${job.salary_max}` : ""}`
                                : "—"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" aria-hidden />
                              Saved {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="primary" size="sm" asChild>
                              <Link href={`/jobs/${job.id}`}>Apply Now</Link>
                            </Button>
                            <CreateReminderDialog
                              savedJobId={savedJobId}
                              jobTitle={job.title}
                              onSuccess={loadReminders}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveJob(job.id)}
                              disabled={loading}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" aria-hidden />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="folders" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Folders</h2>
              <CreateFolderDialog onSuccess={loadFolders} />
            </div>

            {folders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <IconBadge icon={FolderPlus} size="lg" tone="neutral" className="mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No folders yet</p>
                  <CreateFolderDialog
                    onSuccess={loadFolders}
                    trigger={<Button variant="primary">Create Folder</Button>}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <Card key={folder.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {folder.color && (
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: folder.color }}
                            />
                          )}
                          {folder.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Alerts</h2>
              <CreateAlertDialog onSuccess={loadAlerts} />
            </div>

            {alerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <IconBadge icon={Bell} size="lg" tone="neutral" className="mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No alerts yet</p>
                  <CreateAlertDialog
                    onSuccess={loadAlerts}
                    trigger={<Button variant="primary">Create Alert</Button>}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{alert.name}</CardTitle>
                          <CardDescription>
                            {alert.criteria.keywords && `Keywords: ${alert.criteria.keywords}`}
                            {alert.criteria.location && ` • Location: ${alert.criteria.location}`}
                            {alert.criteria.remote && " • Remote only"}
                            {` • ${alert.frequency}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRunAlert(alert.id)}
                            disabled={loading}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() => handleToggleAlert(alert.id, alert.is_active)}
                            disabled={loading}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reminders</h2>
            </div>

            {reminders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <IconBadge icon={Clock} size="lg" tone="neutral" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">No reminders set</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Set reminders from saved jobs to follow up on applications
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(reminder.remind_at).toLocaleString()}
                            </span>
                          </div>
                          {reminder.note && <p className="text-sm text-muted-foreground">{reminder.note}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelReminder(reminder.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Container>

      <Footer />
    </div>
  )
}
