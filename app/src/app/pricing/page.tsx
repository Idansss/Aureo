import { Metadata } from "next";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { FeatureTable } from "@/components/pricing/feature-table";
import { TrustSafety } from "@/components/pricing/trust-safety";
import { PricingFAQ } from "@/components/pricing/faq";
import { FinalPricingCTA } from "@/components/pricing/final-cta";

export const metadata: Metadata = {
  title: "Pricing, Aureo",
  description: "Transparent pricing for seekers and hiring teams using Aureo.",
};

export default function PricingPage() {
  return (
    <div className="space-y-12 pb-16">
      <PricingHero />
      <PricingPlans />
      <FeatureTable />
      <TrustSafety />
      <PricingFAQ />
      <FinalPricingCTA />
    </div>
  );
}

