// Extended types for full platform features

import type { PortfolioItem } from "./types"

// ===== EMPLOYER & ORGANIZATION TYPES =====

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  description?: string
  verified: boolean
  verificationLevel: "none" | "domain" | "document" | "verified"
  trustScore: number
  responseRate: number
  avgResponseTime: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  userId: string
  organizationId: string
  role: "owner" | "admin" | "recruiter" | "viewer"
  email: string
  name: string
  invitedBy?: string
  invitedAt: string
  joinedAt?: string
  status: "pending" | "active" | "inactive"
}

export interface TeamInvite {
  id: string
  organizationId: string
  email: string
  role: "admin" | "recruiter" | "viewer"
  invitedBy: string
  invitedAt: string
  expiresAt: string
  acceptedAt?: string
}

// ===== JOB TYPES =====

export type JobStatus = "draft" | "live" | "paused" | "filled" | "closed"

export interface JobTemplate {
  id: string
  organizationId: string
  name: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  tags: string[]
  employmentType: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  remote: boolean
  locations?: string[]
  createdAt: string
}

export interface EnhancedJob {
  id: string
  organizationId: string
  templateId?: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  tags: string[]
  status: JobStatus
  employmentType: "Full-time" | "Part-time" | "Contract" | "Freelance"
  remote: boolean
  locations: string[]
  salaryMin: number
  salaryMax: number
  currency: string
  payPeriod: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  featured: boolean
  boosted: boolean
  views: number
  applies: number
  conversionRate: number
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  filledAt?: string
  closedAt?: string
  createdBy: string
  seoTitle?: string
  seoDescription?: string
  shareLink?: string
}

// ===== CANDIDATE & APPLICATION TYPES =====

export type ApplicationStatus = 
  | "applied" 
  | "screening" 
  | "shortlisted" 
  | "interview" 
  | "offer" 
  | "hired" 
  | "rejected"

export interface CandidateProfile {
  id: string
  userId: string
  name: string
  email: string
  headline?: string
  bio?: string
  location?: string
  avatar?: string
  resumeUrl?: string
  resumeVersion?: number
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  portfolio: PortfolioItem[]
  proofCards: ProofCard[]
  references: Reference[]
  profileCompleteness: number
  trustScore: number
  verified: boolean
  publicProfile: boolean
  createdAt: string
  updatedAt: string
}

export interface ExperienceItem {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  description?: string
}

export interface ProofCard {
  id: string
  type: "portfolio" | "github" | "certificate" | "case_study" | "other" | "proof_task"
  title: string
  description?: string
  url?: string
  imageUrl?: string
  verified: boolean
  createdAt: string
  completedAt?: string
  // Proof task specific fields
  score?: number
  passed?: boolean
  taskType?: string
  shareable?: boolean
}

export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone?: string
  relationship: string
  status: "pending" | "requested" | "completed" | "declined"
  verified: boolean
  createdAt: string
}

export interface EnhancedApplication {
  id: string
  jobId: string
  candidateId: string
  status: ApplicationStatus
  stage: string
  coverNote?: string
  documents: ApplicationDocument[]
  rating?: number
  tags: string[]
  notes: ApplicationNote[]
  source: string
  appliedAt: string
  updatedAt: string
  timeline: ApplicationEvent[]
}

export interface ApplicationDocument {
  id: string
  type: "resume" | "cover_letter" | "portfolio" | "other"
  name: string
  url: string
  uploadedAt: string
}

export interface ApplicationNote {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  private: boolean
}

export interface ApplicationEvent {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  userId?: string
}

// ===== MESSAGING TYPES =====

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderRole: "employer" | "candidate"
  recipientId: string
  content: string
  attachments: MessageAttachment[]
  read: boolean
  readAt?: string
  createdAt: string
}

export interface MessageThread {
  id: string
  jobId?: string
  applicationId?: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface SavedReply {
  id: string
  organizationId: string
  name: string
  content: string
  category: string
  createdAt: string
}

// ===== INTERVIEW TYPES =====

export interface Interview {
  id: string
  applicationId: string
  jobId: string
  candidateId: string
  type: "phone" | "video" | "onsite" | "panel"
  scheduledAt: string
  duration: number
  location?: string
  videoLink?: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled"
  interviewers: Interviewer[]
  notes: InterviewNote[]
  scorecard?: InterviewScorecard
  createdAt: string
}

export interface Interviewer {
  id: string
  name: string
  email: string
  role: string
  confirmed: boolean
}

export interface InterviewNote {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface InterviewScorecard {
  id: string
  interviewId: string
  criteria: ScorecardCriteria[]
  overallRating?: number
  recommendation?: "hire" | "maybe" | "no_hire"
  notes?: string
  completedAt: string
}

export interface ScorecardCriteria {
  id: string
  name: string
  rating: number
  notes?: string
}

// ===== OFFER TYPES =====

export interface Offer {
  id: string
  applicationId: string
  jobId: string
  candidateId: string
  position: string
  startDate: string
  salary: number
  currency: string
  payPeriod: string
  benefits: string[]
  notes?: string
  status: "draft" | "sent" | "accepted" | "declined" | "expired"
  expiresAt?: string
  sentAt?: string
  respondedAt?: string
  createdAt: string
}

// ===== REPORT & MODERATION TYPES =====

export type ReportType = "job" | "employer" | "candidate" | "message"

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed"

export interface Report {
  id: string
  type: ReportType
  reportedItemId: string
  reportedItemType: string
  reporterId: string
  reporterRole: "employer" | "candidate" | "admin"
  reason: string
  description: string
  evidence?: string[]
  status: ReportStatus
  assignedTo?: string
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

// ===== ANALYTICS TYPES =====

export interface JobAnalytics {
  jobId: string
  views: number
  applies: number
  conversionRate: number
  sourceBreakdown: SourceBreakdown[]
  stageBreakdown: StageBreakdown[]
  timeToRespond: number
  timeToHire: number
  avgStageDuration: Record<string, number>
  topSources: string[]
}

export interface SourceBreakdown {
  source: string
  count: number
  percentage: number
}

export interface StageBreakdown {
  stage: string
  count: number
  percentage: number
}

export interface CandidateAnalytics {
  candidateId: string
  profileViews: number
  recruiterViews: number
  clickThroughRate: number
  applications: number
  viewToApplyRatio: number
  interviewRate: number
  offerRate: number
}

// ===== BILLING TYPES =====

export type PlanType = "free" | "starter" | "professional" | "enterprise"

export interface Subscription {
  id: string
  organizationId: string
  planType: PlanType
  seats: number
  status: "active" | "cancelled" | "past_due"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  organizationId: string
  amount: number
  currency: string
  status: "draft" | "open" | "paid" | "void"
  items: InvoiceItem[]
  paidAt?: string
  dueDate: string
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// ===== AUDIT LOG TYPES =====

export interface AuditLog {
  id: string
  organizationId?: string
  userId: string
  userName: string
  action: string
  resourceType: string
  resourceId: string
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// ===== SEARCH & FILTER TYPES =====
// Note: SavedSearch is now defined in the SAVED SEARCHES & DIGESTS section below

export interface JobFilters {
  query?: string
  location?: string[]
  remote?: boolean
  employmentType?: string[]
  salaryMin?: number
  salaryMax?: number
  currency?: string
  trustScoreMin?: number
  tags?: string[]
  category?: string[]
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  readAt?: string
  createdAt: string
}

// ===== SAVED SEARCHES & DIGESTS =====

export interface SavedSearchFilters {
  location?: string
  remote?: boolean
  type?: string
  salaryMin?: number
  salaryMax?: number
  seniority?: string
  tags?: string[]
}

export interface SavedSearch {
  id: string
  userId: string
  name: string
  query: string
  filters: SavedSearchFilters
  schedule: {
    frequency: "daily" | "weekdays" | "instant"
    time?: string // "10:00"
    timezone?: string
  }
  delivery: {
    inbox: boolean
    email: boolean
  }
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  active: boolean
}

export interface DigestItem {
  id: string
  searchId: string
  searchName: string
  createdAt: string
  jobIds: string[]
  summaryRows: DigestRow[]
}

export interface DigestRow {
  jobId: string
  title: string
  company: string
  location: string
  url: string
  matchedSkills: string[]
  matchScore: number
}

export interface JobTracker {
  id: string
  userId: string
  jobId: string
  status: "saved" | "applied" | "interview" | "offer" | "rejected"
  notes?: string
  createdAt: string
  updatedAt: string
}

