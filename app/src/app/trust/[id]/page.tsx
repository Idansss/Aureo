import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, Github, Link2, Award, Briefcase, ExternalLink, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { IconBadge } from "@/components/ui/icon-badge"
import { CopyLinkButton } from "@/components/copy-link-button"
import { supabaseServer } from "@/lib/supabase/server"
import { TrustPacketGenerator } from "@/lib/trust-packet"
import type { CandidateProfile } from "@/lib/types-extended"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function TrustPacketPage({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = await supabaseServer()

  const profileQuery = UUID_RE.test(id)
    ? supabase.from("profiles").select("id,email,full_name,username,headline,location,bio,avatar_url,cv_url,created_at,updated_at,skills").eq("id", id).maybeSingle()
    : supabase.from("profiles").select("id,email,full_name,username,headline,location,bio,avatar_url,cv_url,created_at,updated_at,skills").eq("username", id).maybeSingle()

  const { data: profile } = await profileQuery

  if (!profile?.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Container className="py-12 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="py-12 text-center">
              <IconBadge icon={ShieldCheck} size="lg" tone="neutral" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Trust packet not found</p>
            </CardContent>
          </Card>
        </Container>
        <Footer />
      </div>
    )
  }

  const { data: portfolioRows } = await supabase
    .from("portfolio_items")
    .select("id,title,description,link_url,media_url,created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const candidate: CandidateProfile = {
    id: profile.id,
    userId: profile.id,
    name: String(profile.full_name ?? profile.username ?? "Aureo User"),
    email: String(profile.email ?? ""),
    headline: profile.headline ?? undefined,
    bio: profile.bio ?? undefined,
    location: profile.location ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    resumeUrl: profile.cv_url ?? undefined,
    resumeVersion: 1,
    skills: Array.isArray((profile as any).skills) ? ((profile as any).skills as string[]) : [],
    experience: [],
    education: [],
    portfolio: (portfolioRows ?? []).map((row: any) => ({
      id: String(row.id),
      title: String(row.title ?? "Project"),
      description: String(row.description ?? ""),
      imageUrl: row.media_url ?? undefined,
      url: row.link_url ?? undefined,
      tags: [],
    })),
    proofCards: [],
    references: [],
    profileCompleteness: 0,
    trustScore: 0,
    verified: false,
    publicProfile: true,
    createdAt: String(profile.created_at ?? new Date().toISOString()),
    updatedAt: String(profile.updated_at ?? new Date().toISOString()),
  }

  const generated = TrustPacketGenerator.generate(candidate)
  const packet = { ...generated, id, shareableLink: `/trust/${id}` }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <Container className="py-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                      {packet.sections.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{packet.sections.profile.name}</CardTitle>
                      {packet.sections.profile.headline && (
                        <CardDescription className="text-base mt-1">
                          {packet.sections.profile.headline}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge
                      variant={packet.verificationLevel === "premium" ? "default" : "outline"}
                      className="capitalize"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" aria-hidden />
                      {packet.verificationLevel} Trust
                    </Badge>
                    <Badge variant="outline">Trust Score: {packet.trustScore}%</Badge>
                  </div>
                </div>
                <CopyLinkButton variant="outline" label="Share" />
              </div>
            </CardHeader>
          </Card>

          {/* Trust Signals */}
          <Card>
            <CardHeader>
              <CardTitle>Trust Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{packet.sections.trustSignals.portfolioItems}</p>
                  <p className="text-sm text-muted-foreground">Portfolio Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{packet.sections.trustSignals.verifiedLinks}</p>
                  <p className="text-sm text-muted-foreground">Verified Links</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{packet.sections.trustSignals.references}</p>
                  <p className="text-sm text-muted-foreground">References</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{packet.sections.trustSignals.experienceYears}</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {packet.sections.proof.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" aria-hidden />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {packet.sections.proof.portfolio.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                      {item.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <ExternalLink className="h-3 w-3" aria-hidden />
                            View Project
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(packet.sections.proof.github || packet.sections.proof.linkedin) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Verified Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {packet.sections.proof.github && (
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <a href={packet.sections.proof.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        GitHub Profile
                        <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />
                      </a>
                    </Button>
                  )}
                  {packet.sections.proof.linkedin && (
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <a href={packet.sections.proof.linkedin} target="_blank" rel="noopener noreferrer">
                        <Link2 className="h-4 w-4" />
                        LinkedIn Profile
                        <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {packet.sections.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packet.sections.experience.map((exp) => (
                    <div key={exp.id} className="pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-semibold">{exp.title}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(exp.startDate).toLocaleDateString()} -{" "}
                          {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {packet.sections.references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Professional References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packet.sections.references.map((ref) => (
                    <div key={ref.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{ref.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {ref.title} at {ref.company}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{ref.relationship}</p>
                        </div>
                        {ref.verified && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  )
}
