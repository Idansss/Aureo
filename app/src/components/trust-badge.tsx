import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustBadgeProps {
  verified?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TrustBadge({ verified = false, size = "md", className }: TrustBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  if (!verified) return null

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <ShieldCheck className={cn(sizeClasses[size], "text-primary")} />
      <span className="text-xs font-medium text-primary">Verified</span>
    </div>
  )
}



