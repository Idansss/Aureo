import { Container } from "@/components/container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-10 flex-1">
        <PageHeader
          title="About Aureo"
          description="Trust-first hiring, built around proof, clarity, and calm speed."
          className="mb-8"
        />

        <Card>
          <CardContent className="py-8 space-y-4 text-sm text-muted-foreground">
            <p>
              Aureo helps job seekers and employers move faster with better signals: transparent processes, verified
              details, and simple workflows that reduce ghosting and wasted time.
            </p>
            <p>
              Save jobs, apply, report suspicious postings, and manage your profile — everything is backed by the real
              database so your changes persist across refresh.
            </p>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  )
}
