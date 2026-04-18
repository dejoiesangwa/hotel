import { useEffect, useState } from "react";
import { Users, Bed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hotelConfig } from "@/config/hotel";
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
  features: string[];
  is_available: boolean;
};

const RoomsSection = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    supabase.from("rooms").select("*").eq("is_available", true).order("price").then(({ data }) => {
      if (data) setRooms(data as Room[]);
    });
  }, []);

  return (
    <section id="rooms" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Accommodation</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Our Rooms</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-lg mx-auto">
            Each room is designed to offer you the ultimate comfort during your stay in {hotelConfig.city}.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative overflow-hidden h-56">
                <img
                  src={room.image_url || fallbackImages[room.name] || roomDeluxe}
                  alt={room.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 gold-gradient px-3 py-1 rounded-full">
                  <span className="font-body text-sm font-semibold text-primary-foreground">
                    {hotelConfig.currency} {room.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{room.name}</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">{room.description}</p>

                {/* Capacity badge */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-body font-medium">
                    <Users className="w-4 h-4" />
                    {room.capacity === 1 ? "1 Person" : `${room.capacity} People`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" /> {room.bed_type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {room.features.map((f) => (
                    <span key={f} className="text-xs font-body bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
                <a href="#booking" className="block text-center gold-gradient px-4 py-2.5 rounded-md font-body font-medium text-primary-foreground text-sm hover:opacity-90 transition-opacity">
                  Book This Room
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
