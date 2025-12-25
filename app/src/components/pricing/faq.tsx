import { faqs } from "./data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function PricingFAQ() {
  return (
    <section className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">Questions, answered</h2>
        <p className="text-sm text-muted-foreground">
          Billing, trust, security, and collaboration clarified.
        </p>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-[var(--radius)] border border-border bg-background px-4">
            <AccordionTrigger className="text-left text-base font-semibold text-foreground">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

