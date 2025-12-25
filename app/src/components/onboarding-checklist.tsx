"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/use-auth"
import { supabaseBrowser } from "@/lib/supabase/client"

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  action: string
  href: string
}

export function OnboardingChecklist() {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      title: "Complete your profile",
      description: "Add your work experience and skills",
      completed: false,
      action: "View Profile",
      href: "/app/profile",
    },
    {
      id: "2",
      title: "Upload your resume",
      description: "Add a PDF of your latest resume",
      completed: false,
      action: "Upload Resume",
      href: "/app/profile",
    },
    {
      id: "3",
      title: "Add portfolio items",
      description: "Showcase your best work",
      completed: false,
      action: "Add Portfolio",
      href: "/app/profile",
    },
    {
      id: "4",
      title: "Apply to your first job",
      description: "Browse open positions and apply",
      completed: false,
      action: "Browse Jobs",
      href: "/jobs",
    },
  ])

  useEffect(() => {
    if (!user?.id) return
    const supabase = supabaseBrowser()

    ;(async () => {
      const [{ data: profile }, { count: portfolioCount }, { count: applicationCount }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, headline, location, cv_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("portfolio_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ])

      const profileDone = Boolean(profile?.full_name && profile?.headline && profile?.location)
      const resumeDone = Boolean(profile?.cv_url)
      const portfolioDone = Boolean((portfolioCount ?? 0) > 0)
      const appliedDone = Boolean((applicationCount ?? 0) > 0)

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === "1") return { ...item, completed: profileDone }
          if (item.id === "2") return { ...item, completed: resumeDone }
          if (item.id === "3") return { ...item, completed: portfolioDone }
          if (item.id === "4") return { ...item, completed: appliedDone }
          return item
        }),
      )
    })()
  }, [user?.id])

  const completedCount = items.filter((item) => item.completed).length
  const progress = (completedCount / items.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>
          {completedCount} of {items.length} completed
        </CardDescription>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors",
              item.completed ? "bg-muted/50" : "bg-muted",
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <p className={cn("font-medium text-sm", item.completed && "text-muted-foreground")}>{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {!item.completed && (
              <Button size="sm" variant="primary" asChild>
                <Link href={item.href}>{item.action}</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
