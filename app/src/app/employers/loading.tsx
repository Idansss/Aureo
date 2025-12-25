import { HeroSkeleton, EmployerCardSkeleton } from "@/components/skeleton-sections";

export default function LoadingEmployers() {
  return (
    <div className="space-y-12 pb-16">
      <HeroSkeleton />
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="h-[520px] animate-pulse rounded-[var(--radius)] border border-border bg-card" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <EmployerCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

