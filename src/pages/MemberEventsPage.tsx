import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  event_type?: string;
  max_attendees?: number;
  current_attendees?: number;
  registration_required?: boolean;
}

export default function MemberEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  const filteredEvents = selectedType === "all" 
    ? events 
    : events.filter(event => event.event_type === selectedType);

  const eventTypes = Array.from(new Set(events.map(e => e.event_type).filter(Boolean)));

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground">Stay connected with church activities and services</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
          >
            All Events
          </Button>
          {eventTypes.map(type => (
            <Button 
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No upcoming events found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.event_type && (
                    <Badge variant="outline">{event.event_type}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                {(event.start_time || event.end_time) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.start_time && formatTime(event.start_time)}
                      {event.start_time && event.end_time && " - "}
                      {event.end_time && formatTime(event.end_time)}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.max_attendees && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.current_attendees || 0} / {event.max_attendees} attendees
                    </span>
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}
                {event.registration_required && (
                  <Badge variant="secondary">Registration Required</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 