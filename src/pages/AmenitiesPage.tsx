import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { hotelConfig } from "@/config/hotel";
import {
  Wifi, Car, UtensilsCrossed, Waves, Wind, Accessibility,
  Coffee, Shield, Dumbbell, Flower2, Globe, Phone, ChefHat,
  Baby, ParkingCircle, MonitorPlay, Scissors, BriefcaseMedical, Sparkles
} from "lucide-react";
import heroImg from "@/assets/hotel-hero.jpg";

const amenities = [
  {
    icon: Wifi,
    label: "Free High-Speed Wi-Fi",
    desc: "Stay connected with complimentary fibre-optic internet throughout the property — in rooms, lobbies, restaurant, and pool areas.",
    category: "Connectivity"
  },
  {
    icon: Car,
    label: "Free Secure Parking",
    desc: "Complimentary on-site parking with 24/7 security surveillance for complete peace of mind during your stay.",
    category: "Transport"
  },
  {
    icon: UtensilsCrossed,
    label: "Daily Breakfast",
    desc: "Start your morning with a freshly prepared continental or full breakfast, served daily in our dining room.",
    category: "Dining"
  },
  {
    icon: Waves,
    label: "Outdoor Swimming Pool",
    desc: "Take a refreshing dip in our sparkling outdoor pool, surrounded by lush gardens and a sun lounger terrace.",
    category: "Recreation"
  },
  {
    icon: Wind,
    label: "Climate Control",
    desc: "All rooms feature individually controlled air conditioning and heating for your perfect temperature.",
    category: "Comfort"
  },
  {
    icon: Accessibility,
    label: "Accessible Facilities",
    desc: "Wheelchair-friendly rooms, ramps, and facilities throughout the hotel to ensure everyone feels welcome.",
    category: "Accessibility"
  },
  {
    icon: Coffee,
    label: "24/7 Room Service",
    desc: "Order food, drinks, and amenities directly to your room at any hour with our round-the-clock room service.",
    category: "Dining"
  },
  {
    icon: Shield,
    label: "24/7 Security",
    desc: "Our dedicated security team and CCTV system ensure a safe and secure environment throughout your stay.",
    category: "Safety"
  },
  {
    icon: Dumbbell,
    label: "Fitness Centre",
    desc: "Keep up with your workout routine in our modern gym, equipped with cardio and strength-training equipment.",
    category: "Recreation"
  },
  {
    icon: Flower2,
    label: "Garden & Terrace",
    desc: "Relax in our beautifully landscaped gardens and open terrace — perfect for morning coffee or evening drinks.",
    category: "Recreation"
  },
  {
    icon: Globe,
    label: "Concierge Service",
    desc: "Our multilingual concierge team is available around the clock to assist with tours, transfers, and reservations.",
    category: "Service"
  },
  {
    icon: ChefHat,
    label: "Restaurant & Bar",
    desc: "Enjoy locally-inspired cuisine and international dishes in our à la carte restaurant, paired with fine wines.",
    category: "Dining"
  },
  {
    icon: Baby,
    label: "Family Friendly",
    desc: "Child-friendly meals, babysitting on request, and family suites designed with younger guests in mind.",
    category: "Family"
  },
  {
    icon: MonitorPlay,
    label: "Business Centre",
    desc: "Fully equipped business centre with printing, meeting rooms, and high-speed connectivity for corporate guests.",
    category: "Business"
  },
  {
    icon: Scissors,
    label: "Laundry & Dry Cleaning",
    desc: "Same-day laundry and professional dry-cleaning service available for all guests.",
    category: "Service"
  },
  {
    icon: BriefcaseMedical,
    label: "Medical Assistance",
    desc: "24/7 access to on-call medical support and first aid — your health and safety are our priority.",
    category: "Safety"
  },
];

const categories = Array.from(new Set(amenities.map(a => a.category)));

const AmenitiesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="Hotel Amenities" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-3">What We Offer</p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">Hotel Amenities</h1>
          <p className="font-body text-white/80 max-w-xl mx-auto text-base">
            Every amenity thoughtfully curated for an extraordinary stay in {hotelConfig.city}.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-warm-dark border-b border-gold/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "16+", label: "Amenities & Services" },
              { value: "24/7", label: "Guest Support" },
              { value: "100%", label: "Free Wi-Fi Coverage" },
              { value: "3★", label: "Star-Rated Hotel" },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-heading text-3xl font-bold text-gold">{s.value}</p>
                <p className="font-body text-sm text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities by category */}
      <section className="py-20 container mx-auto px-4 max-w-7xl">
        {categories.map((cat) => (
          <div key={cat} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-0.5 bg-gold" />
              <p className="text-gold font-body text-xs tracking-[0.2em] uppercase font-semibold">{cat}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {amenities.filter(a => a.category === cat).map((amenity) => (
                <div
                  key={amenity.label}
                  className="flex gap-5 bg-card border border-border rounded-2xl p-6 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10 transition-colors">
                    <amenity.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1.5">{amenity.label}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{amenity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-warm-dark py-16 border-t border-gold/20">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold text-white mb-3">Ready to Experience It All?</h2>
          <p className="font-body text-white/60 mb-8 max-w-md mx-auto">Book your stay and enjoy every amenity {hotelConfig.fullName} has to offer.</p>
          <a href="/#booking" className="inline-block gold-gradient px-10 py-3.5 rounded-md font-body font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            Book Your Stay
          </a>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
};

export default AmenitiesPage;
