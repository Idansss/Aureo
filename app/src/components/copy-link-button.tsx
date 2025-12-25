"use client";

import type { LucideIcon } from "lucide-react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({
  label = "Copy link",
  variant = "ghost",
  icon: Icon = Link2,
  preferShare = true,
  shareTitle,
  shareText,
}: {
  label?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  icon?: LucideIcon;
  preferShare?: boolean;
  shareTitle?: string;
  shareText?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (!url) return;

        try {
          if (preferShare && "share" in navigator) {
            await (navigator as Navigator & { share: (data: { title?: string; text?: string; url: string }) => Promise<void> }).share({ title: shareTitle, text: shareText, url });
            toast.success("Share opened.");
            return;
          }
        } catch (error) {
          if (typeof error === "object" && error && "name" in error && error.name === "AbortError") {
            return;
          }
        }

        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied.");
        } catch {
          toast.error("Could not copy link.");
        }
      }}
    >
      <Icon className="mr-2 h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
