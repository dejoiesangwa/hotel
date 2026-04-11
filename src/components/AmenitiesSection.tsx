import { Wifi, Car, UtensilsCrossed, Waves, Wind, Accessibility, Coffee, Shield } from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Free Wi-Fi", desc: "High-speed internet throughout" },
  { icon: Car, label: "Free Parking", desc: "Secure on-site parking" },
  { icon: UtensilsCrossed, label: "Free Breakfast", desc: "Daily continental breakfast" },
  { icon: Waves, label: "Swimming Pool", desc: "Outdoor pool with lounge" },
  { icon: Wind, label: "Air Conditioning", desc: "Climate-controlled rooms" },
  { icon: Accessibility, label: "Accessible", desc: "Wheelchair-friendly facilities" },
  { icon: Coffee, label: "Room Service", desc: "24/7 in-room dining" },
  { icon: Shield, label: "24/7 Security", desc: "Round-the-clock safety" },
];

const AmenitiesSection = () => {
  return (
    <section id="amenities" className="py-20 bg-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">What We Offer</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Hotel Amenities</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.map((a) => (
            <div
              key={a.label}
              className="bg-card rounded-lg p-6 text-center border border-border hover:border-gold/40 transition-colors group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <a.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{a.label}</h3>
              <p className="font-body text-xs text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
