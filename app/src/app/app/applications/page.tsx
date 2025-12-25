"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ViewToggle } from "@/components/view-toggle"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusPill } from "@/components/status-pill"
import { CompanyBadge } from "@/components/company-badge"
import { ApplicationDrawer } from "@/components/application-drawer"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Application } from "@/lib/types"
import { AuthGuard } from "@/lib/auth-guard"
import { supabaseBrowser } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ApplicationsPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <ApplicationsPageContent />
    </AuthGuard>
  )
}

function ApplicationsPageContent() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadApplications()
  }, [])

  const loadApplications = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id,status,created_at,updated_at,notes,withdrawn_at,jobs:job_id(id,title,companies:company_id(name,verified,logo_url))",
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load applications:", error)
      toast.error("Could not load applications")
      return
    }

    setApplications(
      (data ?? []).map((row: any) => {
        const createdAt = String(row.created_at ?? new Date().toISOString())
        const status = (row.status ?? "applied") as Application["status"]
        const job = row.jobs ?? {}
        const company = job.companies ?? {}

        const timeline = [
          {
            title: "Application submitted",
            description: "Your application has been received",
            timestamp: createdAt,
          },
        ]

        return {
          id: String(row.id),
          status,
          appliedAt: createdAt,
          job: {
            id: String(job.id ?? ""),
            title: String(job.title ?? "Job"),
            company: String(company.name ?? ""),
            companyLogo: company.logo_url ?? undefined,
            verified: Boolean(company.verified ?? false),
          },
          timeline,
          notes: typeof row.notes === "string" ? row.notes : undefined,
        } satisfies Application
      }),
    )
  }

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application)
    setDrawerOpen(true)
  }

  // Group applications by status for kanban view
  const groupedApplications = {
    applied: applications.filter((a) => a.status === "applied"),
    screening: applications.filter((a) => a.status === "screening"),
    interview: applications.filter((a) => a.status === "interview"),
    offer: applications.filter((a) => a.status === "offer"),
    rejected: applications.filter((a) => a.status === "rejected"),
    withdrawn: applications.filter((a) => a.status === "withdrawn"),
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Applications"
          description="Track and manage your job applications"
          className="mb-8"
          actions={<ViewToggle view={view} onViewChange={setView} />}
        />

        {view === "grid" ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Object.entries(groupedApplications).map(([status, applications]) => (
              <div key={status} className="flex-shrink-0 w-80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{status}</h3>
                    <span className="text-sm text-muted-foreground">({applications.length})</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {applications.map((application) => (
                    <Card
                      key={application.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleApplicationClick(application)}
                    >
                      <CardHeader className="p-4 space-y-3">
                        <StatusPill status={application.status} />
                        <div>
                          <h4 className="font-semibold mb-2 line-clamp-1">{application.job.title}</h4>
                          <CompanyBadge
                            name={application.job.company}
                            logo={application.job.companyLogo}
                            verified={application.job.verified}
                            size="sm"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {applications.length === 0 && (
                    <Card className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No applications</p>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer"
                    onClick={() => handleApplicationClick(application)}
                  >
                    <TableCell className="font-medium">{application.job.title}</TableCell>
                    <TableCell>
                      <CompanyBadge
                        name={application.job.company}
                        logo={application.job.companyLogo}
                        verified={application.job.verified}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={application.status} />
                    </TableCell>
                    <TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Date(application.timeline[application.timeline.length - 1].timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplicationClick(application)
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

      <ApplicationDrawer application={selectedApplication} open={drawerOpen} onOpenChange={setDrawerOpen} />

      <Footer />
    </div>
  )
}
