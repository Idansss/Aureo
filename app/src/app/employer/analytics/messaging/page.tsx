import Link from "next/link";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

export default function EmployerMessagingAnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-10 flex-1">
        <PageHeader
          title="Messaging analytics"
          description="Track response speed and conversation volume across your roles."
          className="mb-8"
        />

        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <IconBadge icon={MessageSquare} size="lg" tone="neutral" className="mx-auto" />
            <p className="text-sm text-muted-foreground">
              No messaging activity yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild>
                <Link href="/dashboard/employer/jobs">View jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/employers">Browse employers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}



