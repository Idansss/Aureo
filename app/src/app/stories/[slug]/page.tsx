import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedStories } from "@/components/stories/related-stories";
import { StoryLayout } from "@/components/stories/story-layout";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { findStoryBySlug, stories, type StorySection } from "@/lib/stories";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

function slugifyHeading(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildToc(sections: StorySection[]) {
  return sections
    .filter((section) => section.heading)
    .map((section) => ({
      id: slugifyHeading(section.heading!),
      label: section.heading!,
    }));
}

function renderSections(sections: StorySection[]) {
  return sections.map((section, index) => (
    <div key={index} className="space-y-4">
      {section.heading && (
        <h2 id={slugifyHeading(section.heading)} className="text-2xl font-semibold text-foreground">
          {section.heading}
        </h2>
      )}
      {section.paragraphs?.map((paragraph, idx) => (
        <p key={idx} className="text-foreground">
          {paragraph}
        </p>
      ))}
      {section.list && (
        <ul className="list-disc pl-5 text-foreground">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.quote && (
        <blockquote className="space-y-2 border-l-4 border-primary/60 pl-4 italic text-foreground">
          <p>“{section.quote.text}”</p>
          {section.quote.author ? (
            <footer className="text-sm text-muted-foreground">Author: {section.quote.author}</footer>
          ) : null}
        </blockquote>
      )}
    </div>
  ));
}

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = findStoryBySlug(slug);

  if (!story) {
    return { title: "Story not found, Aureo" };
  }

  return {
    title: `${story.title}, Aureo Stories`,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      images: [story.coverImage],
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = findStoryBySlug(slug);
  if (!story) notFound();

  const toc = buildToc(story.sections);
  const related = stories
    .filter((item) => item.slug !== story.slug && item.category === story.category)
    .slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Stories", href: "/stories" },
          { label: story.title },
        ]}
      />
      <StoryLayout story={story} tableOfContents={toc}>
        {renderSections(story.sections)}
      </StoryLayout>
      <RelatedStories stories={related} />
    </div>
  );
}
