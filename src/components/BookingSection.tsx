import { useState } from "react";
import { CalendarDays, Users, Send } from "lucide-react";
import { toast } from "sonner";

const roomOptions = [
  "Deluxe Double Room — RF 30,984/night",
  "Twin Room — RF 49,574/night",
  "Executive Suite — RF 75,000/night",
];

const BookingSection = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    room: roomOptions[0],
    checkIn: "",
    checkOut: "",
    guests: "1",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.checkIn || !form.checkOut) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Booking request sent! The reception will contact you shortly to confirm availability and payment.");
      setForm({ name: "", email: "", phone: "", room: roomOptions[0], checkIn: "", checkOut: "", guests: "1", message: "" });
    }, 1500);
  };

  return (
    <section id="booking" className="py-20 bg-warm-dark">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Reservations</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground">Book Your Stay</h2>
          <p className="font-body text-primary-foreground/60 mt-3 max-w-md mx-auto text-sm">
            Fill in the form below and our reception team will get back to you to confirm room availability and payment details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-10 border border-border space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="john@email.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="+250 7XX XXX XXX"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Room Type *</label>
              <select
                name="room"
                value={form.room}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {roomOptions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-in *
              </label>
              <input
                name="checkIn"
                type="date"
                value={form.checkIn}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-out *
              </label>
              <input
                name="checkOut"
                type="date"
                value={form.checkOut}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <Users className="w-4 h-4 text-gold" /> Guests
              </label>
              <select
                name="guests"
                value={form.guests}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Special Requests</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              placeholder="Any special requirements or questions..."
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Request Booking"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
