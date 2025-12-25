"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function TagsInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");

  const add = React.useCallback(
    (raw: string) => {
      const nextTag = normalize(raw);
      if (!nextTag) return;
      if (value.some((t) => t.toLowerCase() === nextTag.toLowerCase())) return;
      onChange([...value, nextTag]);
      setDraft("");
    },
    [onChange, value],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {value.length ? (
          value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </span>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder ?? "Add a tag"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(draft);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => add(draft)}
          className="shrink-0"
        >
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter to add tags.
      </p>
    </div>
  );
}

