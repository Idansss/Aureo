import Image from "next/image";
import type { Story } from "@/lib/stories";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const coverImage =
    story.coverImage && story.coverImage.startsWith("http")
      ? story.coverImage
      : "/images/story-placeholder.svg";

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <article className="flex h-full flex-col rounded-[var(--radius)] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="relative h-48 w-full overflow-hidden rounded-t-[var(--radius)]">
          <Image
            src={coverImage}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <Badge variant="subtle" className="w-fit">
            {story.category}
          </Badge>
          <h3 className="text-lg font-semibold text-foreground">{story.title}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{story.summary}</p>
          <div className="mt-auto text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{story.author.name}</p>
            <p>{story.author.role}</p>
            <p className="mt-1">
              {new Date(story.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              , {story.readingTime}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
