export interface CompanyRecord {
  id?: string;
  name: string;
  slug?: string;
  website?: string | null;
  verified?: boolean;
  response_rate?: number | null;
  flagged_count?: number | null;
  trust_score?: number | null;
  location?: string | null;
  description?: string | null;
  logo_url?: string | null;
}

export interface JobRecord {
  id: string;
  title: string;
  description?: string | null;
  requirements?: string | null;
  employment_type?: string | null;
  location?: string | null;
  remote?: boolean | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
  flagged?: boolean | null;
  scam_score?: number | null;
  scam_reasons?: unknown;
  companies?: CompanyRecord | null;
}

export interface ApplicationRecord {
  id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  notes?: string | null;
  withdrawn_at?: string | null;
  job_id: string;
  jobs?: JobRecord | null;
  profiles?: {
    full_name?: string | null;
    headline?: string | null;
    location?: string | null;
    cv_url?: string | null;
  } | null;
}

export interface ProfileRecord {
  id: string;
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  role?: "seeker" | "employer" | "admin";
  avatar_url?: string | null;
  cv_url?: string | null;
}

// Types for manifest files
export interface Application {
  id: string;
  status: "applied" | "screening" | "shortlisted" | "interview" | "offer" | "hired" | "rejected" | "withdrawn";
  appliedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    verified: boolean;
  };
  timeline: Array<{
    title: string;
    description?: string;
    timestamp: string;
  }>;
  notes?: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  email: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  appliedAt: string;
  avatar?: string | null;
  notes?: string | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  verified: boolean;
  location: string;
  type: string;
  salary: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  postedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
  trustScore: number;
  responseRate: number;
  avgResponseTime: string;
  applicants?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  tags: string[];
}
