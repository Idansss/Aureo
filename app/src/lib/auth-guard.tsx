"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "seeker" | "employer"
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<"seeker" | "employer" | null>(null)

  useEffect(() => {
    setMounted(true)

    const supabase = supabaseBrowser()

    const sync = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session?.user) {
        setUserId(null)
        setRole(null)
        router.push(redirectTo || "/auth/login")
        return
      }

      setUserId(session.user.id)

      const metadataRole = session.user.user_metadata?.role as "seeker" | "employer" | undefined
      let resolvedRole: "seeker" | "employer" | null = metadataRole ?? null

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()

      if (profile?.role) resolvedRole = profile.role as any
      setRole(resolvedRole)

      if (requiredRole && resolvedRole && resolvedRole !== requiredRole) {
        router.push(resolvedRole === "employer" ? "/employer" : "/app")
      }
    }

    sync()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      sync()
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router, requiredRole, redirectTo])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    )
  }

  if (requiredRole && role && role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    )
  }

  return <>{children}</>
}
