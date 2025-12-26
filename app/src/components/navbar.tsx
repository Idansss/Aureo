"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { Briefcase, Menu, LogOut, User, Bell, Settings } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth, signOut } from "@/lib/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSettings } from "@/components/settings/settings-provider"
import { isDemoMode } from "@/lib/demo-mode"
import { Badge } from "@/components/ui/badge"
import { getActiveSeekerId, useStoreSnapshot } from "@/lib/store"
import { routes } from "@/lib/routes"

export function Navbar() {
  const router = useRouter()
  const { isAuthenticated, user, ready } = useAuth()
  const { settings } = useSettings()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const demo = isDemoMode()
  const snap = useStoreSnapshot()
  const isReadyAndAuthed = ready && isAuthenticated && Boolean(user)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !user) return
    // Avatar is stored on the profile row (avatar_url). Settings provider is responsible for syncing.
    setAvatarUrl(null)
  }, [user])

  const handleLogout = () => {
    signOut().finally(() => router.push("/"))
  }

  const isLoggedIn = ready && isAuthenticated

  const showSeekerNav = useMemo(() => {
    if (isLoggedIn && user) return user.role !== "employer"
    return demo
  }, [demo, isLoggedIn, user])

  const unreadAlerts = useMemo(() => {
    if (!demo || !mounted) return 0
    const seekerId = getActiveSeekerId()
    return (snap?.alerts ?? []).filter((a) => a.seekerId === seekerId && !a.readAt).length
  }, [demo, mounted, snap?.alerts])

  const dashboardHref = useMemo(() => {
    if (user?.role === "employer") return routes.employer.dashboard
    return routes.app.dashboard
  }, [user?.role])

  const profileHref = useMemo(() => {
    if (user?.role === "employer") return routes.employer.dashboard
    return routes.app.profile
  }, [user?.role])
  
  // Use username from settings, or fallback to user.name
  const displayName = useMemo(() => {
    return settings.account.username || user?.fullName || user?.email || "User"
  }, [settings.account.username, user?.fullName, user?.email])
  
  // Use fullName from settings for initials
  const userInitials = useMemo(() => {
    const nameForInitials = settings.account.fullName || user?.fullName
    if (!nameForInitials) return "AU"
    return nameForInitials
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [settings.account.fullName, user?.fullName])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex items-center gap-2 font-semibold text-xl hover:opacity-80 transition-opacity cursor-pointer"
          >
            <IconBadge icon={Briefcase} tone="gold" size="sm" label="Aureo" />
            Aureo
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
              Find Jobs
            </Link>
            {isLoggedIn && user ? (
              user.role === "employer" ? (
                <Link href="/employer" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/app" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/alerts" className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-2">
                    Alerts
                    {demo && unreadAlerts ? <Badge variant="accent">{unreadAlerts}</Badge> : null}
                  </Link>
                  <Link href="/app/saved" className="text-sm font-medium hover:text-primary transition-colors">
                    Saved Jobs
                  </Link>
                  <Link href="/app/saved-searches" className="text-sm font-medium hover:text-primary transition-colors">
                    Saved Searches
                  </Link>
                  <Link href="/app/inbox" className="text-sm font-medium hover:text-primary transition-colors">
                    Inbox
                  </Link>
                </>
              )
            ) : (
              <>
                {showSeekerNav ? (
                  <Link href="/alerts" className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-2">
                    Alerts
                    {demo && unreadAlerts ? <Badge variant="accent">{unreadAlerts}</Badge> : null}
                  </Link>
                ) : (
                  <Link href="/employer" className="text-sm font-medium hover:text-primary transition-colors">
                    For Employers
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isReadyAndAuthed ? (
              <>
                <Button variant="ghost" className="relative h-10 w-10 p-0" asChild>
                  <Link
                    href="/alerts"
                    aria-label="View alerts"
                    className="flex h-full w-full items-center justify-center"
                  >
                    <Bell className="h-5 w-5" />
                    {demo && unreadAlerts ? (
                      <Badge
                        variant="accent"
                        className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                      >
                        {unreadAlerts}
                      </Badge>
                    ) : null}
                  </Link>
                </Button>
                <Link
                  href={dashboardHref}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email ?? "No email"}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        {user?.role === "employer" ? "Employer" : "Seeker"}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={profileHref ?? "/"} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={routes.settings.root} className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : ready ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Button variant="primary" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="h-8 w-24 animate-pulse rounded-full bg-muted/30" aria-hidden />
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <SheetClose asChild>
                  <Link href="/jobs" className="text-lg font-medium hover:text-primary transition-colors">
                    Find Jobs
                  </Link>
                </SheetClose>
                {isReadyAndAuthed ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href={dashboardHref}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/alerts" className="text-lg font-medium hover:text-primary transition-colors">
                        Alerts{demo && unreadAlerts ? ` (${unreadAlerts})` : ""}
                      </Link>
                    </SheetClose>
                    {user?.role !== "employer" ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/app/saved"
                            className="text-lg font-medium hover:text-primary transition-colors"
                          >
                            Saved Jobs
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/app/saved-searches"
                            className="text-lg font-medium hover:text-primary transition-colors"
                          >
                            Saved Searches
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/app/inbox" className="text-lg font-medium hover:text-primary transition-colors">
                            Inbox
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/app/tracker" className="text-lg font-medium hover:text-primary transition-colors">
                            Job Tracker
                          </Link>
                        </SheetClose>
                      </>
                    ) : null}
                    <SheetClose asChild>
                      <Link
                        href={profileHref ?? "/"}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href={routes.settings.root}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Settings
                      </Link>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    {showSeekerNav ? (
                      <SheetClose asChild>
                        <Link href="/alerts" className="text-lg font-medium hover:text-primary transition-colors">
                          Alerts{demo && unreadAlerts ? ` (${unreadAlerts})` : ""}
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/employer" className="text-lg font-medium hover:text-primary transition-colors">
                          For Employers
                        </Link>
                      </SheetClose>
                    )}
                  </>
                )}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isReadyAndAuthed ? (
                    <>
                      <div className="px-2 py-2 text-sm">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-muted-foreground text-xs">{user?.email ?? ""}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {user?.role === "employer" ? "Employer" : "Seeker"}
                        </Badge>
                      </div>
                      <ThemeToggle className="w-full" />
                      <SheetClose asChild>
                        <Button type="button" variant="outline" onClick={handleLogout} className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : ready ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/auth/login"
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          Sign In
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="primary" asChild>
                          <Link href="/auth/register">Get Started</Link>
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <div className="h-10 w-full animate-pulse rounded bg-muted/30" aria-hidden />
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </nav>
  )
}
