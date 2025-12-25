"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

export type JobsFilterSidebarValue = {
  salaryRange: number[]
  selectedLocations: string[]
  selectedEmploymentTypes: string[]
  selectedWorkModes: string[]
  selectedCategories: string[]
  hideLowTrust: boolean
  minTrustScore: number[]
  minResponseRate: number[]
  maxResponseTime: number[]
}

interface FilterSidebarProps {
  mobile?: boolean
  value: JobsFilterSidebarValue
  onChange: (value: JobsFilterSidebarValue) => void
  onReset: () => void
}

function toDomId(prefix: string, value: string) {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
}

function toggleValue(list: string[], value: string, checked: boolean) {
  if (checked) {
    return list.includes(value) ? list : [...list, value]
  }
  return list.filter((item) => item !== value)
}

function FilterSection({
  title,
  value,
  children,
}: {
  title: string
  value?: string
  children: ReactNode
}) {
  return (
    <section className="relative isolate z-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-sm leading-none">{title}</h3>
        {value ? <span className="text-sm text-muted-foreground tabular-nums">{value}</span> : null}
      </div>
      {children}
    </section>
  )
}

function SliderField({ children }: { children: ReactNode }) {
  return <div className="relative z-0 mt-3 flex min-h-14 items-center pb-3">{children}</div>
}

function FilterSidebarContent({
  value,
  onChange,
  onReset,
}: {
  value: JobsFilterSidebarValue
  onChange: (value: JobsFilterSidebarValue) => void
  onReset: () => void
}) {
  const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Remote", "Seattle, WA"]
  const employmentTypes = ["Full-time", "Part-time", "Contract", "Freelance"]
  const workModes = ["Remote", "Hybrid", "On-site"]
  const categories = ["Engineering", "Design", "Product", "Marketing", "Sales", "Operations"]

  return (
    <div className="space-y-8 pb-12">
      <FilterSection title="Location">
        <div className="space-y-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center gap-2">
              <Checkbox
                id={toDomId("location", location)}
                checked={value.selectedLocations.includes(location)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    selectedLocations: toggleValue(value.selectedLocations, location, checked === true),
                  })
                }
              />
              <Label htmlFor={toDomId("location", location)} className="text-sm font-normal cursor-pointer">
                {location}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Employment Type">
        <div className="space-y-2">
          {employmentTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={toDomId("employment-type", type)}
                checked={value.selectedEmploymentTypes.includes(type)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    selectedEmploymentTypes: toggleValue(value.selectedEmploymentTypes, type, checked === true),
                  })
                }
              />
              <Label htmlFor={toDomId("employment-type", type)} className="text-sm font-normal cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Work Mode">
        <div className="space-y-2">
          {workModes.map((mode) => (
            <div key={mode} className="flex items-center gap-2">
              <Checkbox
                id={toDomId("work-mode", mode)}
                checked={value.selectedWorkModes.includes(mode)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    selectedWorkModes: toggleValue(value.selectedWorkModes, mode, checked === true),
                  })
                }
              />
              <Label htmlFor={toDomId("work-mode", mode)} className="text-sm font-normal cursor-pointer">
                {mode}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Min Salary" value={`$${value.salaryRange[0]}k+`}>
        <SliderField>
          <Slider
            value={value.salaryRange}
            onValueChange={(next) => onChange({ ...value, salaryRange: next })}
            max={200}
            step={10}
            className="w-full"
          />
        </SliderField>
      </FilterSection>

      <section className="relative isolate z-0 space-y-6">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-none">Trust Filters</h3>
          <p className="text-xs text-muted-foreground leading-snug">Filter by trust signals and employer quality</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="hide-low-trust" className="text-sm font-medium leading-none">
              Hide Low-Trust Posts
            </Label>
            <p className="text-xs text-muted-foreground leading-snug">Only show verified employers</p>
          </div>
          <Switch
            id="hide-low-trust"
            checked={value.hideLowTrust}
            onCheckedChange={(checked) => onChange({ ...value, hideLowTrust: checked })}
          />
        </div>

        <FilterSection title="Minimum Trust Score" value={`${value.minTrustScore[0]}%`}>
          <SliderField>
            <Slider
              value={value.minTrustScore}
              onValueChange={(next) => onChange({ ...value, minTrustScore: next })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </SliderField>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>0%</span>
            <span>100%</span>
          </div>
        </FilterSection>

        <FilterSection title="Minimum Response Rate" value={`${value.minResponseRate[0]}%`}>
          <SliderField>
            <Slider
              value={value.minResponseRate}
              onValueChange={(next) => onChange({ ...value, minResponseRate: next })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </SliderField>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>0%</span>
            <span>100%</span>
          </div>
        </FilterSection>

        <FilterSection title="Max Response Time" value={`${value.maxResponseTime[0]} days`}>
          <SliderField>
            <Slider
              value={value.maxResponseTime}
              onValueChange={(next) => onChange({ ...value, maxResponseTime: next })}
              min={1}
              max={14}
              step={1}
              className="w-full"
            />
          </SliderField>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>1 day</span>
            <span>14 days</span>
          </div>
        </FilterSection>
      </section>

      <FilterSection title="Category">
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={toDomId("category", category)}
                checked={value.selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  onChange({
                    ...value,
                    selectedCategories: toggleValue(value.selectedCategories, category, checked === true),
                  })
                }
              />
              <Label htmlFor={toDomId("category", category)} className="text-sm font-normal cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <Button type="button" variant="outline" className="w-full" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  )
}

export function FilterSidebar({ mobile = false, value, onChange, onReset }: FilterSidebarProps) {
  if (mobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="space-y-6">
            <SheetHeader className="sticky top-0 z-10 -mx-6 -mt-8 border-b border-border/60 bg-card px-6 pb-4 pt-8">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterSidebarContent value={value} onChange={onChange} onReset={onReset} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <FilterSidebarContent value={value} onChange={onChange} onReset={onReset} />
      </CardContent>
    </Card>
  )
}
