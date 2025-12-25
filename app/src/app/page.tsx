"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconBadge } from "@/components/ui/icon-badge"
import { Container } from "@/components/container"
import { SectionHeader } from "@/components/section-header"
import { JobCard } from "@/components/job-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, ShieldCheck, Zap, Target, Clock, Users, Star } from "lucide-react"
import { useAuth } from "@/lib/use-auth"
import { supabaseBrowser } from "@/lib/supabase/client"
import { jobRecordToManifest } from "@/lib/job-presenter"
import type { JobRecord, Job } from "@/lib/types"
import { formatSupabaseError, isSchemaMissingError } from "@/lib/supabase/error"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [metrics, setMetrics] = useState<{
    verifiedEmployers: number
    activeRoles: number
    satisfactionRatePercent: number
    avgResponseTimeHours: number | null
  } | null>(null)
  const [testimonials, setTestimonials] = useState<
    Array<{
      id: string
      rating: number
      body: string
      createdAt: string
      companyName: string
      authorName: string
      authorHeadline: string
      initials: string
    }>
  >([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = supabaseBrowser()

    const toInitials = (name: string) => {
      const parts = name.trim().split(/\s+/).filter(Boolean)
      const letters = (parts.length >= 2 ? [parts[0][0], parts[1][0]] : [parts[0]?.[0] ?? "A"]).join("")
      return letters.toUpperCase().slice(0, 2)
    }

    const loadMetrics = async () => {
      const { data, error } = await supabase.from("platform_metrics_public").select("*").maybeSingle()
      if (error) {
        const meta = formatSupabaseError(error)
        console.error("Failed to load platform metrics:", meta, error)
        // Missing tables/view usually means migrations haven't been applied yet.
        if (isSchemaMissingError(error)) {
          setMetrics(null)
        }
        return
      }
      if (!data) return
      setMetrics({
        verifiedEmployers: Number((data as any).verified_employers ?? 0),
        activeRoles: Number((data as any).active_roles ?? 0),
        satisfactionRatePercent: Number((data as any).satisfaction_rate_percent ?? 0),
        avgResponseTimeHours: ((data as any).avg_response_time_hours ?? null) as any,
      })
    }

    const loadTestimonials = async () => {
      const { data, error } = await supabase
        .from("company_reviews")
        .select("id,rating,body,created_at,companies:company_id(name),profiles:user_id(full_name,username,headline,role)")
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) {
        const meta = formatSupabaseError(error)
        console.error("Failed to load testimonials:", meta, error)
        return
      }

      setTestimonials(
        (data ?? []).map((r: any) => {
          const authorName =
            String(r.profiles?.full_name || r.profiles?.username || "Anonymous")
          const headline =
            String(
              r.profiles?.headline ||
                (r.profiles?.role === "employer"
                  ? "Hiring Manager"
                  : r.profiles?.role === "admin"
                    ? "Aureo Team"
                    : "Job Seeker"),
            )
          const companyName = String(r.companies?.name || "Employer")
          return {
            id: String(r.id),
            rating: Number(r.rating ?? 5),
            body: String(r.body ?? ""),
            createdAt: String(r.created_at),
            companyName,
            authorName,
            authorHeadline: headline,
            initials: toInitials(authorName),
          }
        }),
      )
    }

    const loadAll = async () => {
      await Promise.all([loadMetrics(), loadTestimonials()])
    }

    loadAll()

    // Keep numbers fresh while the tab is open (updates automatically as usage grows).
    const interval = window.setInterval(loadAll, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const supabase = supabaseBrowser()
    ;(async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id,title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency,created_at,companies:company_id(name,verified,response_rate,trust_score,logo_url)",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3)
      if (error) return
      setFeaturedJobs(((data as any) ?? []).map((r: JobRecord) => jobRecordToManifest(r)))
    })()
  }, [])

  const dashboardHref = useMemo(() => {
    if (!isAuthenticated || !user) return "/auth/register"
    return user.role === "employer" ? "/dashboard/employer" : "/app"
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <Container className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Trust First Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                Hiring that balances trust, proof, and calm speed
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-xl">
                Find verified opportunities with transparent employers. Build trust through proof. Get hired faster with
                clear, honest communication.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search jobs, companies, or skills..." className="pl-10" />
                </div>
                <Button variant="primary" size="lg" asChild>
                  <Link href="/jobs">Find Jobs</Link>
                </Button>
              </div>
            </div>

            {/* Candidate Snapshot Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                    SK
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Sarah Kim</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Senior Product Designer</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-2xl font-semibold text-primary">94%</p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">5</p>
                    <p className="text-xs text-muted-foreground">Active Applications</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {["Figma", "UI/UX", "Design Systems", "Prototyping"].map((skill) => (
                      <Badge key={skill} variant="subtle" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="primary" className="w-full" asChild>
                  <Link href={dashboardHref}>View Full Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <SectionHeader title="How It Works" description="Three simple steps to better hiring" className="mb-12" />

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <IconBadge icon={ShieldCheck} tone="gold" size="lg" />
                <h3 className="text-xl font-semibold">Build Trust</h3>
                <p className="text-muted-foreground">
                  Verified employers, transparent processes, and real trust scores help you make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <IconBadge icon={Target} tone="gold" size="lg" />
                <h3 className="text-xl font-semibold">Show Proof</h3>
                <p className="text-muted-foreground">
                  Portfolio, work samples, and verified credentials showcase your skills with tangible evidence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <IconBadge icon={Zap} tone="gold" size="lg" />
                <h3 className="text-xl font-semibold">Move Fast</h3>
                <p className="text-muted-foreground">
                  Clear timelines, fast responses, and streamlined processes mean you spend less time waiting.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <Container>
          <SectionHeader
            title="Featured Jobs"
            description="Hand-picked opportunities from verified employers"
            className="mb-8"
            actions={
              <Button variant="outline" asChild>
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            }
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </Container>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <SectionHeader
            title="Platform Metrics"
            description="Real numbers from our trust-first platform"
            className="mb-12"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <IconBadge icon={ShieldCheck} tone="gold" size="lg" />
                </div>
                <p className="text-3xl font-bold">
                  {metrics ? metrics.verifiedEmployers.toLocaleString() : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Verified Employers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <IconBadge icon={Clock} tone="gold" size="lg" />
                </div>
                <p className="text-3xl font-bold">
                  {metrics?.avgResponseTimeHours != null
                    ? `${(metrics.avgResponseTimeHours / 24).toFixed(1)} days`
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <IconBadge icon={Users} tone="gold" size="lg" />
                </div>
                <p className="text-3xl font-bold">
                  {metrics ? metrics.activeRoles.toLocaleString() : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Active Roles</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <IconBadge icon={Star} tone="gold" size="lg" />
                </div>
                <p className="text-3xl font-bold">
                  {metrics ? `${metrics.satisfactionRatePercent}%` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <Container>
          <SectionHeader
            title="What People Say"
            description="Hear from job seekers and employers who trust Aureo"
            className="mb-12"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.length ? (
              testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < t.rating
                              ? "h-4 w-4 fill-primary text-primary"
                              : "h-4 w-4 text-muted-foreground"
                          }
                          aria-hidden
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      “{t.body.length > 160 ? `${t.body.slice(0, 157)}...` : t.body}”
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                        {t.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{t.authorName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {t.authorHeadline} • {t.companyName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-3">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No reviews yet. Browse employers and be the first to leave feedback.
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
              Ready to experience trust-first hiring?
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Join thousands of job seekers and employers who are building better careers together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {mounted && !isAuthenticated ? (
                <Button size="lg" variant="primary" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              ) : null}
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  )
}
