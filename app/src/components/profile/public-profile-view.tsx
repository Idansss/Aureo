"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CopyLinkButton } from "@/components/copy-link-button"
import { TrustBadge } from "@/components/trust/trust-badge"
import { useSettings } from "@/components/settings/settings-provider"
import { routes } from "@/lib/routes"

export type PublicProfileModel = {
  fullName: string
  username: string
  headline: string
  bio: string
  location?: string | null
  avatarUrl?: string | null
  skills?: string[]
}

function ProfileAvatar({ profile }: { profile: PublicProfileModel }) {
  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("")

  return profile.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatarUrl}
      alt={`${profile.fullName} avatar`}
      className="h-16 w-16 rounded-full border border-border object-cover shadow-sm"
    />
  ) : (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted text-lg font-semibold text-foreground">
      {initials || "AU"}
    </div>
  )
}

export function PublicProfileView({
  username,
  profile,
}: {
  username: string
  profile: PublicProfileModel
}) {
  const { settings } = useSettings()
  const isOwner = username === settings.account.username

  return (
    <div className="space-y-8 pb-16">
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <ProfileAvatar profile={profile} />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">{profile.fullName}</h1>
                <Badge variant="accent">Aureo profile</Badge>
                {isOwner ? <Badge variant="outline">You</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <p className="text-base font-medium text-foreground">{profile.headline}</p>
              {profile.location ? <p className="text-sm text-muted-foreground">{profile.location}</p> : null}

              <div className="flex flex-wrap gap-2">
                <TrustBadge verified trustScore={84} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <CopyLinkButton label="Share profile" variant="outline" />
            {isOwner ? (
              <Button asChild className="gap-2">
                <Link href={routes.app.profile}>Edit profile</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
      </Card>

      {profile.skills?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="subtle">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}



