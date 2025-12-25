"use client";

import type { Story } from "@/lib/stories";
import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { StoryCard } from "./story-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";

interface StoryFiltersProps {
  stories: Story[];
  categories: readonly string[];
}

export function StoryFilters({ stories, categories }: StoryFiltersProps) {
  const [selected, setSelected] = useState<string>("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const base = selected === "All" ? stories : stories.filter((story) => story.category === selected);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((story) =>
      `${story.title} ${story.summary} ${story.category}`.toLowerCase().includes(q),
    );
  }, [selected, stories, query]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm lg:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Browse stories</p>
          <p className="text-sm text-muted-foreground">
            Filter by category or search for a topic, trust signal, or workflow.
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories"
          className="lg:max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const active = selected === category;
          return (
            <Button
              key={category}
              type="button"
              variant={active ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setSelected(category)}
            >
              {category}
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stories found"
          description="Try another keyword or switch categories."
          icon={SearchX}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
