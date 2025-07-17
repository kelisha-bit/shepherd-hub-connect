import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  event_type: string;
  max_attendees?: number;
  current_attendees: number;
  registration_required: boolean;
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) >= new Date()
  );
  const pastEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) < new Date()
  );

  if (loading) {
    return <div className="p-6">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  return (
    <Card className={isPast ? "opacity-70" : ""}>
      <CardHeader>
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">{event.event_type}</Badge>
          {event.registration_required && (
            <Badge variant="secondary">Registration Required</Badge>
          )}
          {isPast && <Badge variant="destructive">Past</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{new Date(event.event_date).toLocaleDateString()}</span>
        </div>
        
        {(event.start_time || event.end_time) && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {event.start_time && event.start_time}
              {event.start_time && event.end_time && " - "}
              {event.end_time && event.end_time}
            </span>
          </div>
        )}
        
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>
            {event.current_attendees}
            {event.max_attendees && ` / ${event.max_attendees}`} attendees
          </span>
        </div>
        
        {event.description && (
          <div className="text-sm bg-muted p-2 rounded">
            {event.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}