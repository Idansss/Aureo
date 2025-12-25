"use client";

import * as React from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { listCompanyReviews, upsertCompanyReview } from "@/app/employers/[slug]/review-actions";

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const v = idx + 1;
        return (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v)}
            className={cn(
              "rounded p-1 transition",
              disabled ? "cursor-not-allowed opacity-60" : "hover:bg-muted",
            )}
            aria-label={`Rate ${v} star${v === 1 ? "" : "s"}`}
          >
            <Star className={cn("h-4 w-4", v <= value ? "fill-primary text-primary" : "text-muted-foreground")} />
          </button>
        );
      })}
    </div>
  );
}

export function CompanyReviews({ companyId }: { companyId: string }) {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  const refresh = React.useCallback(async () => {
    const res = await listCompanyReviews(companyId);
    if (res.ok) setReviews(res.data);
  }, [companyId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Reviews</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience with this employer. Reviews are public.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="space-y-4 rounded-[var(--radius)] border border-border bg-secondary p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            upsertCompanyReview({ companyId, rating, title: title.trim() || undefined, body: body.trim() })
              .then((res) => {
                if (!res.ok) {
                  toast.error(res.error || "Could not submit review.");
                  return;
                }
                toast.success("Review submitted.");
                setTitle("");
                setBody("");
                refresh();
              })
              .finally(() => setLoading(false));
          }}
        >
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              disabled={loading}
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-body">Review</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What was the process like? Was feedback clear? Did they respond?"
              disabled={loading}
              rows={4}
            />
          </div>
          <Button type="submit" disabled={loading || body.trim().length < 10}>
            {loading ? "Submitting..." : "Submit review"}
          </Button>
        </form>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-[var(--radius)] border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{r.title || "Review"}</p>
                    <p className="text-xs text-muted-foreground">
                      {(r.profiles?.full_name || r.profiles?.username || "Anonymous")} •{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                    <span className="font-semibold text-foreground">{r.rating}</span>
                    <span>/5</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


