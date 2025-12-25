"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"
import { UiIcon } from "@/components/ui/icon-client"
import { cn } from "@/lib/utils"

interface TrustFactor {
  name: string
  score: number
  maxScore: number
  status: "verified" | "pending" | "missing"
  description: string
}

interface ExplainableTrustScoreProps {
  overallScore: number
  factors: TrustFactor[]
  type: "employer" | "candidate"
  className?: string
}

export function ExplainableTrustScore({
  overallScore,
  factors,
  type,
  className,
}: ExplainableTrustScoreProps) {
  const getStatusIcon = (status: TrustFactor["status"]) => {
    switch (status) {
      case "verified":
        return <UiIcon icon={CheckCircle2} size="sm" className="text-emerald-600 dark:text-emerald-400" />
      case "pending":
        return <UiIcon icon={AlertCircle} size="sm" className="text-amber-600 dark:text-amber-400" />
      case "missing":
        return <UiIcon icon={XCircle} size="sm" className="text-muted-foreground" />
    }
  }

  const getStatusColor = (status: TrustFactor["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "missing":
        return "text-gray-400"
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconBadge icon={ShieldCheck} tone="gold" size="sm" />
              Trust Score
            </CardTitle>
            <CardDescription>Transparent breakdown of trustworthiness</CardDescription>
          </div>
          <Badge
            variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "outline" : "outline"}
            className="text-lg"
          >
            {overallScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Score</span>
            <span className="text-muted-foreground">
              {overallScore >= 80
                ? "Excellent"
                : overallScore >= 60
                  ? "Good"
                  : overallScore >= 40
                    ? "Fair"
                    : "Needs Improvement"}
            </span>
          </div>
          <Progress value={overallScore} />
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Trust Factors</p>
          {factors.map((factor, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(factor.status)}
                  <span className={cn("text-sm font-medium", getStatusColor(factor.status))}>
                    {factor.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {factor.score}/{factor.maxScore}
                </span>
              </div>
              <Progress value={(factor.score / factor.maxScore) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Trust scores are calculated based on verification status, response rates, platform history, and
            user reports. Higher scores indicate more reliable {type === "employer" ? "employers" : "candidates"}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
