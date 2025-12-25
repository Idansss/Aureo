import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrustBadge } from "@/components/trust-badge"
import { cn } from "@/lib/utils"

interface CompanyBadgeProps {
  name: string
  logo?: string
  verified?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CompanyBadge({ name, logo, verified = false, className, size = "md" }: CompanyBadgeProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={sizeClasses[size]}>
        {logo && <AvatarImage src={logo || "/placeholder.svg"} alt={name} />}
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5">
        <span className={cn("font-medium", size === "sm" && "text-sm")}>{name}</span>
        {verified && <TrustBadge size="sm" />}
      </div>
    </div>
  )
}
