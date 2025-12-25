// Transparent Relevance Score - Show why candidates are ranked
import type { EnhancedJob, CandidateProfile } from "./types-extended"

export interface RelevanceFactor {
  name: string
  score: number
  maxScore: number
  weight: number
  explanation: string
  improvement?: string
}

export interface RelevanceScore {
  overall: number
  factors: RelevanceFactor[]
  rank: number
  explanation: string
}

export class RelevanceScoring {
  static calculateRelevance(
    candidate: CandidateProfile,
    job: EnhancedJob,
    allCandidates: CandidateProfile[]
  ): RelevanceScore {
    const factors: RelevanceFactor[] = []

    // 1. Skills Match (30% weight)
    const skillsMatch = this.calculateSkillsMatch(candidate.skills, job.tags)
    factors.push({
      name: "Skills Match",
      score: skillsMatch.score,
      maxScore: 100,
      weight: 0.3,
      explanation: `Matches ${skillsMatch.matched} of ${skillsMatch.total} required skills: ${skillsMatch.matchedSkills.join(", ")}`,
      improvement: skillsMatch.score < 80 ? `Add skills: ${skillsMatch.missingSkills.join(", ")}` : undefined,
    })

    // 2. Location Fit (15% weight)
    const locationFit = this.calculateLocationFit(candidate.location, job.locations)
    factors.push({
      name: "Location Fit",
      score: locationFit.score,
      maxScore: 100,
      weight: 0.15,
      explanation: locationFit.explanation,
      improvement: locationFit.score < 100 ? "Consider remote or relocate" : undefined,
    })

    // 3. Salary Fit (15% weight)
    const salaryFit = this.calculateSalaryFit(candidate, job)
    factors.push({
      name: "Salary Fit",
      score: salaryFit.score,
      maxScore: 100,
      weight: 0.15,
      explanation: salaryFit.explanation,
      improvement: salaryFit.score < 100 ? "Adjust salary expectations" : undefined,
    })

    // 4. Proof Completed (20% weight)
    const proofScore = this.calculateProofScore(candidate, job)
    factors.push({
      name: "Proof Completed",
      score: proofScore.score,
      maxScore: 100,
      weight: 0.2,
      explanation: proofScore.explanation,
      improvement: proofScore.score < 100 ? "Complete proof tasks for this role type" : undefined,
    })

    // 5. Response Rate (10% weight)
    const responseScore = this.calculateResponseScore(candidate)
    factors.push({
      name: "Response Rate",
      score: responseScore.score,
      maxScore: 100,
      weight: 0.1,
      explanation: responseScore.explanation,
    })

    // 6. Experience Level (10% weight)
    const experienceScore = this.calculateExperienceScore(candidate, job)
    factors.push({
      name: "Experience Level",
      score: experienceScore.score,
      maxScore: 100,
      weight: 0.1,
      explanation: experienceScore.explanation,
    })

    // Calculate overall score
    const overall = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0)

    // Calculate rank among all candidates
    const allScores = allCandidates.map((c) => this.calculateRelevance(c, job, []).overall)
    const rank = allScores.filter((s) => s > overall).length + 1

    // Generate explanation
    const topFactors = factors
      .sort((a, b) => b.score * b.weight - a.score * a.weight)
      .slice(0, 3)
      .map((f) => f.name)
    const explanation = `Ranked #${rank} based on ${topFactors.join(", ")}. ${factors
      .filter((f) => f.improvement)
      .map((f) => f.improvement)
      .join(" ")}`

    return {
      overall: Math.round(overall),
      factors,
      rank,
      explanation,
    }
  }

  private static calculateSkillsMatch(candidateSkills: string[], jobTags: string[]): {
    score: number
    matched: number
    total: number
    matchedSkills: string[]
    missingSkills: string[]
  } {
    const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase())
    const normalizedJob = jobTags.map((t) => t.toLowerCase())

    const matched = normalizedJob.filter((tag) =>
      normalizedCandidate.some((skill) => skill.includes(tag) || tag.includes(skill))
    )
    const missing = normalizedJob.filter((tag) => !matched.includes(tag))

    const score = jobTags.length > 0 ? (matched.length / jobTags.length) * 100 : 0

    return {
      score: Math.round(score),
      matched: matched.length,
      total: jobTags.length,
      matchedSkills: matched,
      missingSkills: missing,
    }
  }

  private static calculateLocationFit(
    candidateLocation: string | undefined,
    jobLocations: string[]
  ): { score: number; explanation: string } {
    if (!candidateLocation) {
      return { score: 50, explanation: "Location not specified" }
    }

    const normalizedCandidate = candidateLocation.toLowerCase()
    const normalizedJob = jobLocations.map((l) => l.toLowerCase())

    // Check for exact match or remote
    if (normalizedJob.some((loc) => loc.includes("remote") || loc.includes("anywhere"))) {
      return { score: 100, explanation: "Remote position matches any location" }
    }

    if (normalizedJob.some((loc) => normalizedCandidate.includes(loc) || loc.includes(normalizedCandidate))) {
      return { score: 100, explanation: `Location matches: ${candidateLocation}` }
    }

    return { score: 30, explanation: "Location mismatch - consider remote or relocate" }
  }

  private static calculateSalaryFit(
    candidate: CandidateProfile,
    job: EnhancedJob
  ): { score: number; explanation: string } {
    // In production, would check candidate's salary expectations
    // For now, assume good fit if job has salary range
    if (job.salaryMin && job.salaryMax) {
      return {
        score: 80,
        explanation: `Salary range: ${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`,
      }
    }
    return { score: 50, explanation: "Salary range not specified" }
  }

  private static calculateProofScore(
    candidate: CandidateProfile,
    job: EnhancedJob
  ): { score: number; explanation: string } {
    // Check if candidate has proof tasks completed for this job type
    const hasPortfolio = candidate.portfolio.length > 0
    const hasProofCards = candidate.proofCards.length > 0
    const hasReferences = candidate.references.length > 0

    let score = 0
    const explanations: string[] = []

    if (hasPortfolio) {
      score += 40
      explanations.push(`${candidate.portfolio.length} portfolio items`)
    }
    if (hasProofCards) {
      score += 30
      explanations.push(`${candidate.proofCards.length} proof cards`)
    }
    if (hasReferences) {
      score += 30
      explanations.push(`${candidate.references.length} references`)
    }

    return {
      score: Math.min(100, score),
      explanation: explanations.length > 0 ? explanations.join(", ") : "No proof completed",
    }
  }

  private static calculateResponseScore(candidate: CandidateProfile): {
    score: number
    explanation: string
  } {
    // In production, would track candidate response rates to messages
    // For now, assume good response rate if profile is complete
    const completeness = candidate.profileCompleteness || 0
    return {
      score: completeness,
      explanation: `Profile ${completeness}% complete - indicates engagement`,
    }
  }

  private static calculateExperienceScore(
    candidate: CandidateProfile,
    job: EnhancedJob
  ): { score: number; explanation: string } {
    const experienceYears = this.calculateExperienceYears(candidate.experience)
    const jobTitle = job.title.toLowerCase()

    let score = 50
    let explanation = `${experienceYears} years experience`

    if (jobTitle.includes("senior") && experienceYears >= 5) {
      score = 100
      explanation = `${experienceYears} years - matches senior role`
    } else if (jobTitle.includes("senior") && experienceYears < 5) {
      score = 60
      explanation = `${experienceYears} years - below senior level`
    } else if (!jobTitle.includes("senior") && experienceYears >= 2) {
      score = 90
      explanation = `${experienceYears} years - matches role level`
    }

    return { score, explanation }
  }

  private static calculateExperienceYears(experience: any[]): number {
    if (experience.length === 0) return 0
    // Simplified calculation
    return Math.floor(experience.length * 2)
  }
}



