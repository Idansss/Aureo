"use client"

import { useEffect, useMemo, useState } from "react"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, MapPin, TrendingUp } from "lucide-react"
import { ExplainableTrustScore } from "@/components/explainable-trust-score"
import { IconBadge } from "@/components/ui/icon-badge"
import Link from "next/link"
import { supabaseBrowser } from "@/lib/supabase/client"

type TrustedCompany = {
  id: string
  name: string
  slug: string
  location?: string | null
  description?: string | null
  verified: boolean
  trustScore: number
  responseRate: number
}

export default function TrustedEmployersPage() {
  const [filterLocation, setFilterLocation] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [companies, setCompanies] = useState<TrustedCompany[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,slug,location,description,verified,trust_score,response_rate")
        .gte("trust_score", 70)
        .order("trust_score", { ascending: false })

      if (!cancelled) {
        if (error) {
          console.error("Failed to load trusted employers:", error)
          setCompanies([])
        } else {
          setCompanies(
            (data ?? []).map((c: any) => ({
              id: String(c.id),
              name: String(c.name ?? ""),
              slug: String(c.slug ?? ""),
              location: c.location ?? null,
              description: c.description ?? null,
              verified: Boolean(c.verified ?? false),
              trustScore: Number(c.trust_score ?? 0),
              responseRate: Number(c.response_rate ?? 0),
            })),
          )
        }
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const trustedOrgs = useMemo(() => {
    return companies
      .filter((org) => {
        if (filterLocation !== "all" && !(org.location ?? "").toLowerCase().includes(filterLocation.toLowerCase())) {
          return false
        }
        if (searchQuery && !org.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        return true
      })
      .sort((a, b) => b.trustScore - a.trustScore)
  }, [companies, filterLocation, searchQuery])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Trusted Employers"
          description="Companies you can trust - verified employers with high trust scores"
          className="mb-8"
        />

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="san francisco">San Francisco</SelectItem>
              <SelectItem value="new york">New York</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trusted Employers List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <IconBadge icon={ShieldCheck} size="lg" tone="neutral" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading trusted employers…</p>
            </CardContent>
          </Card>
        ) : trustedOrgs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <IconBadge icon={ShieldCheck} size="lg" tone="neutral" className="mx-auto mb-4" />
              <p className="text-muted-foreground">No trusted employers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustedOrgs.map((org) => {
              return (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        {org.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" aria-hidden />
                            {org.location}
                          </div>
                        )}
                      </div>
                      {org.verified ? (
                        <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white text-xs">Unverified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" aria-hidden />
                        {org.trustScore}% Trust
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" aria-hidden />
                        {org.responseRate}% Response
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                    )}

                    <ExplainableTrustScore
                      type="employer"
                      overallScore={org.trustScore}
                      factors={[
                        {
                          name: "Verification",
                          score: org.verified ? 40 : 0,
                          maxScore: 40,
                          status: org.verified ? "verified" : "missing",
                          description: org.verified ? "Verified organization." : "Not yet verified.",
                        },
                        {
                          name: "Response rate",
                          score: Math.max(0, Math.min(30, Math.round((org.responseRate / 100) * 30))),
                          maxScore: 30,
                          status: org.responseRate >= 75 ? "verified" : org.responseRate >= 50 ? "pending" : "missing",
                          description: "Higher response rates indicate reliable follow-through.",
                        },
                        {
                          name: "Trust signals",
                          score: Math.max(0, Math.min(30, Math.round((org.trustScore / 100) * 30))),
                          maxScore: 30,
                          status: org.trustScore >= 80 ? "verified" : "pending",
                          description: "Platform trust signals aggregated into a score.",
                        },
                      ]}
                    />

                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/employers/${org.slug}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>

      <Footer />
    </div>
  )
}
