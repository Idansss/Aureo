"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar, DollarSign, FileText } from "lucide-react"
import type { Offer } from "@/lib/types-extended"
import { cn } from "@/lib/utils"

interface OfferClarityCardProps {
  offer: Offer
  className?: string
}

export function OfferClarityCard({ offer, className }: OfferClarityCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPayPeriodLabel = (period: string) => {
    switch (period) {
      case "hourly":
        return "per hour"
      case "daily":
        return "per day"
      case "weekly":
        return "per week"
      case "monthly":
        return "per month"
      case "yearly":
        return "per year"
      default:
        return period
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Offer Details
          </CardTitle>
          <Badge
            variant={
              offer.status === "accepted"
                ? "default"
                : offer.status === "sent"
                  ? "outline"
                  : offer.status === "declined"
                    ? "destructive"
                    : "outline"
            }
            className="capitalize"
          >
            {offer.status}
          </Badge>
        </div>
        <CardDescription>Standardized offer breakdown with compensation and timeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Position</p>
          <p className="text-lg font-semibold">{offer.position}</p>
        </div>

        {/* Compensation */}
        <div className="space-y-3 p-4 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <p className="font-semibold">Compensation</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(offer.salary, offer.currency)}
              </span>
              <span className="text-sm text-muted-foreground">{getPayPeriodLabel(offer.payPeriod)}</span>
            </div>
            {offer.payPeriod === "yearly" && (
              <p className="text-sm text-muted-foreground">
                ≈ {formatCurrency(offer.salary / 12, offer.currency)} per month
              </p>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Start Date</p>
          </div>
          <p className="text-base">{new Date(offer.startDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>

        {/* Benefits */}
        {offer.benefits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Benefits</p>
            <div className="space-y-1">
              {offer.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {offer.notes && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
            <p className="text-sm text-muted-foreground">{offer.notes}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium text-muted-foreground">Timeline</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Offer Sent</span>
              <span>{offer.sentAt ? new Date(offer.sentAt).toLocaleDateString() : "Pending"}</span>
            </div>
            {offer.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span>{new Date(offer.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
            {offer.respondedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Response</span>
                <span>{new Date(offer.respondedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

