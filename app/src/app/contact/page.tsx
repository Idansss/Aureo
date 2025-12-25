import Link from "next/link"
import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-10 flex-1">
        <PageHeader
          title="Contact"
          description="Questions, feedback, or partnership inquiries."
          className="mb-8"
        />

        <Card>
          <CardContent className="py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Contact is currently handled via email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="mailto:hello@aureo.example" rel="noreferrer">
                  Email Us
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  )
}
