import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard } from "./EventCard";

interface EventCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: any, imageFile?: File) => void;
}

const steps = ["Details", "Schedule", "Location", "Preview"];

export function EventCreateModal({ open, onClose, onCreate }: EventCreateModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "",
    max_attendees: "",
    registration_required: false,
    current_attendees: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onCreate({ ...form, id: Date.now().toString() }, imageFile);
      onClose();
      setStep(0);
      setForm({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        location: "",
        event_type: "",
        max_attendees: "",
        registration_required: false,
        current_attendees: 0,
      });
      setImageFile(null);
    }, 1200);
  };

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
            <div className="p-8 pt-6">
              {/* Stepper */}
              <div className="flex items-center gap-4 mb-8">
                {steps.map((label, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-base ${step === idx ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>{idx + 1}</div>
                    <span className={`text-sm font-medium ${step === idx ? "text-blue-600" : "text-zinc-500"}`}>{label}</span>
                    {idx < steps.length - 1 && <div className="w-8 h-0.5 bg-zinc-300 dark:bg-zinc-700" />}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 0 && (
                  <div className="grid gap-4">
                    <Input name="title" placeholder="Event Title" value={form.title} onChange={handleChange} required className="h-11 text-base rounded-lg" />
                    <Input name="event_type" placeholder="Event Type (e.g. Seminar, Workshop)" value={form.event_type} onChange={handleChange} required className="h-11 text-base rounded-lg" />
                    <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-2 text-base" />
                  </div>
                )}
                {step === 1 && (
                  <div className="grid gap-4">
                    <Input name="event_date" type="date" placeholder="Event Date" value={form.event_date} onChange={handleChange} required className="h-11 text-base rounded-lg" />
                    <div className="flex gap-4">
                      <Input name="start_time" type="time" placeholder="Start Time" value={form.start_time} onChange={handleChange} className="h-11 text-base rounded-lg" />
                      <Input name="end_time" type="time" placeholder="End Time" value={form.end_time} onChange={handleChange} className="h-11 text-base rounded-lg" />
                    </div>
                    <Input name="max_attendees" type="number" placeholder="Max Attendees" value={form.max_attendees} onChange={handleChange} min={1} className="h-11 text-base rounded-lg" />
                    <label className="flex items-center gap-2 text-base">
                      <input type="checkbox" name="registration_required" checked={form.registration_required} onChange={handleChange} className="accent-blue-600 w-5 h-5 rounded" />
                      RSVP Required
                    </label>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid gap-4">
                    <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="h-11 text-base rounded-lg" />
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Image (optional)</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                      />
                      {imageFile && <span className="text-xs text-muted-foreground">{imageFile.name}</span>}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full max-w-xs">
                      <EventCard event={{
                        ...form,
                        id: "preview",
                        current_attendees: 0,
                        max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined,
                        image_url: imageFile ? URL.createObjectURL(imageFile) : undefined,
                      }} onClick={() => {}} />
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-300 text-center text-base">Preview your event card as it will appear to users.</div>
                  </div>
                )}
                <div className="flex justify-between mt-8 gap-4">
                  <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 0} className="h-11 px-6 rounded-lg">Back</Button>
                  {step < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="h-11 px-6 rounded-lg" disabled={step === steps.length - 1 || (step === 0 && !form.title)}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" className="h-11 px-6 rounded-lg" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Event"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 