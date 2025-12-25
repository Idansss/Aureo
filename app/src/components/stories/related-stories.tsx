import type { Story } from "@/lib/stories";
import { StoryCard } from "./story-card";

interface RelatedStoriesProps {
  stories: Story[];
}

export function RelatedStories({ stories }: RelatedStoriesProps) {
  if (stories.length === 0) return null;
  return (
    <section className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">Related stories</h2>
        <p className="text-sm text-muted-foreground">More signal from teams building with Aureo.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
    </section>
  );
}

