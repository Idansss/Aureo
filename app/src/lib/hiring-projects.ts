// Hiring Projects - Bundle job, pipeline, interview kit, scorecards, messages, audit log
import type { EnhancedJob, Interview, AuditLog } from "./types-extended"

export interface HiringProject {
  id: string
  organizationId: string
  jobId: string
  job: EnhancedJob
  title: string
  description?: string
  status: "draft" | "active" | "paused" | "filled" | "closed"
  pipeline: ProjectPipeline
  interviewKit?: InterviewKit
  scorecards: Scorecard[]
  messages: ProjectMessage[]
  auditLog: AuditLog[]
  decisionRecord?: DecisionRecord
  createdAt: string
  updatedAt: string
}

export interface ProjectPipeline {
  stages: PipelineStage[]
  candidates: PipelineCandidate[]
  automationRules: AutomationRule[]
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  autoAdvance?: boolean
}

export interface PipelineCandidate {
  candidateId: string
  stageId: string
  addedAt: string
  lastActivity: string
  relevanceScore?: number
}

export interface AutomationRule {
  id: string
  trigger: "message_sent" | "message_received" | "interview_scheduled" | "offer_sent" | "offer_accepted"
  action: "move_to_stage"
  targetStageId: string
  enabled: boolean
}

export interface InterviewKit {
  id: string
  projectId: string
  questions: InterviewQuestion[]
  scorecardTemplate: ScorecardTemplate
  duration: number // minutes
  format: "phone" | "video" | "onsite" | "take_home"
}

export interface InterviewQuestion {
  id: string
  question: string
  type: "behavioral" | "technical" | "cultural" | "case_study"
  suggestedAnswer?: string
}

export interface Scorecard {
  id: string
  candidateId: string
  interviewerId: string
  interviewId?: string
  scores: ScoreItem[]
  notes: string
  overallRating: number
  createdAt: string
}

export interface ScoreItem {
  category: string
  score: number
  maxScore: number
  notes?: string
}

export interface ScorecardTemplate {
  categories: ScoreCategory[]
}

export interface ScoreCategory {
  name: string
  weight: number
  maxScore: number
}

export interface ProjectMessage {
  id: string
  threadId: string
  type: "outreach" | "response" | "interview_invite" | "offer" | "rejection"
  sentAt: string
  openedAt?: string
  repliedAt?: string
}

export interface DecisionRecord {
  id: string
  candidateId: string
  decision: "hired" | "rejected" | "withdrawn"
  reason: string
  notes: string
  decidedBy: string
  decidedAt: string
  filledRole: boolean
}

export class HiringProjects {
  static createProject(
    organizationId: string,
    job: EnhancedJob,
    title: string
  ): HiringProject {
    const defaultStages: PipelineStage[] = [
      { id: "applied", name: "Applied", order: 0, color: "blue" },
      { id: "screening", name: "Screening", order: 1, color: "yellow" },
      { id: "interview", name: "Interview", order: 2, color: "purple" },
      { id: "offer", name: "Offer", order: 3, color: "green" },
      { id: "hired", name: "Hired", order: 4, color: "teal" },
    ]

    const defaultAutomationRules: AutomationRule[] = [
      {
        id: "auto_1",
        trigger: "message_sent",
        action: "move_to_stage",
        targetStageId: "screening",
        enabled: true,
      },
      {
        id: "auto_2",
        trigger: "interview_scheduled",
        action: "move_to_stage",
        targetStageId: "interview",
        enabled: true,
      },
      {
        id: "auto_3",
        trigger: "offer_sent",
        action: "move_to_stage",
        targetStageId: "offer",
        enabled: true,
      },
      {
        id: "auto_4",
        trigger: "offer_accepted",
        action: "move_to_stage",
        targetStageId: "hired",
        enabled: true,
      },
    ]

    return {
      id: `project_${Date.now()}`,
      organizationId,
      jobId: job.id,
      job,
      title,
      status: "active",
      pipeline: {
        stages: defaultStages,
        candidates: [],
        automationRules: defaultAutomationRules,
      },
      scorecards: [],
      messages: [],
      auditLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  static addDecisionRecord(
    project: HiringProject,
    candidateId: string,
    decision: "hired" | "rejected" | "withdrawn",
    reason: string,
    notes: string,
    decidedBy: string
  ): HiringProject {
    const record: DecisionRecord = {
      id: `decision_${Date.now()}`,
      candidateId,
      decision,
      reason,
      notes,
      decidedBy,
      decidedAt: new Date().toISOString(),
      filledRole: decision === "hired",
    }

    return {
      ...project,
      decisionRecord: record,
      status: decision === "hired" ? "filled" : project.status,
      updatedAt: new Date().toISOString(),
    }
  }

  static applyAutomation(
    project: HiringProject,
    trigger: AutomationRule["trigger"],
    candidateId: string
  ): HiringProject {
    const rule = project.pipeline.automationRules.find(
      (r) => r.trigger === trigger && r.enabled
    )

    if (!rule) return project

    // Move candidate to target stage
    const updatedCandidates = project.pipeline.candidates.map((c) =>
      c.candidateId === candidateId
        ? { ...c, stageId: rule.targetStageId, lastActivity: new Date().toISOString() }
        : c
    )

    return {
      ...project,
      pipeline: {
        ...project.pipeline,
        candidates: updatedCandidates,
      },
      updatedAt: new Date().toISOString(),
    }
  }
}



