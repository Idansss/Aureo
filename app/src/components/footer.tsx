import Link from "next/link"
import { Container } from "@/components/container"
import { Briefcase } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <IconBadge icon={Briefcase} tone="gold" size="sm" label="Aureo" />
              Aureo
            </Link>
            <p className="text-sm text-muted-foreground">
              Trust-first hiring platform built around trust, proof, and speed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Build Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/employer/jobs/new" className="text-muted-foreground hover:text-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Manage Pipeline
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/trust" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Aureo. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}



