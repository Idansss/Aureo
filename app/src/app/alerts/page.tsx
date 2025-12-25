"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/container";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/lib/auth-guard";

export default function AlertsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new saved jobs page with alerts tab
    router.replace("/app/saved?tab=alerts");
  }, [router]);

  return (
    <AuthGuard requiredRole="seeker">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="py-8 flex-1">
          <PageHeader
            title="Alerts"
            description="Redirecting to saved jobs..."
          />
        </Container>
        <Footer />
      </div>
    </AuthGuard>
  );
}
