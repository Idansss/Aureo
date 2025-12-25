import Link from "next/link"
import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TrustPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-10 flex-1">
        <PageHeader
          title="Trust & Safety"
          description="Aureo is designed to reduce scams and ghosting with clearer signals and transparent workflows."
          className="mb-8"
        />

        <Card>
          <CardContent className="py-8 space-y-4 text-sm text-muted-foreground">
            <p>
              Aureo is built to reduce scams and ghosting with clear trust signals: employer verification, response-rate
              transparency, and simple reporting.
            </p>
            <p>
              Browse jobs to see trust context on each posting, then save roles, apply, and track outcomes as you go.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">About Aureo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  )
}
