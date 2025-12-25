"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProfileRecord } from "@/lib/types";
import { uploadAsset } from "./actions";
import { Button } from "@/components/ui/button";

export function AssetUploadForm({
  profile,
}: {
  profile: ProfileRecord | null;
}) {
  const avatarRef = useRef<HTMLFormElement>(null);
  const cvRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (form: HTMLFormElement | null, type: "avatar" | "cv") => {
    if (!form) return;
    const formData = new FormData(form);
    formData.set("type", type);
    startTransition(async () => {
      const result = await uploadAsset(formData);
      if (!result.ok) {
        toast.error(result.error ?? "Upload failed.");
        return;
      }
      toast.success("File uploaded.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Assets</h2>
        <p className="text-sm text-muted-foreground">
          Upload an avatar and CV. Files are stored securely in Supabase
          storage.
        </p>
      </div>

      <form
        ref={avatarRef}
        className="space-y-3 rounded-[var(--radius)] border border-border bg-secondary p-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(avatarRef.current, "avatar");
        }}
      >
        <p className="text-sm font-medium text-foreground">Avatar</p>
        <input type="file" name="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">
          Current: {profile?.avatar_url ? profile.avatar_url : "Not uploaded"}
        </p>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading..." : "Upload avatar"}
        </Button>
      </form>

      <form
        ref={cvRef}
        className="space-y-3 rounded-[var(--radius)] border border-border bg-secondary p-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(cvRef.current, "cv");
        }}
      >
        <p className="text-sm font-medium text-foreground">CV / Resume (PDF)</p>
        <input type="file" name="file" accept="application/pdf" />
        <p className="text-xs text-muted-foreground">
          Current: {profile?.cv_url ? profile.cv_url : "Not uploaded"}
        </p>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading..." : "Upload CV"}
        </Button>
      </form>
    </div>
  );
}
