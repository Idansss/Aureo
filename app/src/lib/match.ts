// Job matching logic for saved searches
import type { Job } from "./types"
import type { SavedSearch } from "./types-extended"
import { extractSkills } from "./skills"

export interface MatchedJob {
  job: Job
  matchScore: number
  matchedSkills: string[]
  matchReasons: string[]
}

export function matchJobsToSearch(jobs: Job[], search: SavedSearch): MatchedJob[] {
  const results: MatchedJob[] = []

  for (const job of jobs) {
    const match = calculateMatch(job, search)
    if (match.matchScore > 0) {
      results.push(match)
    }
  }

  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

function calculateMatch(job: Job, search: SavedSearch): MatchedJob {
  let score = 0
  const reasons: string[] = []
  const matchedSkills: string[] = []

  // Keyword matching in title and description
  const query = search.query.toLowerCase()
  const titleMatch = job.title.toLowerCase().includes(query)
  const descMatch = job.description.toLowerCase().includes(query)

  if (titleMatch) {
    score += 30
    reasons.push("Title matches query")
  }
  if (descMatch) {
    score += 20
    reasons.push("Description matches query")
  }

  // Tag matching
  if (search.query && job.tags) {
    const queryWords = query.split(/\s+/)
    const matchedTags = job.tags.filter((tag) =>
      queryWords.some((word) => tag.toLowerCase().includes(word))
    )
    if (matchedTags.length > 0) {
      score += matchedTags.length * 10
      reasons.push(`Matched ${matchedTags.length} tag(s)`)
    }
  }

  // Location matching
  if (search.filters.location) {
    const searchLocation = search.filters.location.toLowerCase()
    const jobLocation = (job.location || "").toLowerCase()
    if (jobLocation.includes(searchLocation) || searchLocation.includes(jobLocation)) {
      score += 15
      reasons.push("Location matches")
    }
  }

  // Remote matching
  if (search.filters.remote !== undefined) {
    const jobIsRemote = (job.location || "").toLowerCase().includes("remote")
    if (jobIsRemote === search.filters.remote) {
      score += 10
      reasons.push("Remote preference matches")
    }
  }

  // Type matching
  if (search.filters.type && job.type) {
    const searchType = search.filters.type.toLowerCase()
    const jobType = job.type.toLowerCase()
    if (jobType.includes(searchType) || searchType.includes(jobType)) {
      score += 10
      reasons.push("Employment type matches")
    }
  }

  // Salary range matching
  if (search.filters.salaryMin || search.filters.salaryMax) {
    // Extract salary from job.salary string (e.g., "$80k - $120k")
    const salaryMatch = job.salary.match(/\$?(\d+)[kK]?/g)
    if (salaryMatch) {
      const salaries = salaryMatch.map((s) => {
        const num = parseInt(s.replace(/[^0-9]/g, ""))
        return s.toLowerCase().includes("k") ? num * 1000 : num
      })
      const minSalary = Math.min(...salaries)
      const maxSalary = Math.max(...salaries)

      if (search.filters.salaryMin && minSalary >= search.filters.salaryMin) {
        score += 10
        reasons.push("Salary minimum met")
      }
      if (search.filters.salaryMax && maxSalary <= search.filters.salaryMax) {
        score += 10
        reasons.push("Salary maximum met")
      }
    }
  }

  // Skill extraction and matching
  const jobText = `${job.title} ${job.description} ${job.tags?.join(" ") || ""}`
  const extractedSkills = extractSkills(jobText)
  matchedSkills.push(...extractedSkills)

  if (search.filters.tags && search.filters.tags.length > 0) {
    const matchedFilterTags = search.filters.tags.filter((tag) =>
      extractedSkills.some((skill) => skill.toLowerCase().includes(tag.toLowerCase()))
    )
    if (matchedFilterTags.length > 0) {
      score += matchedFilterTags.length * 5
      reasons.push(`Matched ${matchedFilterTags.length} skill(s)`)
    }
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(100, Math.round(score))

  return {
    job,
    matchScore: normalizedScore,
    matchedSkills,
    matchReasons: reasons,
  }
}



