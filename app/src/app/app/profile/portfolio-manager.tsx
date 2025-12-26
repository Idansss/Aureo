"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { addPortfolioItem, deletePortfolioItem } from "./actions";

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  link_url: string;
}

const schema = z.object({
  title: z.string().min(2, "Title is too short."),
  link_url: z.string().url("Enter a valid URL."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PortfolioManager({ items }: { items: PortfolioItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      link_url: "",
      description: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await addPortfolioItem(values);
      if (!result.ok) {
        toast.error(result.error ?? "Unable to add portfolio item.");
        return;
      }
      toast.success("Portfolio item added.");
      form.reset();
      router.refresh();
    });
  };

  return (
    <section className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-sm text-muted-foreground">
            Add work samples, case studies, or public links employers can verify.
          </p>
        </div>
        <Badge variant="subtle" className="w-fit">
          {items.length} items
        </Badge>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 rounded-[var(--radius)] border border-border bg-secondary p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input placeholder="e.g. Hiring OS case study" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Link</label>
          <Input placeholder="https://..." {...form.register("link_url")} />
          {form.formState.errors.link_url && (
            <p className="text-xs text-destructive">
              {form.formState.errors.link_url.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Description (optional)
          </label>
          <Textarea
            rows={3}
            placeholder="What was your role and impact?"
            {...form.register("description")}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <Button type="submit" disabled={pending} className="gap-2">
            <Plus className="h-4 w-4" />
            {pending ? "Adding..." : "Add item"}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No portfolio items yet"
          description="Add a case study or public work sample. Links should be accessible without login."
          icon="ExternalLink"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Visit link
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    startTransition(async () => {
                      const result = await deletePortfolioItem(item.id);
                      if (!result.ok) {
                        toast.error(result.error ?? "Unable to delete item.");
                        return;
                      }
                      toast.success("Portfolio item removed.");
                      router.refresh();
                    });
                  }}
                  disabled={pending}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {item.description ? (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add a short description to help reviewers understand context.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
