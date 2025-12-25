import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShieldCheck, Timer, TriangleAlert } from "lucide-react"
import { fetchCompanyBySlug, fetchJobsForCompany } from "@/lib/companies"
import { CompanyReviews } from "@/components/employers/company-reviews"

type EmployerProfilePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EmployerProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const employer = await fetchCompanyBySlug(slug)

  if (!employer) {
    return {
      title: "Employer not found · Aureo",
    }
  }

  return {
    title: `${employer.name} · Employers · Aureo`,
    description: `Trust signals and open roles for ${employer.name}.`,
  }
}

export default async function EmployerProfilePage({ params }: EmployerProfilePageProps) {
  const { slug } = await params
  const employer = await fetchCompanyBySlug(slug)
  if (!employer) notFound()

  const openRoles = await fetchJobsForCompany(employer.id as string)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-10 flex-1">
        <PageHeader
          title={employer.name}
          description={`${employer.location ?? "Remote"}`}
          className="mb-8"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={employer.website ?? "#"} target="_blank" rel="noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Website
                </a>
              </Button>
            </div>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={employer.verified ? "default" : "outline"} className="gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {employer.verified ? "Verified employer" : "Unverified employer"}
                  </Badge>
                  <Badge variant="outline">Trust Score: {employer.trust_score ?? 0}%</Badge>
                  <Badge variant="outline">Response Rate: {employer.response_rate ?? 0}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{employer.description ?? "No company description yet."}</p>
              </CardContent>
            </Card>

            <CompanyReviews companyId={employer.id as string} />

            <Card>
              <CardHeader>
                <CardTitle>Open Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {openRoles.length === 0 ? (
                  <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
                    No roles listed yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openRoles.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{job.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{job.location}</p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/jobs/${job.id}`}>View role</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trust Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trust score</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {employer.trust_score ?? 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response rate</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {employer.response_rate ?? 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground inline-flex items-center gap-2">
                    <Timer className="h-4 w-4" aria-hidden />
                    Reports (30d)
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {employer.flagged_count ?? 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {!employer.verified ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-6 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <TriangleAlert className="h-5 w-5 text-primary mt-0.5" aria-hidden />
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Verification pending</p>
                      <p className="text-muted-foreground">
                        Treat this profile carefully and verify company details before sharing sensitive information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

