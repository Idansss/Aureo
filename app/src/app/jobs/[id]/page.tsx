"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Container } from "@/components/container"
import { CopyLinkButton } from "@/components/copy-link-button"
import { CompanyBadge } from "@/components/company-badge"
import { SaveJobCtaButton } from "@/components/save-job-cta-button"
import { TrustSignalsCard } from "@/components/trust-signals-card"
import { SalaryInsightsCard } from "@/components/salary-insights-card"
import { ResponseSLABadge } from "@/components/response-sla-badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MapPin, Briefcase, DollarSign, Clock, Share2, Flag } from "lucide-react"
import { ApplyFlowDialog } from "./apply-flow-dialog"
import { ReportJobDialog } from "./report-job-dialog"
import { supabaseBrowser } from "@/lib/supabase/client"
import { jobRecordToManifest } from "@/lib/job-presenter"
import type { Job, JobRecord } from "@/lib/types"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = String((params as any)?.id ?? "")

  const [job, setJob] = React.useState<Job | null>(null)
  const [similarJobs, setSimilarJobs] = React.useState<Job[]>([])
  const [loading, setLoading] = React.useState(true)
  const [jobStatus, setJobStatus] = React.useState<"ACTIVE" | "CLOSED" | null>(null)
  const [alreadyApplied, setAlreadyApplied] = React.useState(false)

  React.useEffect(() => {
    if (!jobId) return
    const supabase = supabaseBrowser()
    ;(async () => {
      setLoading(true)
      const { data: jobRow, error: jobErr } = await supabase
        .from("jobs")
        .select(
          "id,title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency,created_at,companies:company_id(name,verified,response_rate,trust_score,logo_url)",
        )
        .eq("id", jobId)
        .maybeSingle()

      if (jobErr || !jobRow) {
        setJob(null)
        setSimilarJobs([])
        setJobStatus(null)
        setLoading(false)
        return
      }

      setJob(jobRecordToManifest(jobRow as any as JobRecord))
      setJobStatus((jobRow as any).is_active === false ? "CLOSED" : "ACTIVE")

      const { data: similar } = await supabase
        .from("jobs")
        .select(
          "id,title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency,created_at,companies:company_id(name,verified,response_rate,trust_score,logo_url)",
        )
        .eq("is_active", true)
        .neq("id", jobId)
        .order("created_at", { ascending: false })
        .limit(2)

      setSimilarJobs(((similar as any) ?? []).map((r: JobRecord) => jobRecordToManifest(r)))

      // Determine if current user already applied
      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data: appRow } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", jobId)
          .eq("user_id", auth.user.id)
          .maybeSingle()
        setAlreadyApplied(Boolean(appRow))
      } else {
        setAlreadyApplied(false)
      }
      setLoading(false)
    })()
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="py-8 flex-1">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Container>
        <Footer />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="py-8 flex-1">
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">
              Job not found.
            </CardContent>
          </Card>
        </Container>
        <Footer />
      </div>
    )
  }

  const blockedReason =
    jobStatus === "CLOSED" ? "This role is closed." : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <CompanyBadge name={job.company} logo={job.companyLogo} verified={job.verified} size="lg" />

                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Posted {job.postedAt}
                      </div>
                    </div>
                  </div>

                  {job.tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {job.avgResponseTime ? (
                    <div className="pt-2">
                      <ResponseSLABadge
                        avgResponseTime={job.avgResponseTime}
                        responseRate={job.responseRate}
                        slaMet={false}
                      />
                    </div>
                  ) : null}

                  {jobStatus && jobStatus !== "ACTIVE" ? (
                    <div className="rounded-[var(--radius)] border border-border bg-muted/40 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {jobStatus.toLowerCase()}
                        </Badge>
                        <span className="text-muted-foreground">{blockedReason ?? "This role is not accepting applications."}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    {alreadyApplied ? (
                      <Button type="button" variant="outline" disabled className="w-full md:w-auto">
                        Applied
                      </Button>
                    ) : blockedReason ? (
                      <Button type="button" variant="outline" disabled className="w-full md:w-auto">
                        {blockedReason}
                      </Button>
                    ) : (
                      <ApplyFlowDialog jobId={job.id} triggerLabel="Apply Now" triggerVariant="primary" triggerClassName="w-full md:w-auto" />
                    )}
                    <SaveJobCtaButton jobId={job.id} variant="outline" className="w-full md:w-auto" />
                    <CopyLinkButton label="Share" variant="outline" icon={Share2} />
                    <ReportJobDialog
                      jobId={job.id}
                      triggerLabel="Report"
                      triggerVariant="outline"
                      triggerClassName="w-full md:w-auto text-destructive hover:text-destructive"
                      triggerIcon={Flag}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{job.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {job.requirements.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {job.requirements.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No specific requirements listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{job.company}</p>
                    <Button asChild variant="outline">
                      <Link href={`/employers`}>View employers</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <TrustSignalsCard verified={job.verified} trustScore={job.trustScore} responseRate={job.responseRate} />
            {typeof job.salaryMin === "number" && typeof job.salaryMax === "number" ? (
              <SalaryInsightsCard
                jobTitle={job.title}
                location={job.location}
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
                currency={job.currency ?? undefined}
              />
            ) : null}

            {similarJobs.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Similar roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarJobs.map((s) => (
                    <Link key={s.id} href={`/jobs/${s.id}`} className="block rounded-[var(--radius)] border border-border bg-background p-3 hover:bg-muted">
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.company}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}


