"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Lock } from "lucide-react"
import type { CandidateProfile } from "@/lib/types-extended"

interface ProfileCompletenessProps {
  profile: CandidateProfile
  showUnlocks?: boolean
}

export function ProfileCompleteness({ profile, showUnlocks = true }: ProfileCompletenessProps) {
  const checklist = [
    { label: "Profile Photo", completed: !!profile.avatar },
    { label: "Headline", completed: !!profile.headline },
    { label: "Bio", completed: !!profile.bio },
    { label: "Location", completed: !!profile.location },
    { label: "Resume", completed: !!profile.resumeUrl },
    { label: "Skills (3+)", completed: profile.skills.length >= 3 },
    { label: "Experience", completed: profile.experience.length > 0 },
    { label: "Portfolio Items", completed: profile.portfolio.length > 0 },
    { label: "Proof Cards", completed: profile.proofCards.length > 0 },
    { label: "References", completed: profile.references.length > 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
        <CardDescription>Complete your profile to increase visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{profile.profileCompleteness}% Complete</span>
            <span className="text-sm text-muted-foreground">
              {checklist.filter((item) => item.completed).length} of {checklist.length}
            </span>
          </div>
          <Progress value={profile.profileCompleteness} />
        </div>
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Unlocks */}
        {showUnlocks && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">Profile Completeness Unlocks</p>
            <div className="grid grid-cols-2 gap-3">
              {profile.profileCompleteness >= 50 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs">Job Visibility</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">50% for Visibility</span>
                </div>
              )}
              {profile.profileCompleteness >= 70 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs">Better Matching</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">70% for Better Matching</span>
                </div>
              )}
              {profile.profileCompleteness >= 90 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs">Verified Badge</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">90% for Verified Badge</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

