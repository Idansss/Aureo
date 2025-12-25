"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, CheckCircle2, Lightbulb } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"
import { cn } from "@/lib/utils"

interface AIMatchExplanation {
  matchScore: number
  reasons: {
    factor: string
    strength: "strong" | "medium" | "weak"
    explanation: string
    proof?: string
  }[]
  improvements: string[]
  confidence: "high" | "medium" | "low"
}

interface ExplainableAIMatchingProps {
  explanation: AIMatchExplanation
  className?: string
}

export function ExplainableAIMatching({ explanation, className }: ExplainableAIMatchingProps) {
  const strengthColors = {
    strong: "bg-green-600",
    medium: "bg-yellow-600",
    weak: "bg-blue-600",
  }

  const strengthLabels = {
    strong: "Strong Match",
    medium: "Good Match",
    weak: "Partial Match",
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconBadge icon={Sparkles} tone="gold" size="sm" />
              AI Match Explanation
            </CardTitle>
            <CardDescription>Transparent matching reasons and improvement suggestions</CardDescription>
          </div>
          <Badge
            variant={explanation.confidence === "high" ? "default" : "outline"}
            className="capitalize"
          >
            {explanation.confidence} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Match Score</span>
            <span className="text-muted-foreground">{explanation.matchScore}% match</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${explanation.matchScore}%` }}
            />
          </div>
        </div>

        {/* Match Reasons */}
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Why You Were Matched</p>
          {explanation.reasons.map((reason, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${strengthColors[reason.strength]}`} />
                  <span className="text-sm font-medium">{reason.factor}</span>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {strengthLabels[reason.strength]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-4">{reason.explanation}</p>
              {reason.proof && (
                <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <span>Proof: {reason.proof}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Improvements */}
        {explanation.improvements.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" aria-hidden />
            <AlertDescription>
              <p className="font-medium mb-2">Improve Your Matches</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {explanation.improvements.map((improvement, idx) => (
                  <li key={idx}>{improvement}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Transparency Note */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            This match is based on your skills, experience, proof cards, and job requirements. No
            black-box algorithms—everything is explainable.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
