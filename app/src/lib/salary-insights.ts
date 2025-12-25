// Salary and fairness insights
export interface SalaryInsight {
  rangeConfidence: "high" | "medium" | "low"
  marketMatch: boolean
  locationAdjustment?: {
    factor: number
    adjustedMin: number
    adjustedMax: number
  }
  benefitsValue?: number
  insights: string[]
  warnings: string[]
}

export interface MarketData {
  role: string
  location: string
  min: number
  max: number
  median: number
  sampleSize: number
}

export class SalaryInsights {
  private static marketData: MarketData[] = [
    {
      role: "Senior Product Designer",
      location: "San Francisco, CA",
      min: 120000,
      max: 180000,
      median: 150000,
      sampleSize: 245,
    },
    {
      role: "Senior Frontend Engineer",
      location: "San Francisco, CA",
      min: 140000,
      max: 200000,
      median: 170000,
      sampleSize: 312,
    },
    {
      role: "Product Manager",
      location: "New York, NY",
      min: 130000,
      max: 190000,
      median: 160000,
      sampleSize: 189,
    },
  ]

  static analyze(
    jobTitle: string,
    location: string,
    salaryMin: number,
    salaryMax: number,
    currency: string = "USD"
  ): SalaryInsight {
    const insights: string[] = []
    const warnings: string[] = []

    // Find matching market data
    const marketMatch = this.findMarketMatch(jobTitle, location)
    let rangeConfidence: "high" | "medium" | "low" = "medium"
    let marketMatchResult = false

    if (marketMatch) {
      // Check if range matches market
      const rangeOverlap =
        (salaryMin >= marketMatch.min && salaryMin <= marketMatch.max) ||
        (salaryMax >= marketMatch.min && salaryMax <= marketMatch.max) ||
        (salaryMin <= marketMatch.min && salaryMax >= marketMatch.max)

      marketMatchResult = rangeOverlap

      if (rangeOverlap) {
        insights.push(`✓ Salary range aligns with market data (${marketMatch.sampleSize} data points)`)
        rangeConfidence = "high"
      } else {
        if (salaryMax < marketMatch.min) {
          warnings.push(
            `⚠️ Maximum salary (${this.formatCurrency(salaryMax, currency)}) is below market minimum (${this.formatCurrency(marketMatch.min, currency)})`
          )
          rangeConfidence = "low"
        } else if (salaryMin > marketMatch.max) {
          insights.push(
            `✓ Salary range is above market average - premium opportunity`
          )
          rangeConfidence = "high"
        } else {
          warnings.push(`⚠️ Salary range partially overlaps with market data`)
          rangeConfidence = "medium"
        }
      }

      // Check if range is too wide (red flag)
      const rangeWidth = salaryMax - salaryMin
      const rangePercentage = (rangeWidth / salaryMin) * 100
      if (rangePercentage > 50) {
        warnings.push(`⚠️ Salary range is very wide (${Math.round(rangePercentage)}%) - request clarification`)
      }
    } else {
      insights.push("ℹ️ Limited market data for this role/location combination")
      rangeConfidence = "medium"
    }

    // Location adjustment
    const locationAdjustment = this.calculateLocationAdjustment(location, salaryMin, salaryMax)

    // Benefits value estimation (placeholder)
    const benefitsValue = this.estimateBenefitsValue(salaryMin, salaryMax)

    return {
      rangeConfidence,
      marketMatch: marketMatchResult,
      locationAdjustment,
      benefitsValue,
      insights,
      warnings,
    }
  }

  private static findMarketMatch(jobTitle: string, location: string): MarketData | null {
    // Simple matching - in production, use more sophisticated matching
    const normalizedTitle = jobTitle.toLowerCase()
    const normalizedLocation = location.toLowerCase()

    return (
      this.marketData.find(
        (data) =>
          normalizedTitle.includes(data.role.toLowerCase().split(" ")[0]) &&
          normalizedLocation.includes(data.location.toLowerCase().split(",")[0])
      ) || null
    )
  }

  private static calculateLocationAdjustment(
    location: string,
    salaryMin: number,
    salaryMax: number
  ): { factor: number; adjustedMin: number; adjustedMax: number } | undefined {
    // Location cost of living adjustments (simplified)
    const locationFactors: Record<string, number> = {
      "san francisco": 1.4,
      "new york": 1.35,
      "seattle": 1.2,
      "boston": 1.15,
      "austin": 0.95,
      "remote": 1.0,
    }

    const normalizedLocation = location.toLowerCase()
    const factor =
      Object.entries(locationFactors).find(([key]) => normalizedLocation.includes(key))?.[1] || 1.0

    if (factor === 1.0) return undefined

    return {
      factor,
      adjustedMin: Math.round(salaryMin * factor),
      adjustedMax: Math.round(salaryMax * factor),
    }
  }

  private static estimateBenefitsValue(salaryMin: number, salaryMax: number): number {
    // Estimate benefits value as 20-30% of salary
    const avgSalary = (salaryMin + salaryMax) / 2
    return Math.round(avgSalary * 0.25)
  }

  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  static getFairnessScore(insight: SalaryInsight): number {
    let score = 50 // Base score

    if (insight.rangeConfidence === "high") score += 20
    if (insight.rangeConfidence === "low") score -= 20

    if (insight.marketMatch) score += 20
    if (insight.warnings.length > 0) score -= 10 * insight.warnings.length

    return Math.max(0, Math.min(100, score))
  }
}



