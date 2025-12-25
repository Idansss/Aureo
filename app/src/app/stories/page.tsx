import { Metadata } from "next";
import { StoryFilters } from "@/components/stories/story-filters";
import { categories, stories } from "@/lib/stories";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Stories, Aureo",
  description: "Proof, playbooks, and interviews with teams hiring transparently on Aureo.",
};

export default function StoriesPage() {
  const featured = stories[0];
  const coverImage =
    featured?.coverImage && featured.coverImage.startsWith("http")
      ? featured.coverImage
      : "/images/story-placeholder.svg";

  return (
    <div className="space-y-12 pb-16">
      <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card px-6 py-10 shadow-sm md:px-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Stories
          </p>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Calm hiring stories from teams that lead with proof.
          </h1>
          <p className="text-lg text-muted-foreground sm:max-w-3xl">
            Interviews, operational playbooks, and trust-first experiments from the Aureo network. Learn how high-signal teams keep candidates aligned without the noise.
          </p>
        </div>
      </section>

      {featured ? (
        <section className="grid gap-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Featured</Badge>
              <Badge variant="outline">{featured.category}</Badge>
              <span className="text-sm text-muted-foreground">{featured.readingTime}</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">{featured.title}</h2>
            <p className="text-sm text-muted-foreground">{featured.summary}</p>
            <Link
              href={`/stories/${featured.slug}`}
              className="inline-flex items-center font-semibold text-primary underline underline-offset-4"
            >
              Read the story
            </Link>
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-[var(--radius)] border border-border">
            <Image src={coverImage} alt={featured.title} fill className="object-cover" sizes="50vw" />
          </div>
        </section>
      ) : null}

      <StoryFilters stories={stories} categories={categories} />
    </div>
  );
}
