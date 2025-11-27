import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCollaborations } from "@/hooks/useCollaborations";
import { CalendarDays, Clock, DollarSign } from "lucide-react";
import { format, isSameDay } from "date-fns";

export default function InfluencerCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: collaborations } = useCollaborations();

  // Get events for the selected date
  const activeCollabs = collaborations?.filter((c) => c.status === "accepted") || [];
  
  const eventsForSelectedDate = selectedDate
    ? activeCollabs.filter(
        (c) => c.deadline && isSameDay(new Date(c.deadline), selectedDate)
      )
    : [];

  // Get all dates with events for highlighting
  const datesWithEvents = activeCollabs
    .filter((c) => c.deadline)
    .map((c) => new Date(c.deadline!));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">
            Track your deadlines and scheduled collaborations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Collaboration Schedule</CardTitle>
              <CardDescription>View and manage your upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvent: datesWithEvents,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    color: "hsl(var(--primary))",
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
              </CardTitle>
              <CardDescription>
                {eventsForSelectedDate.length} deadline(s) on this day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((collab) => (
                  <div
                    key={collab.id}
                    className="p-4 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{collab.campaigns?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {collab.brand_profiles?.company_name}
                        </p>
                      </div>
                      <Badge>Due</Badge>
                    </div>
                    {collab.deliverables && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {collab.deliverables}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${collab.offered_amount?.toLocaleString() || "TBD"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No deadlines on this day</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>All your upcoming collaboration deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCollabs.filter((c) => c.deadline).length > 0 ? (
              <div className="space-y-3">
                {activeCollabs
                  .filter((c) => c.deadline && new Date(c.deadline) >= new Date())
                  .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                  .map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{collab.campaigns?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {collab.brand_profiles?.company_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {format(new Date(collab.deadline!), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${collab.offered_amount?.toLocaleString() || "TBD"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming deadlines
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

