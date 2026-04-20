import { useEffect, useState, useMemo } from "react";
import { CalendarDays, Users, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, eachDayOfInterval, parseISO, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { hotelConfig } from "@/config/hotel";

type Room = { id: string; name: string; price: number; capacity: number };
type BookedRange = { check_in: string; check_out: string };

const BookingSection = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", roomId: "", checkIn: null as Date | null, checkOut: null as Date | null, guests: "1", message: "",
  });
  const [sending, setSending] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);

  useEffect(() => {
    supabase.from("rooms").select("id, name, price, capacity").eq("is_available", true).order("price").then(({ data }) => {
      if (data && data.length > 0) {
        setRooms(data);
        setForm(f => ({ ...f, roomId: data[0].id }));
      }
    });
  }, []);

  // Fetch booked dates for selected room
  useEffect(() => {
    if (!form.roomId) return;
    supabase
      .from("bookings")
      .select("check_in, check_out")
      .eq("room_id", form.roomId)
      .in("status", ["pending", "confirmed"])
      .then(({ data }) => {
        setBookedRanges(data || []);
      });
    // Reset dates when room changes
    setForm(f => ({ ...f, checkIn: null, checkOut: null }));
  }, [form.roomId]);

  const bookedDates = useMemo(() => {
    const dates: Date[] = [];
    bookedRanges.forEach(r => {
      const start = parseISO(r.check_in);
      const end = parseISO(r.check_out);
      if (start <= end) {
        eachDayOfInterval({ start, end: addDays(end, -1) }).forEach(d => dates.push(d));
      }
    });
    return dates;
  }, [bookedRanges]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(d => d.toDateString() === date.toDateString());
  };

  const selectedRoom = rooms.find(r => r.id === form.roomId);

  // Calculate total
  const nights = form.checkIn && form.checkOut ? differenceInDays(form.checkOut, form.checkIn) : 0;
  const totalPrice = nights > 0 && selectedRoom ? selectedRoom.price * nights : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.checkIn || !form.checkOut || !form.roomId || !form.guests) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    setSending(true);
    const bookingPayload = {
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone,
      room_id: form.roomId,
      room_name: selectedRoom?.name || "",
      check_in: format(form.checkIn!, "yyyy-MM-dd"),
      check_out: format(form.checkOut!, "yyyy-MM-dd"),
      guests: Number(form.guests),
      special_requests: form.message || null,
    };
    const { error } = await supabase.from("bookings").insert(bookingPayload);
    if (error) {
      setSending(false);
      toast.error("Something went wrong. Please try again.");
      return;
    }

    // Notify reception of new booking request (fire-and-forget)
    try {
      const { data: settings } = await supabase
        .from("hotel_settings")
        .select("reception_email, hotel_name, phone")
        .maybeSingle();
      await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          booking: bookingPayload,
          hotel_name: settings?.hotel_name || hotelConfig.fullName,
          phone: settings?.phone || hotelConfig.phone,
          reception_email: settings?.reception_email,
        },
      });
    } catch (err) {
      console.error("Notification email failed:", err);
    }

    setSending(false);
    toast.success("Booking request sent! The reception will contact you shortly to confirm availability and payment.");
    setForm({ name: "", email: "", phone: "", roomId: rooms[0]?.id || "", checkIn: null, checkOut: null, guests: "1", message: "" });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="+250 7XX XXX XXX" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Room Type *</label>
              <select name="roomId" value={form.roomId} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {hotelConfig.currency} {r.price.toLocaleString()}/night</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-in *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button"
                    className={cn("w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-left focus:ring-2 focus:ring-ring focus:outline-none",
                      form.checkIn ? "text-foreground" : "text-muted-foreground")}>
                    {form.checkIn ? format(form.checkIn, "MMM dd, yyyy") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.checkIn || undefined}
                    onSelect={(date) => {
                      setForm(f => ({ ...f, checkIn: date || null, checkOut: null }));
                    }}
                    disabled={(date) => date < today || isDateBooked(date)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-gold" /> Check-out *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button"
                    className={cn("w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-left focus:ring-2 focus:ring-ring focus:outline-none",
                      form.checkOut ? "text-foreground" : "text-muted-foreground")}>
                    {form.checkOut ? format(form.checkOut, "MMM dd, yyyy") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.checkOut || undefined}
                    onSelect={(date) => setForm(f => ({ ...f, checkOut: date || null }))}
                    disabled={(date) => {
                      if (!form.checkIn) return true;
                      if (date <= form.checkIn) return true;
                      return isDateBooked(date);
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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

          {/* Total Price Display */}
          {nights > 0 && selectedRoom && (
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between font-body text-sm text-foreground">
                <span>{selectedRoom.name} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span className="font-semibold text-lg text-gold">{hotelConfig.currency} {totalPrice.toLocaleString()}</span>
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {hotelConfig.currency} {selectedRoom.price.toLocaleString()} per night
              </p>
            </div>
          )}

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
