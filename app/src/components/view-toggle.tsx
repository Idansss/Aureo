"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewToggleProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-2", view === "grid" && "bg-background")}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-2", view === "list" && "bg-background")}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
        List
      </Button>
    </div>
  )
}



