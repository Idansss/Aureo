"use client"

import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProfileEditor } from "@/components/profile/profile-editor"
import { AuthGuard } from "@/lib/auth-guard"

export default function ProfilePage() {
  return (
    <AuthGuard requiredRole="seeker">
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <Container className="py-8 flex-1">
          <PageHeader
            title="Profile & Portfolio"
            description="Keep your public profile up-to-date and showcase your proof of work."
            className="mb-8"
          />
          <ProfileEditor />
        </Container>

        <Footer />
      </div>
    </AuthGuard>
  )
}
