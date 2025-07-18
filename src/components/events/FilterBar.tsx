import { useState } from "react";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
  eventTypes: string[];
  onFilterChange: (filters: { type: string; rsvp: string; sort: string }) => void;
}

export function FilterBar({ eventTypes, onFilterChange }: FilterBarProps) {
  const [type, setType] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [sort, setSort] = useState("date-asc");

  const handleChange = (field: string, value: string) => {
    if (field === "type") setType(value);
    if (field === "rsvp") setRsvp(value);
    if (field === "sort") setSort(value);
    onFilterChange({ type: field === "type" ? value : type, rsvp: field === "rsvp" ? value : rsvp, sort: field === "sort" ? value : sort });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type + rsvp + sort}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap gap-2 items-center py-2"
      >
        <Filter className="h-5 w-5 text-muted-foreground" />
        <div className="flex gap-1">
          <Button
            variant={type === "" ? "default" : "outline"}
            className={`rounded-full px-4 py-2 text-sm shadow-sm transition-all ${type === "" ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
            aria-pressed={type === ""}
            onClick={() => handleChange("type", "")}
          >
            All Types
          </Button>
          {eventTypes.map((t) => (
            <Button
              key={t}
              variant={type === t ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-sm shadow-sm transition-all ${type === t ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
              aria-pressed={type === t}
              onClick={() => handleChange("type", t)}
            >
              {t}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          <Button
            variant={rsvp === "" ? "default" : "outline"}
            className={`rounded-full px-4 py-2 text-sm shadow-sm transition-all ${rsvp === "" ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
            aria-pressed={rsvp === ""}
            onClick={() => handleChange("rsvp", "")}
          >
            All RSVP
          </Button>
          <Button
            variant={rsvp === "required" ? "default" : "outline"}
            className={`rounded-full px-4 py-2 text-sm shadow-sm transition-all ${rsvp === "required" ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
            aria-pressed={rsvp === "required"}
            onClick={() => handleChange("rsvp", "required")}
          >
            RSVP Required
          </Button>
          <Button
            variant={rsvp === "not-required" ? "default" : "outline"}
            className={`rounded-full px-4 py-2 text-sm shadow-sm transition-all ${rsvp === "not-required" ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
            aria-pressed={rsvp === "not-required"}
            onClick={() => handleChange("rsvp", "not-required")}
          >
            No RSVP
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => handleChange("sort", sort === "date-asc" ? "date-desc" : "date-asc")}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-sm shadow-sm ml-2"
          aria-label="Sort by Date"
        >
          {sort === "date-asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          <span className="hidden sm:inline">Sort by Date</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
} 