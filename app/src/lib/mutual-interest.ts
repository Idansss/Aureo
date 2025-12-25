// Mutual Interest Signals - Candidate/employer interest, unlocks faster messaging
export interface InterestSignal {
  id: string
  fromId: string
  fromType: "candidate" | "employer"
  toId: string
  toType: "candidate" | "employer"
  jobId?: string
  status: "pending" | "accepted" | "declined" | "mutual"
  sentAt: string
  respondedAt?: string
  expiresAt: string
}

export interface MutualInterest {
  candidateId: string
  employerId: string
  jobId?: string
  establishedAt: string
  unlocksMessaging: boolean
}

export class MutualInterestSignals {
  static sendSignal(
    fromId: string,
    fromType: "candidate" | "employer",
    toId: string,
    toType: "candidate" | "employer",
    jobId?: string
  ): InterestSignal {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

    return {
      id: `signal_${Date.now()}`,
      fromId,
      fromType,
      toId,
      toType,
      jobId,
      status: "pending",
      sentAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    }
  }

  static respondToSignal(
    signal: InterestSignal,
    response: "accepted" | "declined"
  ): { signal: InterestSignal; mutual?: MutualInterest } {
    const updatedSignal: InterestSignal = {
      ...signal,
      status: response === "accepted" ? "mutual" : "declined",
      respondedAt: new Date().toISOString(),
    }

    // Check if mutual interest exists
    if (response === "accepted") {
      // In production, check if reverse signal exists
      const mutual: MutualInterest = {
        candidateId: signal.fromType === "candidate" ? signal.fromId : signal.toId,
        employerId: signal.fromType === "employer" ? signal.fromId : signal.toId,
        jobId: signal.jobId,
        establishedAt: new Date().toISOString(),
        unlocksMessaging: true,
      }

      return { signal: updatedSignal, mutual }
    }

    return { signal: updatedSignal }
  }

  static checkMutualInterest(
    candidateId: string,
    employerId: string,
    signals: InterestSignal[]
  ): boolean {
    const candidateSignal = signals.find(
      (s) =>
        s.fromId === candidateId &&
        s.fromType === "candidate" &&
        s.toId === employerId &&
        s.status === "mutual"
    )
    const employerSignal = signals.find(
      (s) =>
        s.fromId === employerId &&
        s.fromType === "employer" &&
        s.toId === candidateId &&
        s.status === "mutual"
    )

    return !!(candidateSignal || employerSignal)
  }
}



