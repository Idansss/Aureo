"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, CheckCircle2, Clock } from "lucide-react"
import { MutualInterestSignals, type InterestSignal } from "@/lib/mutual-interest"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MutualInterestButtonProps {
  candidateId?: string
  employerId?: string
  jobId?: string
  currentUserId: string
  userType: "candidate" | "employer"
  existingSignal?: InterestSignal
  mutualInterest?: boolean
  onSignalSent?: (signal: InterestSignal) => void
  onMutualInterest?: () => void
}

export function MutualInterestButton({
  candidateId,
  employerId,
  jobId,
  currentUserId,
  userType,
  existingSignal,
  mutualInterest,
  onSignalSent,
  onMutualInterest,
}: MutualInterestButtonProps) {
  const [signal, setSignal] = useState<InterestSignal | null>(existingSignal || null)
  const [isMutual, setIsMutual] = useState(mutualInterest || false)
  const [loading, setLoading] = useState(false)

  const handleSendSignal = () => {
    setLoading(true)
    const targetId = userType === "candidate" ? employerId! : candidateId!
    const targetType = userType === "candidate" ? "employer" : "candidate"

    const newSignal = MutualInterestSignals.sendSignal(
      currentUserId,
      userType,
      targetId,
      targetType,
      jobId
    )

    setSignal(newSignal)
    onSignalSent?.(newSignal)
    setLoading(false)
  }

  const handleRespond = (response: "accepted" | "declined") => {
    if (!signal) return

    setLoading(true)
    const result = MutualInterestSignals.respondToSignal(signal, response)

    setSignal(result.signal)
    if (result.mutual) {
      setIsMutual(true)
      onMutualInterest?.()
    }
    setLoading(false)
  }

  if (isMutual) {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Mutual Interest
      </Badge>
    )
  }

  if (signal?.status === "pending" && signal.fromId === currentUserId) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Signal Sent
      </Badge>
    )
  }

  if (signal?.status === "pending" && signal.toId === currentUserId) {
    return (
      <div className="space-y-2">
        <Alert>
          <Heart className="h-4 w-4" />
          <AlertDescription>
            {userType === "candidate" ? "Employer" : "Candidate"} sent you an interest signal!
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleRespond("accepted")}
            disabled={loading}
          >
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleRespond("declined")} disabled={loading}>
            Decline
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSendSignal}
      disabled={loading}
      className="gap-2"
    >
      <Heart className="h-4 w-4" />
      Signal Interest
    </Button>
  )
}



