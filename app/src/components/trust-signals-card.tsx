import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrustBadge } from "@/components/trust-badge"
import { ShieldCheck, TrendingUp, Clock } from "lucide-react"

interface TrustSignalsCardProps {
  trustScore?: number
  responseRate?: number
  avgResponseTime?: string
  verified?: boolean
}

export function TrustSignalsCard({
  trustScore = 0,
  responseRate = 0,
  avgResponseTime = "N/A",
  verified = false,
}: TrustSignalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trust Signals</CardTitle>
        <CardDescription>Verified metrics for this employer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Verification</span>
          </div>
          <TrustBadge verified={verified} size="sm" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Trust Score</span>
          </div>
          <span className="text-sm font-semibold">{trustScore}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Response Rate</span>
          </div>
          <span className="text-sm font-semibold">{responseRate}%</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Avg Response Time</span>
          <span className="text-sm text-muted-foreground">{avgResponseTime}</span>
        </div>
      </CardContent>
    </Card>
  )
}



