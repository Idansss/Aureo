"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Code, Link2, Award, Briefcase } from "lucide-react"
import type { CandidateProfile, ProofCard } from "@/lib/types-extended"

interface ProofScreeningRubricProps {
  candidate: CandidateProfile
  onScoreChange?: (scores: Record<string, number>) => void
  onNotesChange?: (notes: string) => void
}

export function ProofScreeningRubric({ candidate, onScoreChange, onNotesChange }: ProofScreeningRubricProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState("")

  const handleScoreChange = (category: string, value: string) => {
    const newScores = { ...scores, [category]: parseInt(value) }
    setScores(newScores)
    onScoreChange?.(newScores)
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    onNotesChange?.(value)
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxScore = 25 // 5 categories * 5 points each

  const categories = [
    {
      id: "portfolio",
      name: "Portfolio Quality",
      icon: Briefcase,
      description: "Relevance and quality of portfolio projects",
      items: candidate.portfolio,
    },
    {
      id: "code",
      name: "Code Samples",
      icon: Code,
      description: "GitHub repositories and code quality",
      items: candidate.proofCards.filter((p) => p.type === "github"),
    },
    {
      id: "case_studies",
      name: "Case Studies",
      icon: FileText,
      description: "Detailed project documentation",
      items: candidate.proofCards.filter((p) => p.type === "case_study"),
    },
    {
      id: "certifications",
      name: "Certifications",
      icon: Award,
      description: "Verified credentials and certifications",
      items: candidate.proofCards.filter((p) => p.type === "certificate"),
    },
    {
      id: "experience",
      name: "Experience Evidence",
      icon: Link2,
      description: "Work history and references",
      items: candidate.experience,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof-Based Screening Rubric</CardTitle>
        <CardDescription>Evaluate candidate based on artifacts and proof, not just resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => {
          const Icon = category.icon
          const hasItems = category.items.length > 0

          return (
            <div key={category.id} className="space-y-3 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label className="text-base font-semibold">{category.name}</Label>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                {hasItems && (
                  <Badge variant="outline" className="text-xs">
                    {category.items.length} item{category.items.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {hasItems ? (
                <RadioGroup
                  value={scores[category.id]?.toString() || ""}
                  onValueChange={(value) => handleScoreChange(category.id, value)}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <div key={score} className="flex flex-col items-center gap-1">
                        <RadioGroupItem value={score.toString()} id={`${category.id}-${score}`} />
                        <Label
                          htmlFor={`${category.id}-${score}`}
                          className="text-xs text-center cursor-pointer"
                        >
                          {score}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground italic">No {category.name.toLowerCase()} provided</p>
              )}
            </div>
          )
        })}

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="notes">Overall Notes</Label>
          <Textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes about the candidate's proof and artifacts..."
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm font-medium">Total Score</p>
            <p className="text-2xl font-bold">{totalScore}/{maxScore}</p>
          </div>
          <Badge
            variant={totalScore >= 20 ? "default" : totalScore >= 15 ? "outline" : "outline"}
            className="text-lg"
          >
            {totalScore >= 20 ? "Strong" : totalScore >= 15 ? "Good" : "Needs Review"}
          </Badge>
        </div>

        <Button variant="primary" className="w-full">
          Save Evaluation
        </Button>
      </CardContent>
    </Card>
  )
}

