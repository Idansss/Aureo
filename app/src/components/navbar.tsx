"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { Briefcase, Menu, LogOut, User } from "lucide-react"
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

export function Navbar() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { settings } = useSettings()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !user) return
    // Avatar is stored on the profile row (avatar_url). Settings provider is responsible for syncing.
    setAvatarUrl(null)
  }, [user])

  const handleLogout = () => {
    signOut().finally(() => router.push("/"))
  }

  const isLoggedIn = isAuthenticated

  const dashboardHref = useMemo(() => {
    if (!isLoggedIn || !user) return null
    return user.role === "employer" ? "/dashboard/employer" : "/app"
  }, [isLoggedIn, user])

  const profileHref = useMemo(() => {
    if (!isLoggedIn || !user) return null
    return user.role === "employer" ? "/dashboard/employer" : "/app/profile"
  }, [isLoggedIn, user])
  
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
                <Link href="/dashboard/employer" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/app" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
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
              <Link href="/dashboard/employer" className="text-sm font-medium hover:text-primary transition-colors">
                For Employers
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === "employer" ? (
                    <DropdownMenuItem asChild>
                      <Link 
                        href={profileHref ?? "/"} 
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link 
                          href={profileHref ?? "/"} 
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/app/tracker" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Job Tracker
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <ThemeToggle className="w-full" />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Button variant="primary" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
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
                {isLoggedIn && user ? (
                  user.role === "employer" ? (
                    <SheetClose asChild>
                      <Link href="/dashboard/employer" className="text-lg font-medium hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/app" className="text-lg font-medium hover:text-primary transition-colors">
                          Dashboard
                        </Link>
                      </SheetClose>
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
                  )
                ) : (
                  <SheetClose asChild>
                    <Link href="/dashboard/employer" className="text-lg font-medium hover:text-primary transition-colors">
                      For Employers
                    </Link>
                  </SheetClose>
                )}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isLoggedIn && user ? (
                    <>
                      <div className="px-2 py-2 text-sm">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-muted-foreground text-xs">{user.email}</p>
                      </div>
                      <div className="px-2 py-2">
                        <ThemeToggle className="w-full" />
                      </div>
                      <SheetClose asChild>
                        <Button type="button" variant="outline" onClick={handleLogout} className="w-full">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
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
                          <Link href="/signup">Get Started</Link>
                        </Button>
                      </SheetClose>
                    </>
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
