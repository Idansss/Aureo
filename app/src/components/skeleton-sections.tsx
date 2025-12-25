import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="space-y-5 rounded-[var(--radius)] border border-border bg-card p-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-1/2" />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-5">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

export function EmployerCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
