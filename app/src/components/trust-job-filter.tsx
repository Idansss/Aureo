"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Clock, TrendingUp } from "lucide-react"

interface TrustJobFilterProps {
  hideLowTrust: boolean
  onHideLowTrustChange: (value: boolean) => void
  minTrustScore: number
  onMinTrustScoreChange: (value: number[]) => void
  minResponseRate: number
  onMinResponseRateChange: (value: number[]) => void
  maxResponseTime: number
  onMaxResponseTimeChange: (value: number[]) => void
}

export function TrustJobFilter({
  hideLowTrust,
  onHideLowTrustChange,
  minTrustScore,
  onMinTrustScoreChange,
  minResponseRate,
  onMinResponseRateChange,
  maxResponseTime,
  onMaxResponseTimeChange,
}: TrustJobFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Trust Filters
        </CardTitle>
        <CardDescription>Filter jobs by trust signals and employer quality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hide-low-trust">Hide Low-Trust Posts</Label>
            <p className="text-xs text-muted-foreground">Only show verified employers</p>
          </div>
          <Switch id="hide-low-trust" checked={hideLowTrust} onCheckedChange={onHideLowTrustChange} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Minimum Trust Score</Label>
            <Badge variant="outline">{minTrustScore}%</Badge>
          </div>
          <Slider
            value={[minTrustScore]}
            onValueChange={onMinTrustScoreChange}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Minimum Response Rate
            </Label>
            <Badge variant="outline">{minResponseRate}%</Badge>
          </div>
          <Slider
            value={[minResponseRate]}
            onValueChange={onMinResponseRateChange}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Max Response Time
            </Label>
            <Badge variant="outline">{maxResponseTime} days</Badge>
          </div>
          <Slider
            value={[maxResponseTime]}
            onValueChange={onMaxResponseTimeChange}
            min={1}
            max={14}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 day</span>
            <span>14 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



