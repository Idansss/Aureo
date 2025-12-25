// Smart alerts based on proof signals, not just keywords
import type { CandidateProfile, EnhancedJob } from "./types-extended"

export interface SmartAlert {
  id: string
  type: "job_match" | "skill_match" | "location_match" | "salary_match"
  jobId: string
  job: EnhancedJob
  matchReasons: string[]
  confidence: "high" | "medium" | "low"
  createdAt: string
}

export class SmartAlerts {
  static generateAlerts(profile: CandidateProfile, jobs: EnhancedJob[]): SmartAlert[] {
    const alerts: SmartAlert[] = []

    jobs.forEach((job) => {
      const matchReasons: string[] = []
      let confidence: "high" | "medium" | "low" = "low"

      // Skill matching
      const skillMatches = job.tags.filter((tag) =>
        profile.skills.some((skill) => skill.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill.toLowerCase()))
      )
      if (skillMatches.length >= 2) {
        matchReasons.push(`Matches ${skillMatches.length} of your skills: ${skillMatches.slice(0, 3).join(", ")}`)
        confidence = skillMatches.length >= 3 ? "high" : "medium"
      }

      // Portfolio/Proof matching
      const hasRelevantPortfolio = profile.portfolio.some((item) =>
        job.tags.some((tag) => item.tags.some((itemTag: string) => itemTag.toLowerCase().includes(tag.toLowerCase())))
      )
      if (hasRelevantPortfolio) {
        matchReasons.push("Your portfolio includes relevant work")
        confidence = confidence === "low" ? "medium" : "high"
      }

      // Experience level matching
      const experienceYears = this.calculateExperienceYears(profile.experience)
      if (job.title.toLowerCase().includes("senior") && experienceYears >= 5) {
        matchReasons.push("Matches your senior-level experience")
        confidence = confidence === "low" ? "medium" : "high"
      } else if (!job.title.toLowerCase().includes("senior") && experienceYears < 5) {
        matchReasons.push("Matches your experience level")
        confidence = confidence === "low" ? "medium" : confidence
      }

      // Location matching
      if (profile.location && job.locations.some((loc) => loc.toLowerCase().includes(profile.location!.toLowerCase()))) {
        matchReasons.push("Matches your preferred location")
        confidence = confidence === "low" ? "medium" : confidence
      }

      // Trust score preference (would require organization lookup in production)
      // if (job.trustScore >= 80) {
      //   matchReasons.push("High-trust employer (80%+ trust score)")
      // }

      if (matchReasons.length >= 2) {
        alerts.push({
          id: `alert_${Date.now()}_${job.id}`,
          type: skillMatches.length > 0 ? "skill_match" : "job_match",
          jobId: job.id,
          job,
          matchReasons,
          confidence,
          createdAt: new Date().toISOString(),
        })
      }
    })

    return alerts.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 }
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    })
  }

  private static calculateExperienceYears(experience: any[]): number {
    if (experience.length === 0) return 0
    // Simplified calculation
    return Math.floor(experience.length * 2) // Rough estimate
  }
}

