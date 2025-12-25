"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, TrendingUp, MapPin, DollarSign } from "lucide-react"
import { SalaryInsights, type SalaryInsight } from "@/lib/salary-insights"
import { cn } from "@/lib/utils"

interface SalaryInsightsCardProps {
  jobTitle: string
  location: string
  salaryMin: number
  salaryMax: number
  currency?: string
  className?: string
}

export function SalaryInsightsCard({
  jobTitle,
  location,
  salaryMin,
  salaryMax,
  currency = "USD",
  className,
}: SalaryInsightsCardProps) {
  const insight = SalaryInsights.analyze(jobTitle, location, salaryMin, salaryMax, currency)
  const fairnessScore = SalaryInsights.getFairnessScore(insight)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Salary Insights
        </CardTitle>
        <CardDescription>Market analysis and fairness indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Range Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Range Confidence</span>
            <Badge
              variant={
                insight.rangeConfidence === "high"
                  ? "default"
                  : insight.rangeConfidence === "medium"
                    ? "outline"
                    : "destructive"
              }
              className="capitalize"
            >
              {insight.rangeConfidence}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(salaryMin)} - {formatCurrency(salaryMax)}
          </div>
        </div>

        {/* Market Match */}
        {insight.marketMatch && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-900 dark:text-green-100">
              Salary range matches market data
            </span>
          </div>
        )}

        {/* Location Adjustment */}
        {insight.locationAdjustment && (
          <div className="space-y-2 p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location Adjustment</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Adjusted for cost of living: {formatCurrency(insight.locationAdjustment.adjustedMin)} -{" "}
              {formatCurrency(insight.locationAdjustment.adjustedMax)}
            </div>
          </div>
        )}

        {/* Benefits Value */}
        {insight.benefitsValue && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estimated Benefits Value</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ~{formatCurrency(insight.benefitsValue)} annually (estimated 25% of salary)
            </div>
          </div>
        )}

        {/* Insights */}
        {insight.insights.length > 0 && (
          <div className="space-y-2">
            {insight.insights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {insight.warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {insight.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm">
                    {warning}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Fairness Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Fairness Score</span>
            <Badge
              variant={fairnessScore >= 70 ? "default" : fairnessScore >= 50 ? "outline" : "destructive"}
            >
              {fairnessScore}/100
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on market data, range confidence, and location adjustments
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

