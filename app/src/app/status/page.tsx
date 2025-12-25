import { Metadata } from "next";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Status, Aureo",
  description: "Core route checklist for Aureo.",
};

const coreRoutes = [
  routes.home,
  routes.jobs,
  routes.employers.directory,
  routes.pricing,
  routes.stories,
  routes.alerts,
  routes.messages,
  routes.employer.dashboard,
  routes.employer.jobs,
  routes.app.dashboard,
  routes.app.applications,
  routes.app.saved,
  routes.app.profile,
  routes.admin.reports,
];

export default function StatusPage() {
  return (
    <div
      data-smoke-marker="aureo-status"
      className="space-y-6"
    >
      <PageHeader
        title="Status"
        description="Core route checklist for Aureo."
        meta={
          <>
            <span>Smoke: node scripts/smoke-routes.mjs</span>
          </>
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {coreRoutes.map((href) => (
          <li key={href} className="rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">{href}</p>
            <p className="text-xs text-muted-foreground">Expected to render.</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
