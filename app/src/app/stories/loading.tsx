import { HeroSkeleton, StoryCardSkeleton } from "@/components/skeleton-sections";

export default function LoadingStories() {
  return (
    <div className="space-y-12 pb-16">
      <HeroSkeleton />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-11 w-28 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <StoryCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

