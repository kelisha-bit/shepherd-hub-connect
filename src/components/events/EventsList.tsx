import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";
import { FilterBar } from "./FilterBar";
import { AnimatePresence, motion } from "framer-motion";
import { EventCreateModal } from "./EventCreateModal";
import { SkeletonEventCard } from "./SkeletonEventCard";

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
  image_url?: string;
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ type: string; rsvp: string; sort: string }>({ type: "", rsvp: "", sort: "date-asc" });
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();
  const [ariaMessage, setAriaMessage] = useState("");
  const prevFilters = useRef(filters);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Update ARIA live region when filters change
  useEffect(() => {
    if (prevFilters.current !== filters) {
      let msg = "";
      if (filters.type) msg += `Filtered by type: ${filters.type}. `;
      if (filters.rsvp) msg += `RSVP: ${filters.rsvp === "required" ? "Required" : filters.rsvp === "not-required" ? "Not Required" : "All"}. `;
      msg += `Sorted by date ${filters.sort === "date-asc" ? "ascending" : "descending"}.`;
      setAriaMessage(msg);
      prevFilters.current = filters;
    }
  }, [filters]);

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

  // Filtering and sorting logic
  let filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (filters.type) {
    filteredEvents = filteredEvents.filter((event) => event.event_type === filters.type);
  }
  if (filters.rsvp === "required") {
    filteredEvents = filteredEvents.filter((event) => event.registration_required);
  } else if (filters.rsvp === "not-required") {
    filteredEvents = filteredEvents.filter((event) => !event.registration_required);
  }
  if (filters.sort === "date-desc") {
    filteredEvents = [...filteredEvents].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  } else {
    filteredEvents = [...filteredEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) >= new Date()
  );
  const pastEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) < new Date()
  );

  // Get unique event types for filter bar
  const eventTypes = Array.from(new Set(events.map((e) => e.event_type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-12">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Loading Events</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonEventCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 py-8"
    >
      {/* ARIA live region for accessibility */}
      <div aria-live="polite" className="sr-only" role="status">{ariaMessage}</div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm">Events</h1>
          <Button className="h-12 px-6 text-base font-semibold rounded-lg shadow-md" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </div>
        <div className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base rounded-lg"
              />
            </div>
            <FilterBar eventTypes={eventTypes} onFilterChange={setFilters} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {upcomingEvents.length > 0 && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4 mb-12"
            >
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Upcoming Events</h2>
              <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EventCard
                        event={event}
                        onClick={() => {
                          setSelectedEvent(event);
                          setModalOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {pastEvents.length > 0 && (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4 mb-12"
            >
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Past Events</h2>
              <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {pastEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EventCard
                        event={event}
                        isPast
                        onClick={() => {
                          setSelectedEvent(event);
                          setModalOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {filteredEvents.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="30" width="100" height="60" rx="16" fill="#e0e7ef" />
              <rect x="30" y="50" width="60" height="20" rx="6" fill="#b6c3d6" />
              <circle cx="60" cy="80" r="8" fill="#b6c3d6" />
              <rect x="50" y="90" width="20" height="6" rx="3" fill="#b6c3d6" />
              <rect x="40" y="38" width="40" height="6" rx="3" fill="#cbd5e1" />
            </svg>
            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">No events found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-base mb-2">Get started by creating your first event for your community.</p>
            <Button className="h-11 px-6 text-base font-semibold rounded-lg shadow-md" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </motion.div>
        )}
        <EventModal event={selectedEvent} open={modalOpen} onClose={() => setModalOpen(false)} />
        <EventCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={async (newEvent) => {
            // Prepare event for Supabase
            const eventToInsert = {
              title: newEvent.title,
              description: newEvent.description || null,
              event_date: newEvent.event_date,
              start_time: newEvent.start_time || null,
              end_time: newEvent.end_time || null,
              location: newEvent.location || null,
              event_type: newEvent.event_type || null,
              max_attendees: newEvent.max_attendees ? Number(newEvent.max_attendees) : null,
              registration_required: !!newEvent.registration_required,
              current_attendees: 0,
              image_url: newEvent.image_url || null,
            };
            const { data, error } = await supabase.from("events").insert([eventToInsert]).select().single();
            if (error) {
              console.error(error);
              toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
              return;
            }
            setEvents((prev) => [
              { ...data, image_url: newEvent.image_url || undefined },
              ...prev,
            ]);
            setCreateOpen(false);
            toast({ title: "Event Created", description: `Event '${data.title}' was created successfully!` });
          }}
        />
      </div>
    </motion.div>
  );
}