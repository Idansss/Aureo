import { redirect } from "next/navigation"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"
import { ProfileDetailsForm } from "./profile-form"
import { AssetUploadForm } from "./upload-form"
import { PortfolioManager } from "./portfolio-manager"
export default async function ProfilePage() {
  const user = await getServerUser()
  if (!user) redirect("/auth/login")

  const supabase = await supabaseServer()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username, headline, location, bio, avatar_url, cv_url")
    .eq("id", user.id)
    .maybeSingle()

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("id, title, description, link_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Profile & Portfolio"
          description="Keep your public profile up-to-date and showcase your proof of work."
          className="mb-8"
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <ProfileDetailsForm profile={profile as any} />
            <PortfolioManager items={(items as any) ?? []} />
          </div>
          <div className="space-y-6">
            <AssetUploadForm profile={profile as any} />
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}



