"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { pricingPlans, type BillingCycle } from "./data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icon-badge";
import { routes } from "@/lib/routes";

const billingOptions: { id: BillingCycle; label: string; helper: string }[] = [
  { id: "monthly", label: "Monthly", helper: "Cancel anytime" },
  { id: "yearly", label: "Yearly", helper: "Save 20%" },
];

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm md:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Choose your momentum</h2>
          <p className="text-sm text-muted-foreground">
            Transparent pricing with no hidden fees, ever.
          </p>
        </div>
        <div className="flex shrink-0 items-center rounded-full border border-border bg-background p-1 text-sm shadow-sm">
          {billingOptions.map((option) => {
            const active = billingCycle === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setBillingCycle(option.id)}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => {
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const per =
            billingCycle === "monthly"
              ? "per seat / mo"
              : "per seat / mo (billed yearly)";
          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[var(--radius)] border border-border bg-background p-6 shadow-sm ${
                plan.highlighted ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {plan.name}
                  </p>
                  <p className="text-base font-semibold text-foreground">{plan.tagline}</p>
                </div>
                {plan.highlighted && (
                  <Badge variant="accent" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="mt-6 flex items-baseline gap-2 text-4xl font-semibold text-foreground">
                {plan.priceMonthly === 0 && plan.priceYearly === 0 ? (
                  <span>Free</span>
                ) : (
                  <>
                    <span>${price}</span>
                    <span className="text-sm font-normal text-muted-foreground">{per}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? "primary" : "outline"}
                asChild
              >
                {plan.name === "Team" ? (
                  <a href={routes.contact.sales}>{plan.cta}</a>
                ) : (
                  <Link href={`${routes.auth.register}?next=${routes.app.dashboard}`}>{plan.cta}</Link>
                )}
              </Button>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-foreground">
                    <IconBadge icon={Check} tone="success" size="sm" className="mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
