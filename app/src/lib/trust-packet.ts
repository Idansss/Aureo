// Trust Packet generation and management
import type { CandidateProfile, ProofCard, Reference, ExperienceItem } from "./types-extended"

export interface TrustPacket {
  id: string
  candidateId: string
  shareableLink: string
  generatedAt: string
  trustScore: number
  verificationLevel: "basic" | "verified" | "premium"
  sections: {
    profile: {
      name: string
      headline?: string
      location?: string
      avatar?: string
    }
    proof: {
      portfolio: ProofCard[]
      github?: string
      linkedin?: string
      certificates: ProofCard[]
    }
    experience: ExperienceItem[]
    references: Reference[]
    skills: string[]
    trustSignals: {
      verifiedLinks: number
      portfolioItems: number
      references: number
      experienceYears: number
    }
  }
}

export class TrustPacketGenerator {
  static generate(candidate: CandidateProfile): TrustPacket {
    const packetId = `packet_${Date.now()}`
    const shareableLink = `/trust/${packetId}`

    // Calculate trust score based on completeness
    const trustScore = this.calculateTrustScore(candidate)

    // Determine verification level
    const verificationLevel = this.getVerificationLevel(candidate, trustScore)

    return {
      id: packetId,
      candidateId: candidate.id,
      shareableLink,
      generatedAt: new Date().toISOString(),
      trustScore,
      verificationLevel,
      sections: {
        profile: {
          name: candidate.name,
          headline: candidate.headline,
          location: candidate.location,
          avatar: candidate.avatar,
        },
        proof: {
          portfolio: candidate.portfolio.map((p) => ({
            id: p.id,
            type: "portfolio" as const,
            title: p.title,
            description: p.description,
            url: p.url,
            imageUrl: p.imageUrl,
            verified: false,
            createdAt: new Date().toISOString(),
          })),
          github: candidate.proofCards.find((p) => p.type === "github")?.url,
          linkedin: candidate.proofCards.find((p) => p.type === "other" && p.url?.includes("linkedin"))?.url,
          certificates: candidate.proofCards.filter((p) => p.type === "certificate"),
        },
        experience: candidate.experience,
        references: candidate.references.filter((r) => r.verified),
        skills: candidate.skills,
        trustSignals: {
          verifiedLinks: candidate.proofCards.filter((p) => p.verified).length,
          portfolioItems: candidate.portfolio.length,
          references: candidate.references.filter((r) => r.verified).length,
          experienceYears: this.calculateExperienceYears(candidate.experience),
        },
      },
    }
  }

  private static calculateTrustScore(candidate: CandidateProfile): number {
    let score = 0
    const maxScore = 100

    // Profile completeness (20 points)
    if (candidate.name) score += 5
    if (candidate.headline) score += 5
    if (candidate.bio) score += 5
    if (candidate.location) score += 5

    // Proof (30 points)
    if (candidate.portfolio.length > 0) score += 10
    if (candidate.proofCards.length > 0) score += 10
    if (candidate.proofCards.some((p) => p.verified)) score += 10

    // Experience (20 points)
    if (candidate.experience.length > 0) score += 10
    if (this.calculateExperienceYears(candidate.experience) >= 2) score += 10

    // References (15 points)
    if (candidate.references.length > 0) score += 5
    if (candidate.references.some((r) => r.verified)) score += 10

    // Skills (10 points)
    if (candidate.skills.length >= 5) score += 10

    // Resume (5 points)
    if (candidate.resumeUrl) score += 5

    return Math.min(score, maxScore)
  }

  private static getVerificationLevel(
    candidate: CandidateProfile,
    trustScore: number
  ): "basic" | "verified" | "premium" {
    if (trustScore >= 80 && candidate.verified && candidate.references.some((r) => r.verified)) {
      return "premium"
    }
    if (trustScore >= 60 && candidate.proofCards.some((p) => p.verified)) {
      return "verified"
    }
    return "basic"
  }

  private static calculateExperienceYears(experience: ExperienceItem[]): number {
    if (experience.length === 0) return 0

    let totalMonths = 0
    const now = new Date()

    experience.forEach((exp) => {
      const start = new Date(exp.startDate)
      const end = exp.endDate ? new Date(exp.endDate) : now
      const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
      totalMonths += Math.max(0, months)
    })

    return Math.floor(totalMonths / 12)
  }

  static getShareableUrl(packetId: string): string {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/trust/${packetId}`
  }
}

