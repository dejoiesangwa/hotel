import { useEffect, useState } from "react";
import { Star, Send, Quote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = {
  id: string;
  guest_name: string;
  rating: number;
  message: string;
  created_at: string;
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", rating: 5, message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, guest_name, rating, message, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(9)
      .then(({ data }) => {
        if (data) setTestimonials(data as Testimonial[]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name.trim() || !form.message.trim()) {
      toast.error("Please add your name and a short message.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      guest_name: form.guest_name,
      guest_email: form.guest_email || null,
      rating: form.rating,
      message: form.message,
      is_approved: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit review. Please try again.");
      return;
    }
    toast.success("Thanks! Your review will appear after staff approval.");
    setForm({ guest_name: "", guest_email: "", rating: 5, message: "" });
  };

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Guest Reviews</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">What Our Guests Say</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            Real experiences from travelers who stayed with us.
          </p>
        </div>

        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-6 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gold/20" />
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="font-body text-sm text-foreground leading-relaxed mb-4">"{t.message}"</p>
                <p className="font-body text-sm font-semibold text-foreground">{t.guest_name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <h3 className="font-heading text-2xl font-bold text-foreground text-center mb-2">
            Share Your Experience
          </h3>
          <p className="font-body text-sm text-muted-foreground text-center mb-6">
            Stayed with us? Leave a review — it appears once approved by our team.
          </p>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 border border-border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Your Name *</label>
                <input
                  value={form.guest_name}
                  onChange={(e) => setForm((p) => ({ ...p, guest_name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email (optional)</label>
                <input
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => setForm((p) => ({ ...p, guest_email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="jane@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, rating: n }))}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= form.rating ? "fill-gold text-gold" : "text-muted-foreground/40 hover:text-gold/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Your Review *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                placeholder="Tell us about your stay..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
