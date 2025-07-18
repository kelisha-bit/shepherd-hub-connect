import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RSVPForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // TODO: Connect to Supabase RSVP logic
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-xl shadow p-6 space-y-4 mt-4 w-full max-w-md mx-auto">
      <div>
        <label htmlFor="rsvp-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Your Name</label>
        <Input
          id="rsvp-name"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="h-11 text-base rounded-lg"
        />
      </div>
      <div>
        <label htmlFor="rsvp-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Your Email</label>
        <Input
          id="rsvp-email"
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-11 text-base rounded-lg"
        />
      </div>
      <Button type="submit" disabled={loading || !name || !email} className="w-full h-11 text-base font-semibold rounded-lg">
        {loading ? "Submitting..." : "RSVP"}
      </Button>
      {success && <div className="text-green-600 text-sm text-center">RSVP submitted!</div>}
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
    </form>
  );
} 