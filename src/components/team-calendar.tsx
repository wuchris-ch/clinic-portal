"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LeaveRequest, LeaveType, Profile } from "@/lib/types/database";

type RequestWithDetails = LeaveRequest & {
  profiles: Pick<Profile, "id" | "full_name">;
  leave_types: LeaveType;
};

interface TeamCalendarProps {
  events: RequestWithDetails[];
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  leaveType: string;
  employeeName: string;
}

export function TeamCalendar({ events }: TeamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: `${event.profiles.full_name} - ${event.leave_types.name}`,
      startDate: parseISO(event.start_date),
      endDate: parseISO(event.end_date),
      color: event.leave_types.color,
      leaveType: event.leave_types.name,
      employeeName: event.profiles.full_name,
    }));
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter((event) => {
      // Normalize dates to compare just the date portion (ignore time)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const eventStart = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
      const eventEnd = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
      
      return dayStart >= eventStart && dayStart <= eventEnd;
    });
  };

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  return (
    <div className="team-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        {/* Desktop: Today + arrows on left */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Mobile: Arrow left of month */}
        <Button variant="outline" size="icon" className="md:hidden h-8 w-8" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Month/Year - always centered */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          {/* Mobile: Today button below month */}
          <Button variant="outline" size="sm" className="md:hidden h-7 text-xs" onClick={goToToday}>
            Today
          </Button>
        </div>
        
        {/* Mobile: Arrow right of month */}
        <Button variant="outline" size="icon" className="md:hidden h-8 w-8" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Desktop: Spacer for centering */}
        <div className="hidden md:block w-[140px]" />
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/30">
          {weekDays.map((dayName) => (
            <div
              key={dayName}
              className="px-2 py-3 text-center text-sm font-semibold text-muted-foreground border-b border-border"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((dayDate, dayIndex) => {
              const dayEvents = getEventsForDay(dayDate);
              const isCurrentMonth = isSameMonth(dayDate, currentDate);
              const isToday = isSameDay(dayDate, today);

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-1.5 border-b border-r border-border last:border-r-0 ${
                    !isCurrentMonth ? "bg-muted/20" : ""
                  } ${isToday ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`text-sm mb-1 px-1 ${
                      !isCurrentMonth
                        ? "text-muted-foreground/50"
                        : isToday
                        ? "font-bold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {format(dayDate, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1.5 py-0.5 rounded truncate text-white font-medium"
                        style={{ backgroundColor: event.color }}
                        title={event.title}
                      >
                        <span className="hidden sm:inline">{event.employeeName}</span>
                        <span className="sm:hidden">{event.employeeName.split(" ")[0]}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-primary font-medium px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
