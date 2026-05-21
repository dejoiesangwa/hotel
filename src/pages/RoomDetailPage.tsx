import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import BookingModal from "@/components/BookingModal";
import { hotelConfig } from "@/config/hotel";
import {
  Users, Bed, Wifi, Coffee, Tv, Bath, Wind, ShieldCheck,
  ArrowLeft, Check, Clock, Star, ChevronLeft, ChevronRight,
  Heart, Share2, Award, Sparkles, Sunrise, Moon
} from "lucide-react";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomTwin from "@/assets/room-twin.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const fallbackImages: Record<string, string> = {
  "Deluxe Double Room": roomDeluxe,
  "Twin Room": roomTwin,
  "Executive Suite": roomSuite,
};

type Room = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  bed_type: string;
  image_url: string | null;
  features: string[] | null;
  is_available: boolean;
};

const amenityIcons: Record<string, any> = {
  WiFi: Wifi, "Free WiFi": Wifi, Coffee: Coffee, TV: Tv,
  Bathroom: Bath, AC: Wind, Safe: ShieldCheck,
};

// Room-specific extras to enrich the detail page
const roomExtras: Record<string, { highlight: string; experience: string; extras: string[] }> = {
  "Deluxe Double Room": {
    highlight: "Perfect for couples seeking a romantic escape",
    experience: "Wake up to panoramic city views from your king-sized bed, wrapped in 500-thread-count Egyptian cotton sheets. Your private en-suite bathroom features rain shower and luxury toiletries.",
    extras: ["City view", "King-size bed", "Rain shower", "Evening turndown service", "Pillow menu"],
  },
  "Twin Room": {
    highlight: "Ideal for friends or business travellers",
    experience: "Two plush twin beds, a spacious work area with high-speed fibre, and a modern bathroom — everything you need whether you're here for business or exploring Kigali with a friend.",
    extras: ["Work desk", "Twin beds", "High-speed fibre WiFi", "Blackout curtains", "Mini fridge"],
  },
  "Executive Suite": {
    highlight: "The pinnacle of luxury in Kigali",
    experience: "A separate living room, dining area, and master bedroom create a home away from home. Exclusive perks include butler service, a complimentary welcome drink, and late check-out.",
    extras: ["Separate living room", "Butler service", "Welcome drink", "Late check-out", "Bathtub & rain shower"],
  },
};

const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [related, setRelated] = useState<Room[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
      if (data) {
        setRoom(data as Room);
        const main = (data as Room).image_url || fallbackImages[(data as Room).name] || roomDeluxe;
        setActiveImage(main);
      }
      const { data: others } = await supabase.from("rooms").select("*").eq("is_available", true).neq("id", id).limit(3);
      if (others) setRelated(others as Room[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">Room not found</h1>
          <Link to="/rooms" className="text-gold underline">Browse our rooms</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mainImg = room.image_url || fallbackImages[room.name] || roomDeluxe;
  const gallery = Array.from(new Set([mainImg, roomDeluxe, roomTwin, roomSuite]));
  const features = room.features || [];
  const extras = roomExtras[room.name] || { highlight: "", experience: room.description || "", extras: [] };

  const prevImg = () => {
    const idx = (activeIdx - 1 + gallery.length) % gallery.length;
    setActiveIdx(idx);
    setActiveImage(gallery[idx]);
  };
  const nextImg = () => {
    const idx = (activeIdx + 1) % gallery.length;
    setActiveIdx(idx);
    setActiveImage(gallery[idx]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} preselectedRoomId={room.id} />

      {/* Hero banner */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={mainImg} alt={room.name} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute bottom-8 left-0 right-0 container mx-auto px-4">
          <p className="text-gold font-body text-xs tracking-[0.2em] uppercase mb-1">Accommodation</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white">{room.name}</h1>
          {extras.highlight && (
            <p className="font-body text-white/80 mt-2 text-base">{extras.highlight}</p>
          )}
        </div>
        <Link
          to="/rooms"
          className="absolute top-24 left-4 md:left-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all font-body"
        >
          <ArrowLeft className="w-4 h-4" /> All Rooms
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT: Gallery + Details */}
          <div className="lg:col-span-3 space-y-10">

            {/* Gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl group">
                <img
                  src={activeImage}
                  alt={room.name}
                  className="w-full h-full object-cover object-center transition-all duration-500"
                />
                <button onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => (
                    <button key={i} onClick={() => { setActiveIdx(i); setActiveImage(gallery[i]); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeIdx ? "bg-gold w-5" : "bg-white/60 hover:bg-white"}`} />
                  ))}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => { setActiveIdx(i); setActiveImage(g); }}
                    className={`rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${activeImage === g ? "border-gold ring-2 ring-gold/30 scale-105" : "border-border hover:border-gold/50"}`}>
                    <img src={g} alt={`${room.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">The Experience</h2>
              <p className="font-body text-muted-foreground leading-relaxed text-base">
                {extras.experience || room.description || "A beautifully appointed room designed for the modern traveller — combining elegant finishes with thoughtful comforts for a restful stay."}
              </p>
            </section>

            {/* Highlights grid */}
            {extras.extras.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-5">Room Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {extras.extras.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:border-gold/40 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="font-body text-sm text-foreground">{e}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-5">What This Room Offers</h2>
              {features.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No amenities listed.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((f) => {
                    const Icon = amenityIcons[f] || Check;
                    return (
                      <div key={f} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-gold/30 transition-colors">
                        <Icon className="w-5 h-5 text-gold flex-shrink-0" />
                        <span className="font-body text-sm text-foreground">{f}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Day in the room timeline */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Your Day at Silver Hotel</h2>
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gold/20" />
                {[
                  { icon: Sunrise, time: "7:00 AM", title: "Continental Breakfast", desc: "Enjoy a freshly prepared breakfast served to your room or in our restaurant." },
                  { icon: Coffee, time: "10:00 AM", title: "Concierge at Your Service", desc: "Our 24/7 concierge arranges tours, transport, and any special requests." },
                  { icon: Award, time: "2:00 PM", title: "Leisure & Amenities", desc: "Unwind by the pool, in the gym, or with an in-room spa treatment." },
                  { icon: Moon, time: "8:00 PM", title: "Evening Turndown", desc: "Return to a freshly prepared room with complimentary chocolates and evening service." },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 flex-1 hover:border-gold/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-4 h-4 text-gold" />
                        <span className="font-body text-xs text-gold font-medium">{item.time}</span>
                      </div>
                      <h4 className="font-heading font-bold text-foreground text-sm mb-1">{item.title}</h4>
                      <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Policies */}
            <section className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Clock, title: "Check-in", text: hotelConfig.checkInTime },
                { icon: Clock, title: "Check-out", text: hotelConfig.checkOutTime },
                { icon: ShieldCheck, title: "Safety", text: "24/7 reception & secure entry" },
              ].map((p) => (
                <div key={p.title} className="bg-warm-dark text-white rounded-2xl p-5 border border-gold/20">
                  <p.icon className="w-5 h-5 text-gold mb-2" />
                  <h3 className="font-heading text-base font-bold mb-1">{p.title}</h3>
                  <p className="font-body text-sm text-white/70">{p.text}</p>
                </div>
              ))}
            </section>
          </div>

          {/* RIGHT: Booking card (sticky) */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-xl">
              <p className="text-gold font-body text-xs tracking-[0.2em] uppercase mb-1">Accommodation</p>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{room.name}</h2>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-4 h-4 text-gold fill-gold" />))}
                <span className="text-xs text-muted-foreground ml-2 font-body">Guest favourite</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-heading text-4xl font-bold text-gold">
                  {hotelConfig.currency} {room.price.toLocaleString()}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">per night</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-3">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="text-sm text-foreground font-body">{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-3">
                  <Bed className="w-4 h-4 text-gold" />
                  <span className="text-sm text-foreground font-body">{room.bed_type}</span>
                </div>
              </div>

              {/* Availability badge */}
              <div className={`mb-5 px-4 py-2.5 rounded-xl text-sm font-body font-medium flex items-center gap-2 ${room.is_available ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                <div className={`w-2 h-2 rounded-full ${room.is_available ? "bg-green-500" : "bg-red-500"}`} />
                {room.is_available ? "Available to book" : "Currently unavailable"}
              </div>

              <button
                onClick={() => setBookingOpen(true)}
                className="block w-full text-center gold-gradient px-6 py-3.5 rounded-xl font-body font-semibold text-primary-foreground hover:opacity-90 transition-opacity text-base"
              >
                Book This Room
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
                Free cancellation up to 24h before check-in
              </p>

              {/* Quick features */}
              {features.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">Included</p>
                  <div className="flex flex-wrap gap-2">
                    {features.slice(0, 6).map((f) => (
                      <span key={f} className="text-xs font-body bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-gold hover:border-gold py-2.5 rounded-xl transition-colors font-body text-sm">
                  <Heart className="w-4 h-4" /> Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-gold hover:border-gold py-2.5 rounded-xl transition-colors font-body text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Rooms */}
        {related.length > 0 && (
          <section className="mt-20 mb-12">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/rooms/${r.id}`}
                  className="block bg-card rounded-xl overflow-hidden border border-border hover:border-gold transition-colors group">
                  <div className="h-48 overflow-hidden">
                    <img src={r.image_url || fallbackImages[r.name] || roomDeluxe} alt={r.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground group-hover:text-gold transition-colors">{r.name}</h3>
                    <p className="text-xs text-muted-foreground font-body mt-1">{hotelConfig.currency} {r.price.toLocaleString()} / night</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <ContactSection />
      <Footer />
    </div>
  );
};

export default RoomDetailPage;
