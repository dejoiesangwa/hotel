import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hotelConfig } from "@/config/hotel";
import { Users, Bed, Wifi, Coffee, Tv, Bath, Wind, ShieldCheck, ArrowLeft, Check, Clock, Star } from "lucide-react";
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
  WiFi: Wifi,
  "Free WiFi": Wifi,
  Coffee: Coffee,
  TV: Tv,
  Bathroom: Bath,
  AC: Wind,
  Safe: ShieldCheck,
};

const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [related, setRelated] = useState<Room[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
      if (data) {
        setRoom(data as Room);
        const main = (data as Room).image_url || fallbackImages[(data as Room).name] || roomDeluxe;
        setActiveImage(main);
      }
      const { data: others } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_available", true)
        .neq("id", id)
        .limit(3);
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
  // Build gallery: main + 3 angle shots using our existing asset library
  const gallery = Array.from(new Set([mainImg, roomDeluxe, roomTwin, roomSuite]));

  const features = room.features || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 container mx-auto px-4 max-w-6xl">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6 font-body">
          <ArrowLeft className="w-4 h-4" /> Back to all rooms
        </Link>

        {/* Gallery + Summary */}
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Image gallery */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-border bg-card aspect-[4/3]">
              <img
                src={activeImage}
                alt={room.name}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(g)}
                  className={`rounded-lg overflow-hidden aspect-[4/3] border-2 transition-all ${
                    activeImage === g ? "border-gold ring-2 ring-gold/30" : "border-border hover:border-gold/50"
                  }`}
                >
                  <img src={g} alt={`${room.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <p className="text-gold font-body text-xs tracking-[0.2em] uppercase mb-1">Accommodation</p>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-3">{room.name}</h1>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                ))}
                <span className="text-xs text-muted-foreground ml-2 font-body">Guest favourite</span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-heading text-4xl font-bold text-gold">
                  {hotelConfig.currency} {room.price.toLocaleString()}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">per night</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-secondary/60 rounded-lg p-3">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="text-sm text-foreground font-body">{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 rounded-lg p-3">
                  <Bed className="w-4 h-4 text-gold" />
                  <span className="text-sm text-foreground font-body">{room.bed_type}</span>
                </div>
              </div>

              <Link
                to="/#booking"
                className="block w-full text-center gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Book This Room
              </Link>
              <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
                Free cancellation up to 24h before check-in
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-16 max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">About this room</h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            {room.description || "A beautifully appointed room designed for the modern traveller — combining elegant finishes with thoughtful comforts for a restful stay."}
          </p>
        </section>

        {/* Amenities */}
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">What this room offers</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No amenities listed.</p>
            ) : (
              features.map((f) => {
                const Icon = amenityIcons[f] || Check;
                return (
                  <div key={f} className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
                    <Icon className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="font-body text-sm text-foreground">{f}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Policies */}
        <section className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "Check-in", text: hotelConfig.checkInTime },
            { icon: Clock, title: "Check-out", text: hotelConfig.checkOutTime },
            { icon: ShieldCheck, title: "Safety", text: "24/7 reception & secure entry" },
          ].map((p) => (
            <div key={p.title} className="bg-warm-dark text-white rounded-2xl p-6 border border-gold/20">
              <p.icon className="w-6 h-6 text-gold mb-3" />
              <h3 className="font-heading text-lg font-bold mb-1">{p.title}</h3>
              <p className="font-body text-sm text-white/70">{p.text}</p>
            </div>
          ))}
        </section>

        {/* Related Rooms */}
        {related.length > 0 && (
          <section className="mt-20 mb-20">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">You may also like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/rooms/${r.id}`}
                  className="block bg-card rounded-xl overflow-hidden border border-border hover:border-gold transition-colors group"
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={r.image_url || fallbackImages[r.name] || roomDeluxe}
                      alt={r.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground group-hover:text-gold transition-colors">{r.name}</h3>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {hotelConfig.currency} {r.price.toLocaleString()} / night
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RoomDetailPage;
