"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponseSLABadgeProps {
  avgResponseTime?: string
  responseRate?: number
  slaMet: boolean
  className?: string
}

export function ResponseSLABadge({ avgResponseTime, responseRate, slaMet, className }: ResponseSLABadgeProps) {
  if (!avgResponseTime && !responseRate) return null

  const parseResponseTime = (time: string): number => {
    // Parse "2.3 days" or "48 hours" etc.
    const match = time.match(/(\d+\.?\d*)\s*(day|hour|minute)/i)
    if (!match) return 0
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (unit.startsWith("day")) return value
    if (unit.startsWith("hour")) return value / 24
    return value / (24 * 60)
  }

  const responseTimeDays = avgResponseTime ? parseResponseTime(avgResponseTime) : 0
  const slaThreshold = 2 // 48 hours = 2 days

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {slaMet && responseTimeDays <= slaThreshold ? (
        <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Responds in &lt;48h
        </Badge>
      ) : responseTimeDays > slaThreshold ? (
        <Badge variant="outline" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Avg: {avgResponseTime || `${responseTimeDays.toFixed(1)} days`}
        </Badge>
      ) : null}

      {responseRate !== undefined && (
        <Badge variant="outline" className="gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {responseRate}% response rate
        </Badge>
      )}
    </div>
  )
}

