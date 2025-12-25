import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({
  action = "/jobs",
  defaultQuery,
  defaultLocation,
  defaultRemote,
  submitLabel = "Explore jobs",
  className,
}: {
  action?: string;
  defaultQuery?: string;
  defaultLocation?: string;
  defaultRemote?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      method="get"
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="hero-q" className="sr-only">
            Role or keyword
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="hero-q"
              name="q"
              defaultValue={defaultQuery}
              placeholder="Role or keyword (e.g. Product designer)"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="hero-location" className="sr-only">
            Location or remote
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="hero-location"
              name="location"
              defaultValue={defaultLocation}
              placeholder="Location or timezone"
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="remote"
            value="true"
            defaultChecked={defaultRemote}
            className="h-4 w-4 rounded border border-input bg-background accent-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          Remote only
        </label>
        <p className="text-xs text-muted-foreground">
          Tip: Add company names, timezones, or seniority.
        </p>
      </div>
    </form>
  );
}

