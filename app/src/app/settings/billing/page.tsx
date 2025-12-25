"use client";

import Link from "next/link";
import { CreditCard, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";

const invoices = [
  { id: "INV-1024", date: "2025-11-01", amount: "$0.00", status: "Paid" },
  { id: "INV-1023", date: "2025-10-01", amount: "$0.00", status: "Paid" },
];

export default function BillingSettingsPage() {
  const { settings } = useSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Billing" }]} />
      <PageHeader
        title="Billing"
        description="Plan details and invoices. This section is UI only for now."
        meta={<Badge variant="outline" className="gap-2"><CreditCard className="h-4 w-4 text-primary" aria-hidden />Billing</Badge>}
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Current plan</CardTitle>
          <CardDescription>Upgrade when you are ready for verified hiring workflows.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Plan" description="Your current subscription tier.">
            <div className="rounded-[var(--radius)] border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">{settings.billing.plan}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Billing upgrades will appear here once payments are enabled.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={routes.pricing}>View pricing</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={routes.pricing}>Upgrade</Link>
                </Button>
              </div>
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Invoices</CardTitle>
          <CardDescription>Historical billing receipts will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {invoices.length ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-sm font-semibold text-foreground">{invoice.amount}</p>
                    <Badge variant="subtle">{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-border bg-secondary p-6 text-sm text-muted-foreground">
              No invoices yet.
            </div>
          )}

          <div className="rounded-[var(--radius)] border border-border bg-muted p-4">
            <div className="flex items-start gap-3">
              <ReceiptText className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Receipts will be downloadable</p>
                <p className="text-sm text-muted-foreground">
                  Once payments are enabled, you will be able to export invoices for accounting and reimbursement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

