import Link from "next/link";
import { routes } from "@/lib/routes";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerLinks: { title: string; items: FooterLink[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Jobs", href: routes.jobs },
      { label: "Employers", href: routes.employers.directory },
      { label: "Pricing", href: routes.pricing },
      { label: "Stories", href: routes.stories },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Dashboard", href: routes.app.dashboard },
      { label: "Applications", href: routes.app.applications },
      { label: "Saved jobs", href: routes.app.saved },
      { label: "Alerts", href: routes.alerts },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Support", href: routes.contact.support, external: true },
      { label: "Sales", href: routes.contact.sales, external: true },
      { label: "Status", href: routes.externalStatus, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aureo</h3>
            <p className="text-sm text-muted-foreground">
              Trustworthy hiring at calm speed.
            </p>
          </div>
          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.items.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        className="transition-colors hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>(c) {new Date().getFullYear()} Aureo. Crafted with proof.</span>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
