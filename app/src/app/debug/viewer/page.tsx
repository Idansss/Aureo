import { getViewer } from "@/lib/viewer";
import { Container } from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ViewerDebugPage() {
  const viewer = await getViewer();

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Card>
          <CardHeader>
            <CardTitle>Viewer Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Authentication Status</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={viewer.isAuthenticated ? "default" : "outline"}>
                  {viewer.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
                <Badge variant="outline">
                  {viewer.canLogout ? "Can Logout" : "Cannot Logout"}
                </Badge>
              </div>
            </div>

            {viewer.user ? (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">User Info</p>
                <div className="mt-2 space-y-1 font-mono text-sm">
                  <p>ID: {viewer.user.id}</p>
                  <p>Email: {viewer.user.email ?? "No email"}</p>
                  <p>Full Name: {viewer.user.fullName ?? "No name"}</p>
                  <p>Role: {viewer.user.role ?? "No role"}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">No user session</p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-muted-foreground">Raw Data</p>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                {JSON.stringify(viewer, null, 2)}
              </pre>
            </div>

            <div className="mt-4 rounded border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Tip: Client components can use the <code className="rounded bg-background px-1 py-0.5 text-xs">useViewer()</code> hook or fetch <code className="rounded bg-background px-1 py-0.5 text-xs">/api/viewer</code> to get the same data.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

