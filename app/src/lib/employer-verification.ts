// Employer verification system
import type { Organization } from "./types-extended"

export type VerificationTier = "none" | "domain" | "business" | "payment" | "verified"

export interface VerificationStatus {
  tier: VerificationTier
  domainVerified: boolean
  businessRegistryVerified: boolean
  paymentVerified: boolean
  humanReviewCompleted: boolean
  verificationDate?: string
  nextSteps: string[]
}

export class EmployerVerification {
  static getVerificationStatus(org: Organization): VerificationStatus {
    const status: VerificationStatus = {
      tier: "none",
      domainVerified: false,
      businessRegistryVerified: false,
      paymentVerified: false,
      humanReviewCompleted: false,
      nextSteps: [],
    }

    // Check verification level from organization
    switch (org.verificationLevel) {
      case "verified":
        status.tier = "verified"
        status.domainVerified = true
        status.businessRegistryVerified = true
        status.paymentVerified = true
        status.humanReviewCompleted = true
        status.verificationDate = org.updatedAt
        break
      case "document":
        status.tier = "business"
        status.domainVerified = true
        status.businessRegistryVerified = true
        status.nextSteps = ["Complete payment verification", "Schedule human review"]
        break
      case "domain":
        status.tier = "domain"
        status.domainVerified = true
        status.nextSteps = [
          "Submit business registration documents",
          "Complete payment verification",
          "Schedule human review",
        ]
        break
      default:
        status.tier = "none"
        status.nextSteps = [
          "Verify company domain email",
          "Submit business registration",
          "Complete payment verification",
          "Schedule human review",
        ]
    }

    return status
  }

  static getVerificationBadge(tier: VerificationTier): {
    label: string
    color: string
    description: string
  } {
    switch (tier) {
      case "verified":
        return {
          label: "Verified Employer",
          color: "bg-green-600",
          description: "Fully verified with domain, business registry, payment, and human review",
        }
      case "payment":
        return {
          label: "Payment Verified",
          color: "bg-blue-600",
          description: "Payment method verified",
        }
      case "business":
        return {
          label: "Business Verified",
          color: "bg-blue-500",
          description: "Business registration verified",
        }
      case "domain":
        return {
          label: "Domain Verified",
          color: "bg-yellow-600",
          description: "Company domain email verified",
        }
      default:
        return {
          label: "Unverified",
          color: "bg-gray-500",
          description: "Verification pending",
        }
    }
  }

  static calculateTrustScore(org: Organization, verificationStatus: VerificationStatus): number {
    let score = 0

    // Verification tier (40 points)
    switch (verificationStatus.tier) {
      case "verified":
        score += 40
        break
      case "payment":
        score += 30
        break
      case "business":
        score += 20
        break
      case "domain":
        score += 10
        break
    }

    // Response rate (30 points)
    if (org.responseRate >= 90) score += 30
    else if (org.responseRate >= 75) score += 20
    else if (org.responseRate >= 50) score += 10

    // Response time (20 points)
    const avgResponseTime = this.parseResponseTime(org.avgResponseTime)
    if (avgResponseTime <= 2) score += 20 // < 48 hours
    else if (avgResponseTime <= 5) score += 15
    else if (avgResponseTime <= 7) score += 10

    // Trust score from org (10 points)
    score += Math.floor(org.trustScore / 10)

    return Math.min(100, score)
  }

  private static parseResponseTime(timeString: string): number {
    // Parse "2.3 days" or "48 hours" etc.
    const match = timeString.match(/(\d+\.?\d*)\s*(day|hour|minute)/i)
    if (!match) return 999
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (unit.startsWith("day")) return value
    if (unit.startsWith("hour")) return value / 24
    return value / (24 * 60)
  }
}



