import { useEffect, useState } from "react";
import { CalendarDays, Users, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Room = { id: string; name: string; price: number; capacity: number };

const BookingSection = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", roomId: "", checkIn: "", checkOut: "", guests: "1", message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("rooms").select("id, name, price, capacity").eq("is_available", true).order("price").then(({ data }) => {
      if (data && data.length > 0) {
        setRooms(data);
        setForm(f => ({ ...f, roomId: data[0].id }));
      }
    });
  }, []);

  const selectedRoom = rooms.find(r => r.id === form.roomId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.checkIn || !form.checkOut || !form.roomId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("bookings").insert({
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone || null,
      room_id: form.roomId,
      room_name: selectedRoom?.name || "",
      check_in: form.checkIn,
      check_out: form.checkOut,
      guests: Number(form.guests),
      special_requests: form.message || null,
    });
    setSending(false);
    if (error) { toast.error("Something went wrong. Please try again."); return; }
    toast.success("Booking request sent! The reception will contact you shortly to confirm availability and payment.");
    setForm({ name: "", email: "", phone: "", roomId: rooms[0]?.id || "", checkIn: "", checkOut: "", guests: "1", message: "" });
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
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="john@email.com" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="+250 7XX XXX XXX" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Room Type *</label>
              <select name="roomId" value={form.roomId} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — RF {r.price.toLocaleString()}/night</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-in *
              </label>
              <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-out *
              </label>
              <input name="checkOut" type="date" value={form.checkOut} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <Users className="w-4 h-4 text-gold" /> Guests
              </label>
              <select name="guests" value={form.guests} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                {Array.from({ length: selectedRoom?.capacity || 4 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1.5">Special Requests</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3}
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              placeholder="Any special requirements or questions..." />
          </div>

          <button type="submit" disabled={sending}
            className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Request Booking"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
