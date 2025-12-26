"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CompanyBadge } from "@/components/company-badge"
import { TrustBadge } from "@/components/trust-badge"
import { SaveJobCtaButton } from "@/components/save-job-cta-button"
import { MapPin, Clock, Briefcase, TrendingUp, Users, Bookmark } from "lucide-react"
import type { Job } from "@/lib/types"
import Link from "next/link"

interface JobCardProps {
  job: Job
  jobStatus?: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "FILLED"
}

export function JobCard({ job, jobStatus }: JobCardProps) {
  const disabledApply = jobStatus === "FILLED" || jobStatus === "CLOSED" || jobStatus === "PAUSED"
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <TrustBadge verified={job.verified} size="sm" />
              <Badge variant="subtle" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {job.trustScore}% Trust
              </Badge>
              {jobStatus && jobStatus !== "ACTIVE" ? (
                <Badge variant="outline" className="text-xs">
                  {jobStatus.toLowerCase()}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-xl">
              <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            <CompanyBadge name={job.company} logo={job.companyLogo} verified={job.verified} size="sm" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2">{job.description}</CardDescription>

        <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="subtle" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{job.postedAt}</span>
          </div>
          {job.applicants && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{job.applicants} applicants</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Salary Range</p>
            <p className="font-semibold">{job.salary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SaveJobCtaButton
              jobId={job.id}
              variant="outline"
              savedLabel="Saved"
              unsavedLabel="Save"
              preventNavigation
              className="text-xs px-3 py-1.5 h-auto shrink-0"
            />
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
            <Button size="sm" variant="primary" asChild className="shrink-0" disabled={disabledApply}>
              <Link
                href={`/jobs/${job.id}?apply=1`}
                aria-disabled={disabledApply}
                onClick={(e) => {
                  if (!disabledApply) return
                  e.preventDefault()
                }}
              >
                {jobStatus === "FILLED" ? "Filled" : jobStatus === "CLOSED" ? "Closed" : jobStatus === "PAUSED" ? "Paused" : "Apply Now"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
