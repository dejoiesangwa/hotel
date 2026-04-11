import { Users, Bed, Wifi, Car } from "lucide-react";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomTwin from "@/assets/room-twin.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const rooms = [
  {
    name: "Deluxe Double Room",
    image: roomDeluxe,
    price: "30,984",
    description: "Spacious room with a king-size bed, modern amenities, and a warm ambiance perfect for couples or solo travelers.",
    guests: 2,
    bed: "1 King Bed",
    features: ["Free Wi-Fi", "Free Parking", "Breakfast Included"],
  },
  {
    name: "Twin Room",
    image: roomTwin,
    price: "49,574",
    description: "Comfortable room featuring two twin beds, ideal for friends or colleagues traveling together.",
    guests: 2,
    bed: "2 Twin Beds",
    features: ["Free Wi-Fi", "Free Parking", "Breakfast Included"],
  },
  {
    name: "Executive Suite",
    image: roomSuite,
    price: "75,000",
    description: "Our premium suite with a separate living area, premium furnishings, and panoramic views of Kigali.",
    guests: 3,
    bed: "1 King Bed + Sofa",
    features: ["Free Wi-Fi", "Free Parking", "Breakfast", "Mini Bar"],
  },
];

const RoomsSection = () => {
  return (
    <section id="rooms" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Accommodation</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Our Rooms</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-lg mx-auto">
            Each room is designed to offer you the ultimate comfort during your stay in Kigali.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative overflow-hidden h-56">
                <img
                  src={room.image}
                  alt={room.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 gold-gradient px-3 py-1 rounded-full">
                  <span className="font-body text-sm font-semibold text-primary-foreground">
                    RF {room.price}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{room.name}</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">{room.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.guests}</span>
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {room.bed}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {room.features.map((f) => (
                    <span key={f} className="text-xs font-body bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
                <a
                  href="#booking"
                  className="block text-center gold-gradient px-4 py-2.5 rounded-md font-body font-medium text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                >
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
