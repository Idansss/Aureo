import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/stories";
import { CopyLinkButton } from "@/components/copy-link-button";

interface StoryLayoutProps {
  story: Story;
  tableOfContents: { id: string; label: string }[];
  children: React.ReactNode;
}

export function StoryLayout({ story, tableOfContents, children }: StoryLayoutProps) {
  const coverImage =
    story.coverImage && story.coverImage.startsWith("http")
      ? story.coverImage
      : "/images/story-placeholder.svg";

  const publishedDate = new Date(story.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            {story.category}
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton label="Share" variant="outline" />
            <Link
              href="/stories"
              className="inline-flex h-11 items-center rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back to stories
            </Link>
          </div>
        </div>

        <h1 className="text-4xl font-semibold leading-tight text-foreground">
          {story.title}
        </h1>
        <p className="text-lg text-muted-foreground">{story.summary}</p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{story.author.name}</span>
          <span>{story.author.role}</span>
          <span>{publishedDate}</span>
          <span>{story.readingTime}</span>
        </div>
      </header>

      <div className="relative h-80 w-full overflow-hidden rounded-[var(--radius)] border border-border">
        <Image
          src={coverImage}
          alt={story.title}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <aside className="rounded-[var(--radius)] border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Table of contents</p>
          <nav className="mt-3 space-y-2 text-sm">
            {tableOfContents.length === 0 ? (
              <p className="text-muted-foreground">Sections will appear here.</p>
            ) : null}
            {tableOfContents.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-[var(--radius)] px-2 py-1 text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="prose prose-neutral max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          {children}
        </div>
      </div>
    </article>
  );
}

