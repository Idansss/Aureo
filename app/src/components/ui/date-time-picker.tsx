"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  label?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  min,
  disabled,
  required,
  id,
  label,
  className,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Initialize state from value prop
  const getInitialDate = () => {
    if (value) {
      try {
        return new Date(value);
      } catch {
        return null;
      }
    }
    return null;
  };

  const getInitialMonth = () => {
    const date = getInitialDate();
    return date || new Date();
  };

  const getInitialHour = () => {
    const date = getInitialDate();
    return date ? date.getHours() : 10;
  };

  const getInitialMinute = () => {
    const date = getInitialDate();
    return date ? date.getMinutes() : 0;
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialDate());
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [selectedHour, setSelectedHour] = useState(getInitialHour());
  const [selectedMinute, setSelectedMinute] = useState(getInitialMinute());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          setSelectedHour(date.getHours());
          setSelectedMinute(date.getMinutes());
          setCurrentMonth(date);
        }
      } catch {
        // Invalid date, ignore
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const formatDateTime = (date: Date, hour: number, minute: number): string => {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(hour).padStart(2, "0");
    const minutes = String(minute).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
    const formatted = formatDateTime(newDate, selectedHour, selectedMinute);
    onChange(formatted);
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (selectedDate) {
      const formatted = formatDateTime(selectedDate, hour, minute);
      onChange(formatted);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setSelectedHour(today.getHours());
    setSelectedMinute(today.getMinutes());
    const formatted = formatDateTime(today, today.getHours(), today.getMinutes());
    onChange(formatted);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange("");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (day: number) => {
    if (!min) return false;
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const minDate = new Date(min);
    return checkDate < minDate;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const days = [];
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const displayValue = selectedDate
    ? `${selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${String(selectedHour).padStart(2, "0")}:${String(
        selectedMinute
      ).padStart(2, "0")}`
    : "";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <Label htmlFor={id} className="mb-2 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={displayValue}
          readOnly
          onClick={() => !disabled && setShowCalendar(!showCalendar)}
          disabled={disabled}
          required={required}
          className="cursor-pointer pr-10"
          placeholder="Select date and time"
        />
        <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {showCalendar && (
        <div className="absolute z-50 mt-2 w-[600px] rounded-lg border bg-background shadow-lg">
          <div className="flex">
            {/* Calendar Section */}
            <div className="flex-1 p-4">
              {/* Month Navigation */}
              <div className="mb-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{monthName}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Days of Week Header */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <div
                    key={day}
                    className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-8" />;
                  }
                  const past = isPast(day);
                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !past && handleDateSelect(day)}
                      disabled={past}
                      className={cn(
                        "h-8 rounded-md text-sm transition-colors",
                        past && "cursor-not-allowed opacity-30",
                        selected &&
                          "bg-primary text-primary-foreground font-semibold",
                        !selected &&
                          !past &&
                          "hover:bg-accent hover:text-accent-foreground",
                        today &&
                          !selected &&
                          "border-2 border-primary font-medium"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="text-xs"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Time Picker Section */}
            <div className="w-48 border-l bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Time</span>
              </div>

              <div className="flex gap-3">
                {/* Hours */}
                <div className="flex-1">
                  <div className="mb-1 text-xs text-muted-foreground">Hour</div>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                    {hours.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleTimeChange(hour, selectedMinute)}
                        className={cn(
                          "w-full rounded px-2 py-1 text-sm transition-colors",
                          selectedHour === hour
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {String(hour).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes */}
                <div className="flex-1">
                  <div className="mb-1 text-xs text-muted-foreground">Minute</div>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                    {minutes
                      .filter((m) => m % 5 === 0)
                      .map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => handleTimeChange(selectedHour, minute)}
                          className={cn(
                            "w-full rounded px-2 py-1 text-sm transition-colors",
                            selectedMinute === minute
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {String(minute).padStart(2, "0")}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

