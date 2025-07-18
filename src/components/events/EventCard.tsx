import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function EventCard({ event, onClick, isPast = false }: { event: Event; onClick: () => void; isPast?: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 transition overflow-hidden ${isPast ? "opacity-70" : ""}`}
        tabIndex={0}
        aria-label={`View details for event: ${event.title}`}
      >
        <div className="relative aspect-[16/9] w-full">
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-xs px-2 py-1 rounded-full shadow">
              {event.event_type}
            </Badge>
            {event.registration_required && (
              <Badge variant="secondary" className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full shadow">
                RSVP Required
              </Badge>
            )}
            {isPast && <Badge variant="destructive" className="text-xs px-2 py-1 rounded-full shadow">Past</Badge>}
          </div>
        </div>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white truncate">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5 pb-5">
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.event_date).toLocaleDateString()}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <Users className="h-4 w-4" />
            <span>
              {event.current_attendees}
              {event.max_attendees && ` / ${event.max_attendees}`} attendees
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 