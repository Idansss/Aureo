"use client"

import { Bookmark, Briefcase, ExternalLink, Inbox, Search, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconBadge } from "@/components/ui/icon-badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const ICONS = {
  SearchX,
  Search,
  ExternalLink,
  Bookmark,
  Inbox,
  Briefcase,
} as const

export type EmptyStateIconName = keyof typeof ICONS

interface EmptyStateProps {
  icon?: EmptyStateIconName
  title: string
  description: string
  action?: {
    label: string
    href?: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const ResolvedIcon = Icon ? ICONS[Icon] : null
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {ResolvedIcon && (
        <IconBadge icon={ResolvedIcon} size="lg" tone="neutral" className="mb-4" />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button
          asChild={!!action.href}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {action.href ? (
            action.href.startsWith("/") ? (
              <Link href={action.href}>{action.label}</Link>
            ) : (
              <a href={action.href} target="_blank" rel="noreferrer">
                {action.label}
              </a>
            )
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
