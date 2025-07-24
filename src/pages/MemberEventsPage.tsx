import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

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
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (user) findMemberId();
  }, [user]);

  useEffect(() => {
    if (memberId) {
      fetchEvents();
      fetchAttendance();
    }
  }, [memberId]);

  const findMemberId = async () => {
    // Try to find member by email first
    const { data: emailData } = await supabase
      .from("members")
      .select("id")
      .eq("email", user?.email)
      .maybeSingle();
      
    if (emailData) {
      setMemberId(emailData.id);
      return;
    }
    
    // Try by auth ID
    const { data: idData } = await supabase
      .from("members")
      .select("id")
      .eq("id", user?.id)
      .maybeSingle();
      
    if (idData) {
      setMemberId(idData.id);
      return;
    }
    
    // Fallback to auth ID
    setMemberId(user?.id || null);
  };

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  const fetchAttendance = async () => {
    if (!memberId) return;
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", memberId);
    setAttendance(data || []);
  };

  const handleRSVP = async (eventId: string) => {
    if (!memberId) return;
    
    try {
      // Insert attendance record as RSVP
      const { error } = await supabase
        .from("attendance")
        .insert({ 
          event_id: eventId, 
          member_id: memberId, 
          present: false,
          attendance_date: new Date().toISOString().split('T')[0]
        });
      
      if (error) {
        console.error("RSVP error:", error);
        return;
      }
      
      fetchAttendance();
    } catch (error) {
      console.error("RSVP error:", error);
    }
  };

  const handleUnRSVP = async (eventId: string) => {
    if (!memberId) return;
    
    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("event_id", eventId)
        .eq("member_id", memberId);
      
      if (error) {
        console.error("Un-RSVP error:", error);
        return;
      }
      
      fetchAttendance();
    } catch (error) {
      console.error("Un-RSVP error:", error);
    }
  };

  const getRSVPStatus = (eventId: string) => {
    return attendance.some(a => a.event_id === eventId);
  };

  const getAttendedStatus = (eventId: string) => {
    return attendance.some(a => a.event_id === eventId && a.present);
  };

  const today = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= today);
  const pastEvents = events.filter(e => new Date(e.event_date) < today);

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
      {/* Upcoming Events */}
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
          {Array.from(new Set(events.map(e => e.event_type).filter(Boolean))).map(type => (
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents
            .filter(event => selectedType === "all" || event.event_type === selectedType)
            .map((event) => {
              const isRSVPed = getRSVPStatus(event.id);
              return (
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
                    {/* RSVP/Un-RSVP Button */}
                    {event.registration_required && (
                      isRSVPed ? (
                        <Button size="sm" variant="secondary" onClick={() => handleUnRSVP(event.id)}>
                          Cancel RSVP
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleRSVP(event.id)}>
                          RSVP
                        </Button>
                      )
                    )}
                    {/* RSVP Status */}
                    {isRSVPed && (
                      <Badge variant="success">You are attending</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
      {/* Past Events */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Past Events Attended</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastEvents
            .filter(event => attendance.some(a => a.event_id === event.id && a.present))
            .map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="success">Attended</Badge>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
} 