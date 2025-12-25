"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Timeline } from "@/components/timeline";
import type { ApplicationRecord } from "@/lib/types";

interface TimelineDrawerProps {
  application: ApplicationRecord;
  events: { title: string; description?: string; timestamp?: string }[];
}

export function ApplicationDrawer({ application, events }: TimelineDrawerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          View timeline
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{application.jobs?.title}</SheetTitle>
          <SheetDescription>{application.jobs?.companies?.name}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Timeline
            items={events.map((event) => ({
              title: event.title,
              description: event.description,
              timestamp: event.timestamp,
            }))}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
