"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/lib/auth-guard"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function NewSavedSearchPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <NewSavedSearchPageContent />
    </AuthGuard>
  )
}

function NewSavedSearchPageContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    query: "",
    location: "",
    remote: false,
    type: "",
    salaryMin: "",
    salaryMax: "",
    seniority: "",
    frequency: "daily" as "daily" | "weekdays" | "instant",
    time: "10:00",
    inbox: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      toast.error("Please log in")
      router.push("/auth/login")
      return
    }

    const now = new Date().toISOString()

    const payload = {
      user_id: auth.user.id,
      name: formData.name || "Untitled Search",
      query: formData.query || "",
      filters: {
        location: formData.location || undefined,
        remote: formData.remote || undefined,
        type: formData.type || undefined,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        seniority: formData.seniority || undefined,
      },
      schedule: {
        frequency: formData.frequency,
        time: formData.frequency !== "instant" ? formData.time : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      delivery: {
        inbox: true,
        email: false,
      },
      active: true,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from("saved_searches")
      .insert(payload as any)
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to create saved search:", error)
      toast.error("Could not save search")
      return
    }

    toast.success("Search saved successfully")
    router.push(`/app/saved-searches/${data.id}`)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <Button variant="ghost" className="mb-4 gap-2" asChild>
          <Link href="/app/saved-searches">
            <ArrowLeft className="h-4 w-4" />
            Back to Searches
          </Link>
        </Button>

        <PageHeader
          title="Create Saved Search"
          description="Set up automated job alerts based on your preferences"
          className="mb-8"
        />

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Details</CardTitle>
                <CardDescription>Basic information about your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Search Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Remote React Jobs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="query">Keywords</Label>
                  <Input
                    id="query"
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="e.g., React, TypeScript, Frontend"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Narrow down your search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., San Francisco, Remote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Employment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Min Salary (USD)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="e.g., 80000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max Salary (USD)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="e.g., 150000"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote"
                    checked={formData.remote}
                    onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                  />
                  <Label htmlFor="remote">Remote only</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When should we run this search?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: "daily" | "weekdays" | "instant") =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekdays">Weekdays Only</SelectItem>
                      <SelectItem value="instant">Instant (as jobs are posted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.frequency !== "instant" && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
                <CardDescription>Where should we send your digests?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inbox">In-app Inbox</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive digests in your Aureo inbox
                    </p>
                  </div>
                  <Switch
                    id="inbox"
                    checked={formData.inbox}
                    onCheckedChange={(checked) => setFormData({ ...formData, inbox: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Create Search
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/saved-searches">Cancel</Link>
              </Button>
            </div>
          </div>
        </form>
      </Container>

      <Footer />
    </div>
  )
}



