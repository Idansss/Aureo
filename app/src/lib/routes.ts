export const routes = {
  home: "/",
  jobs: "/jobs",
  employers: {
    directory: "/employers",
    profile: (slug: string) => `/employers/${slug}`,
  },
  pricing: "/pricing",
  stories: "/stories",
  status: "/status",
  settings: {
    root: "/settings",
    account: "/settings/account",
    appearance: "/settings/appearance",
    notifications: "/settings/notifications",
    privacy: "/settings/privacy",
    jobPreferences: "/settings/job-preferences",
    accessibility: "/settings/accessibility",
    billing: "/settings/billing",
    profile: "/settings/profile",
  },
  publicProfile: (username: string) => `/u/${username}`,
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  app: {
    dashboard: "/app",
    applications: "/app/applications",
    profile: "/app/profile",
    saved: "/app/saved",
  },
  dashboard: {
    employer: "/employer",
  },
  employer: {
    dashboard: "/employer",
    jobs: "/employer/jobs",
    pipeline: (id: string) => `/employer/jobs/${id}`,
    createJob: "/employer/jobs/new",
  },
  admin: {
    reports: "/admin/reports",
  },
  messages: "/messages",
  alerts: "/alerts",
  contact: {
    sales: "mailto:sales@aureo.work",
    support: "mailto:support@aureo.work",
  },
  externalStatus: "https://status.aureo.work",
};
