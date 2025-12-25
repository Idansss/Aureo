"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Info, Lightbulb } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { RelevanceScore } from "@/lib/relevance-scoring"
import { cn } from "@/lib/utils"

interface RelevanceScoreCardProps {
  score: RelevanceScore
  className?: string
}

export function RelevanceScoreCard({ score, className }: RelevanceScoreCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Relevance Score
            </CardTitle>
            <CardDescription>Transparent ranking explanation</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg">
            {score.overall}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Match</span>
            <span className="text-muted-foreground">Rank #{score.rank}</span>
          </div>
          <Progress value={score.overall} />
        </div>

        {/* Explanation */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">{score.explanation}</AlertDescription>
        </Alert>

        {/* Factors Breakdown */}
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Score Breakdown</p>
          {score.factors.map((factor, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{factor.name}</span>
                  <span className="text-xs text-muted-foreground">({Math.round(factor.weight * 100)}%)</span>
                </div>
                <span className="text-muted-foreground">
                  {factor.score}/{factor.maxScore}
                </span>
              </div>
              <Progress value={(factor.score / factor.maxScore) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground">{factor.explanation}</p>
              {factor.improvement && (
                <Alert className="py-2">
                  <Lightbulb className="h-3 w-3" />
                  <AlertDescription className="text-xs">{factor.improvement}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



