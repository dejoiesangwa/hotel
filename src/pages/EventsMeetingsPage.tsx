import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { useParams, Link } from "react-router-dom";
import { Users, Calendar, Briefcase, Sparkles, Wifi, Coffee, Mic, Projector, Check } from "lucide-react";
import heroImg from "@/assets/hotel-hero.jpg";
import { hotelConfig } from "@/config/hotel";

type Variant = "events" | "meetings";

const content: Record<Variant, {
  title: string;
  kicker: string;
  intro: string;
  highlights: { icon: any; title: string; desc: string }[];
  capacities: { name: string; seats: string; style: string }[];
  inclusions: string[];
}> = {
  events: {
    title: "Weddings & Events",
    kicker: "Celebrations to remember",
    intro:
      "From intimate gatherings to lavish weddings, our team curates unforgettable experiences in elegant indoor halls and lush outdoor settings — backed by gourmet catering and dedicated event planners.",
    highlights: [
      { icon: Sparkles, title: "Bespoke Décor", desc: "Florals, lighting and theme styling tailored to your vision." },
      { icon: Users, title: "Up to 250 Guests", desc: "Flexible spaces for ceremonies, receptions and private dinners." },
      { icon: Coffee, title: "Gourmet Catering", desc: "Custom menus crafted by our executive chef." },
      { icon: Calendar, title: "Full Coordination", desc: "A dedicated planner from your first visit to send-off." },
    ],
    capacities: [
      { name: "Grand Ballroom", seats: "250", style: "Banquet / Wedding" },
      { name: "Garden Terrace", seats: "120", style: "Cocktail / Outdoor" },
      { name: "Private Lounge", seats: "40", style: "Intimate Dinner" },
    ],
    inclusions: [
      "Event planner & on-site coordinator",
      "Custom multi-course menu tasting",
      "Stage, lighting & PA system",
      "Bridal suite for the couple",
      "Complimentary parking for guests",
      "Late check-out for the wedding party",
    ],
  },
  meetings: {
    title: "Meetings & Conferences",
    kicker: "Productive spaces, polished service",
    intro:
      "Host high-impact meetings, board sessions and corporate conferences in fully-equipped venues with high-speed connectivity, modern AV and tailored business catering.",
    highlights: [
      { icon: Projector, title: "4K Projectors & Screens", desc: "Professional AV in every room." },
      { icon: Wifi, title: "Fibre-Optic WiFi", desc: "Reliable, dedicated bandwidth for your team." },
      { icon: Mic, title: "Conference Tech", desc: "Wireless mics, podiums and live streaming on request." },
      { icon: Briefcase, title: "Executive Service", desc: "Dedicated host, business centre and printing support." },
    ],
    capacities: [
      { name: "Executive Boardroom", seats: "16", style: "Boardroom" },
      { name: "Conference Hall A", seats: "80", style: "Theatre" },
      { name: "Strategy Room", seats: "30", style: "U-Shape / Classroom" },
    ],
    inclusions: [
      "High-speed dedicated WiFi",
      "Projector, screen & flipcharts",
      "Notepads, pens & still water",
      "Two coffee breaks with pastries",
      "Working lunch buffet",
      "Free parking for delegates",
    ],
  },
};

const EventsMeetingsPage = () => {
  const { type } = useParams<{ type: string }>();
  const variant: Variant = type === "meetings" ? "meetings" : "events";
  const data = content[variant];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[460px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt={data.title} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold-light tracking-[0.3em] uppercase text-xs font-body mb-3">{data.kicker}</p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">{data.title}</h1>
          <p className="font-body text-white/80 max-w-2xl mx-auto">{data.intro}</p>

          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/events/events" className={`px-5 py-2.5 rounded-md font-body text-sm border ${variant === "events" ? "gold-gradient text-primary-foreground border-transparent" : "border-white/40 text-white hover:bg-white/10"}`}>Events</Link>
            <Link to="/events/meetings" className={`px-5 py-2.5 rounded-md font-body text-sm border ${variant === "meetings" ? "gold-gradient text-primary-foreground border-transparent" : "border-white/40 text-white hover:bg-white/10"}`}>Meetings</Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.highlights.map((h) => (
            <div key={h.title} className="bg-card border border-border rounded-2xl p-6 hover:border-gold/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-gold mb-4">
                <h.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{h.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capacities */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.2em] uppercase font-body mb-2">Venues</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Spaces & Capacities</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 text-foreground font-heading">Venue</th>
                  <th className="py-4 text-foreground font-heading">Setup</th>
                  <th className="py-4 text-foreground font-heading text-right">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {data.capacities.map((c) => (
                  <tr key={c.name} className="border-b border-border/50">
                    <td className="py-4 text-foreground">{c.name}</td>
                    <td className="py-4 text-muted-foreground text-sm">{c.style}</td>
                    <td className="py-4 text-gold font-bold text-right">{c.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs tracking-[0.2em] uppercase font-body mb-2">Package Inclusions</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Everything you need, taken care of</h2>
            <ul className="space-y-3">
              {data.inclusions.map((i) => (
                <li key={i} className="flex items-start gap-3 font-body text-muted-foreground">
                  <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-warm-dark rounded-2xl p-8 border border-gold/20">
            <h3 className="font-heading text-2xl font-bold text-white mb-3">Enquire Now</h3>
            <p className="font-body text-white/70 text-sm mb-6">
              Tell us about your {variant === "events" ? "event" : "meeting"} and our team will reply within 24 hours with a tailored proposal.
            </p>
            <a
              href={hotelConfig.phoneHref}
              className="block text-center gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity mb-3"
            >
              Call {hotelConfig.phone}
            </a>
            <a
              href={`mailto:${hotelConfig.email}?subject=${encodeURIComponent(data.title + " enquiry")}`}
              className="block text-center border border-gold/40 text-gold px-6 py-3 rounded-md font-body font-medium hover:bg-gold/10 transition-colors"
            >
              Email Our Team
            </a>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
};

export default EventsMeetingsPage;
