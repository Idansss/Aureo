export interface StorySection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  quote?: {
    text: string;
    author?: string;
  };
}

export interface Story {
  slug: string;
  title: string;
  summary: string;
  category: "Hiring" | "Trust" | "Product" | "Remote" | "Growth";
  author: {
    name: string;
    role: string;
  };
  coverImage: string;
  publishedAt: string;
  readingTime: string;
  sections: StorySection[];
}

export const stories: Story[] = [
  {
    slug: "operating-a-trust-first-talent-pipeline",
    title: "Operating a trust-first talent pipeline at scale",
    summary:
      "How a lean people team reduced fraud, flagged risky roles, and improved offer acceptance by 23%.",
    category: "Trust",
    author: { name: "Ijeoma Aluko", role: "People Partner, Alloy" },
    coverImage:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-06-22",
    readingTime: "7 min read",
    sections: [
      {
        paragraphs: [
          "Alloy runs a distributed hiring team across three continents. Fraudulent postings and ghosted applications were eroding trust with senior candidates.",
          "The team adopted Aureo to centralize verification and surface high-signal roles before interviews began.",
        ],
      },
      {
        heading: "Building a single trust surface",
        paragraphs: [
          "We connected recruiter notes, employer verification, and response history into one view. Candidates could see what to expect and teams could course-correct quickly.",
        ],
        list: [
          "Weekly trust summary delivered to leadership",
          "Salary clarity checks tied to offer approvals",
          "Candidate proof packs shared automatically with hiring panels",
        ],
      },
      {
        heading: "Results after 90 days",
        paragraphs: [
          "Offer acceptance increased by 23% because candidates understood how decisions were made.",
          "Response times fell to 36 hours on average thanks to automated nudges and timeline visibility.",
        ],
        quote: {
          text: "Aureo turned our scattered trust rituals into a single calm rhythm. Proof and context travel with every candidate.",
          author: "Ijeoma Aluko",
        },
      },
    ],
  },
  {
    slug: "designing-for-calmer-hiring-weekly-rituals",
    title: "Designing calmer hiring rituals every Monday",
    summary:
      "Product Ops at Helix ships a weekly hiring review that removes surprises and keeps teams aligned.",
    category: "Product",
    author: { name: "Temi Ade", role: "Staff Product Designer, Helix" },
    coverImage:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-05-18",
    readingTime: "6 min read",
    sections: [
      {
        paragraphs: [
          "Helix schedules a 30-minute hiring standup every Monday. The team uses Aureo dashboards to highlight priorities, make trust decisions, and unblock recruiting squads.",
        ],
      },
      {
        heading: "Ritual ingredients",
        list: [
          "Shared agenda built directly from Aureo notes",
          "Heatmap showing each role's trust, proof, and velocity",
          "Instant story capture for leadership updates",
        ],
      },
      {
        heading: "Outcome",
        paragraphs: [
          "Teams close roles 18% faster and stay aligned on ownership. Everyone receives the same context minutes after the ritual wraps.",
        ],
      },
    ],
  },
  {
    slug: "why-response-rate-transparency-matters",
    title: "Why response rate transparency matters for senior talent",
    summary:
      "Seeker research shows honest response timelines keep candidates engaged even when outcomes change.",
    category: "Hiring",
    author: { name: "Marcus Fong", role: "Talent Lead, Lumen" },
    coverImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-03-12",
    readingTime: "8 min read",
    sections: [
      {
        paragraphs: [
          "Lumen surveyed over 500 candidates using Aureo profiles. Candidates who saw verified response rates were three times more likely to finish multi-step interview loops.",
        ],
      },
      {
        heading: "Key metrics",
        list: [
          "89% of seekers check average response times before applying",
          "Transparent timelines reduced ghosting complaints by 41%",
        ],
      },
    ],
  },
  {
    slug: "remote-interviews-that-dont-burn-out-candidates",
    title: "Remote interviews that do not burn out candidates",
    summary:
      "A simple structure for remote loops that respects time, improves signal, and closes faster.",
    category: "Remote",
    author: { name: "Aria Bello", role: "Product Designer, Aureo" },
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-02-08",
    readingTime: "5 min read",
    sections: [
      {
        heading: "What candidates want",
        paragraphs: [
          "Clear steps, fast feedback, and interviewers who have read the profile. Remote hiring works when teams treat time as precious.",
        ],
      },
      {
        heading: "A simple loop",
        list: [
          "One async screen using the candidate proof pack",
          "One live call for collaboration and communication",
          "One structured panel with rubric and decision owner",
        ],
      },
    ],
  },
  {
    slug: "scam-heuristics-we-show-before-you-apply",
    title: "Scam heuristics we show before you apply",
    summary:
      "The patterns we watch for and how we surface warnings without creating panic or noise.",
    category: "Trust",
    author: { name: "Abass Ibrahim", role: "Founder, Aureo" },
    coverImage:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-04-02",
    readingTime: "6 min read",
    sections: [
      {
        paragraphs: [
          "Trust signals should be calm and clear. Aureo highlights anomalies like inconsistent domains, suspicious compensation requests, and repeated reports.",
        ],
      },
      {
        heading: "What we flag",
        list: [
          "Asking for payment or personal financial information",
          "Non-company emails in recruiter outreach",
          "High report volume compared to posting volume",
        ],
      },
    ],
  },
  {
    slug: "bringing-hiring-and-finance-closer",
    title: "Bringing hiring and finance closer with shared dashboards",
    summary:
      "Finance needs clarity on offers, headcount, and trust risk. Aureo bridged the language gap with shared signals.",
    category: "Product",
    author: { name: "Jules Kalu", role: "Operations Lead, Kraft Labs" },
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-01-27",
    readingTime: "6 min read",
    sections: [
      {
        paragraphs: [
          "Kraft Labs used Aureo to expose budget impact, trust scores, and risk across every request. Finance and recruiting now sign off on the same view.",
        ],
      },
    ],
  },
  {
    slug: "how-we-exited-spreadsheets-for-hiring",
    title: "How we exited spreadsheets for hiring without losing speed",
    summary:
      "Startups moving fast default to spreadsheets. Here is how we replaced them without slowing decisions.",
    category: "Growth",
    author: { name: "Mary Ikon", role: "Recruiting Lead, Paystack" },
    coverImage:
      "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2024-12-15",
    readingTime: "7 min read",
    sections: [
      {
        paragraphs: [
          "We mapped every spreadsheet column to Aureo objects so nothing got lost. Recruiters now capture decision histories inline and candidates get clearer updates.",
        ],
      },
    ],
  },
  {
    slug: "introducing-proof-packs-for-founders",
    title: "Introducing proof packs for founders hiring their first operators",
    summary:
      "Founders hire while building product. Proof packs compress due diligence so teams can make confident offers.",
    category: "Hiring",
    author: { name: "Abass Ibrahim", role: "Founder, Aureo" },
    coverImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-07-02",
    readingTime: "4 min read",
    sections: [
      {
        paragraphs: [
          "Proof packs assemble verified references, portfolio snippets, and trust analytics into a shareable dossier. Founders keep momentum and candidates feel seen.",
        ],
      },
    ],
  },
];

export const categories = ["All", "Hiring", "Trust", "Product", "Remote", "Growth"] as const;

export function findStoryBySlug(slug: string) {
  return stories.find((story) => story.slug === slug);
}

