import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { RSVPForm } from "./RSVPForm";

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

interface EventModalProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

export function EventModal({ event, open, onClose }: EventModalProps) {
  if (!event) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800"
            initial={{ scale: 0.95, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white/70 dark:bg-zinc-900/70 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative aspect-[16/7] w-full">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-xs px-2 py-1 rounded-full shadow">
                  {event.event_type}
                </Badge>
                {event.registration_required && (
                  <Badge variant="secondary" className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full shadow">
                    RSVP Required
                  </Badge>
                )}
                {event.max_attendees && (
                  <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-xs px-2 py-1 rounded-full shadow">
                    Max: {event.max_attendees}
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-8 pt-6">
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">
                {event.title}
              </h2>
              <div className="flex flex-wrap gap-4 mb-4 text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  <span>
                    {event.current_attendees}
                    {event.max_attendees && ` / ${event.max_attendees}`} attendees
                  </span>
                </div>
              </div>
              {event.description && (
                <div className="text-base bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg mb-6 text-zinc-800 dark:text-zinc-200">
                  {event.description}
                </div>
              )}
              {event.registration_required && (
                <RSVPForm eventId={event.id} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 