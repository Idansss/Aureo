"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/lib/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { listNotifications, markNotificationRead } from "@/app/app/saved/actions";
import { EmptyState } from "@/components/empty-state";

export default function AlertsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      body: string;
      createdAt: string;
      readAt: string | null;
      data: any;
    }>
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const res = await listNotifications();
      if (cancelled) return;
      if (!res.ok) {
        setNotifications([]);
        return;
      }
      setNotifications(
        (res.data ?? []).map((n: any) => ({
          id: String(n.id),
          title: String(n.title ?? ""),
          body: String(n.body ?? ""),
          createdAt: String(n.created_at ?? n.createdAt ?? new Date().toISOString()),
          readAt: (n.read_at ?? n.readAt ?? null) as string | null,
          data: (n.data ?? {}) as any,
        })),
      );
    })()
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const unread = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  return (
    <AuthGuard requiredRole="seeker">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="py-8 flex-1">
          <PageHeader
            title="Alerts"
            description="Updates about roles you care about"
            className="mb-6"
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="outline">{unread} unread</Badge>
                <Button asChild variant="outline">
                  <Link href="/jobs">Browse jobs</Link>
                </Button>
              </div>
            }
          />
          {loading ? (
            <Card>
              <CardContent className="p-8 text-sm text-muted-foreground">Loading…</CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <EmptyState
                  icon="Inbox"
                  title="No alerts yet"
                  description="Create a saved search or apply to jobs to start receiving updates."
                  action={{ label: "Browse Jobs", href: "/jobs" }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="w-full text-left rounded-[var(--radius)] border border-border bg-card p-4 hover:bg-muted transition-colors"
                  onClick={async () => {
                    if (!n.readAt) {
                      await markNotificationRead(n.id);
                      setNotifications((prev) =>
                        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
                      );
                    }
                    const jobId = n.data?.job_id ?? n.data?.jobId ?? null;
                    if (jobId) router.push(`/jobs/${jobId}`);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.readAt ? <Badge variant="accent">New</Badge> : <Badge variant="outline">Read</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Container>
        <Footer />
      </div>
    </AuthGuard>
  );
}
