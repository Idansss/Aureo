// Messaging Performance Analytics - Response rates, fairness checks, nudges
export interface MessagingAnalytics {
  employerId: string
  period: "7d" | "30d" | "90d" | "all"
  metrics: {
    totalSent: number
    totalOpened: number
    totalReplied: number
    responseRate: number
    avgResponseTime: number // hours
    dropOffPoints: DropOffPoint[]
    templatePerformance: TemplatePerformance[]
    fairnessChecks: FairnessCheck[]
  }
  nudges: Nudge[]
  lastUpdated: string
}

export interface DropOffPoint {
  stage: "sent" | "opened" | "replied"
  count: number
  percentage: number
}

export interface TemplatePerformance {
  templateId: string
  templateName: string
  sent: number
  opened: number
  replied: number
  responseRate: number
}

export interface FairnessCheck {
  category: "gender" | "location" | "experience" | "education"
  distribution: Record<string, number>
  biasDetected: boolean
  recommendation?: string
}

export interface Nudge {
  id: string
  type: "response_rate" | "response_time" | "fairness" | "template"
  severity: "info" | "warning" | "critical"
  message: string
  action?: string
  createdAt: string
}

export class MessagingAnalytics {
  static calculateAnalytics(
    employerId: string,
    messages: any[],
    period: "7d" | "30d" | "90d" | "all" = "30d"
  ): MessagingAnalytics {
    const cutoffDate = this.getCutoffDate(period)
    const periodMessages = messages.filter((m) => new Date(m.sentAt) >= cutoffDate)

    const totalSent = periodMessages.length
    const totalOpened = periodMessages.filter((m) => m.openedAt).length
    const totalReplied = periodMessages.filter((m) => m.repliedAt).length

    const responseRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0

    // Calculate average response time
    const repliedMessages = periodMessages.filter((m) => m.repliedAt && m.openedAt)
    const avgResponseTime =
      repliedMessages.length > 0
        ? repliedMessages.reduce((sum, m) => {
            const responseTime =
              (new Date(m.repliedAt!).getTime() - new Date(m.openedAt!).getTime()) / (1000 * 60 * 60)
            return sum + responseTime
          }, 0) / repliedMessages.length
        : 0

    // Drop-off points
    const dropOffPoints: DropOffPoint[] = [
      {
        stage: "sent",
        count: totalSent,
        percentage: 100,
      },
      {
        stage: "opened",
        count: totalOpened,
        percentage: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      },
      {
        stage: "replied",
        count: totalReplied,
        percentage: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
      },
    ]

    // Generate nudges
    const nudges = this.generateNudges(responseRate, avgResponseTime, totalSent)

    return {
      employerId,
      period,
      metrics: {
        totalSent,
        totalOpened,
        totalReplied,
        responseRate: Math.round(responseRate),
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        dropOffPoints,
        templatePerformance: [],
        fairnessChecks: [],
      },
      nudges,
      lastUpdated: new Date().toISOString(),
    }
  }

  private static getCutoffDate(period: "7d" | "30d" | "90d" | "all"): Date {
    const date = new Date()
    switch (period) {
      case "7d":
        date.setDate(date.getDate() - 7)
        break
      case "30d":
        date.setDate(date.getDate() - 30)
        break
      case "90d":
        date.setDate(date.getDate() - 90)
        break
      case "all":
        return new Date(0)
    }
    return date
  }

  private static generateNudges(
    responseRate: number,
    avgResponseTime: number,
    totalSent: number
  ): Nudge[] {
    const nudges: Nudge[] = []

    if (responseRate < 50 && totalSent >= 10) {
      nudges.push({
        id: `nudge_${Date.now()}_1`,
        type: "response_rate",
        severity: responseRate < 30 ? "critical" : "warning",
        message: `Your response rate is ${Math.round(responseRate)}%. This hurts your trust badge. Aim for 75%+.`,
        action: "View messaging tips",
        createdAt: new Date().toISOString(),
      })
    }

    if (avgResponseTime > 48 && totalSent >= 10) {
      nudges.push({
        id: `nudge_${Date.now()}_2`,
        type: "response_time",
        severity: avgResponseTime > 72 ? "warning" : "info",
        message: `Average response time is ${Math.round(avgResponseTime)} hours. Fast responses improve candidate experience.`,
        action: "Set up auto-responses",
        createdAt: new Date().toISOString(),
      })
    }

    return nudges
  }
}



