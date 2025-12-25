import { ShieldCheck, Clock, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type BillingCycle = "monthly" | "yearly";

export interface PricingPlan {
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  highlighted?: boolean;
  cta: string;
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    tagline: "Explore Aureo with personal proof tools.",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Track two applications, publish a basic profile, and explore trust dashboards.",
    cta: "Start for free",
    features: [
      "2 tracked applications",
      "Portfolio links + CV hosting",
      "Message templates",
      "Basic trust alerts",
    ],
  },
  {
    name: "Pro",
    tagline: "Serious candidates who want verified exposure.",
    priceMonthly: 29,
    priceYearly: 24,
    description: "Unlock unlimited applications, verified employer filters, and weekly insights.",
    highlighted: true,
    cta: "Upgrade to Pro",
    features: [
      "Unlimited applications",
      "Verified employer filters",
      "Automated follow-up nudges",
      "Full portfolio analytics",
    ],
  },
  {
    name: "Team",
    tagline: "Hiring teams that require audit trails and collaboration.",
    priceMonthly: 79,
    priceYearly: 65,
    description: "Seats for recruiters, shared pipelines, compliance exports, and concierge support.",
    cta: "Talk to sales",
    features: [
      "Up to 10 recruiter seats",
      "Shared trust dashboards",
      "Compliance exports",
      "Unlimited automations",
    ],
  },
];

export interface FeatureComparisonRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
}

export const featureComparison: FeatureComparisonRow[] = [
  { label: "Verified employer directory", free: true, pro: true, team: true },
  { label: "Application tracker", free: "2 roles", pro: "Unlimited", team: "Unlimited + shared" },
  { label: "Trust score alerts", free: "Basic", pro: "Advanced", team: "Advanced + audit" },
  { label: "Response rate analytics", free: false, pro: true, team: true },
  { label: "Portfolio hosting", free: "3 projects", pro: "Unlimited", team: "Unlimited + shared" },
  { label: "Team collaboration", free: false, pro: false, team: "Up to 10 seats" },
  { label: "Compliance exports", free: false, pro: false, team: true },
  { label: "Concierge support", free: false, pro: "Chat", team: "Dedicated manager" },
  { label: "Automation rules", free: false, pro: "3 rules", team: "Unlimited" },
  { label: "Interview scheduling", free: false, pro: true, team: true },
  { label: "Custom trust checklists", free: false, pro: true, team: true },
];

export interface TrustPoint {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const trustPoints: TrustPoint[] = [
  {
    title: "Verified identity & proof",
    description: "Every employer undergoes manual verification with documentation before they can post.",
    icon: ShieldCheck,
  },
  {
    title: "Response rate accountability",
    description: "We track reply times per role so you always know when to follow up or move on.",
    icon: Clock,
  },
  {
    title: "Transparent salary signals",
    description: "Compensation bands are enforced and flagged if they fall outside honest ranges.",
    icon: Eye,
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: "Can I switch between monthly and yearly at any time?",
    answer:
      "Yes. Billing changes take effect on the next cycle and pro-rate automatically. You keep access to all saved data.",
  },
  {
    question: "Do I need a credit card for the Free plan?",
    answer:
      "No payment info is required to explore Aureo. Upgrade only when you are ready to access premium insights.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "We securely retain your profile and history for 90 days so you can reactivate without losing trust metrics.",
  },
  {
    question: "Does Team pricing include employer verification?",
    answer:
      "Yes. Team plans include priority verification plus a dedicated trust manager to review every job listing.",
  },
  {
    question: "Is there a discount for non-profits or students?",
    answer: "We offer 30% off Pro for students and non-profits. Reach out to support to apply the credit.",
  },
  {
    question: "Can I invite collaborators on the Pro plan?",
    answer:
      "Pro is for individual seekers. You can share read-only status views, but collaborative pipelines require Team seats.",
  },
  {
    question: "Do you integrate with external ATS platforms?",
    answer:
      "Yes. Team plans include webhooks and native integrations with Greenhouse, Lever, and Ashby to sync progress.",
  },
  {
    question: "How secure is Aureo?",
    answer:
      "We run automated penetration tests, encrypt data in transit and at rest, and review feature access every quarter.",
  },
];

export const metrics = [
  { title: "Fraud filtered", value: "1.4k+", helper: "Scam listings stopped before reaching seekers." },
  {
    title: "Employers reviewed quarterly",
    value: "420+",
    helper: "Humans verifying ID, registered businesses, and payment methods.",
  },
  { title: "Avg. recruiter response", value: "36h", helper: "Measured across every verified role." },
];
