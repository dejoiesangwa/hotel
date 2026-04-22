import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hotelConfig } from "@/config/hotel";
import heroImg from "@/assets/hotel-hero.jpg";
import { Star, Target, Shield, Award, Users } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="About Silver Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            Our Story
          </h1>
          <p className="font-body text-gold-light tracking-[0.2em] uppercase text-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Excellence & Hospitality since 2010
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Heritage</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">The Journey of {hotelConfig.name}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="font-body text-muted-foreground leading-relaxed">
                Founded in the heart of Kigali, {hotelConfig.fullName} began as a vision to create a sanctuary where modern luxury meets authentic Rwandan hospitality. What started as a boutique guesthouse has grown into a premier destination for travelers from across the globe.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Over the past decade, we have remained committed to our core mission: providing an unparalleled experience that celebrates the vibrant culture and breathtaking beauty of the "Land of a Thousand Hills."
              </p>
            </div>
            <div className="bg-warm-dark p-8 rounded-2xl border border-gold/20 shadow-xl">
              <h3 className="font-heading text-2xl font-bold text-white mb-4 italic">"Hospitality is not just our business, it's our heritage."</h3>
              <p className="font-body text-gold-light text-sm">— The Founders of {hotelConfig.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Philosophy</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Core Values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Target, title: "Excellence", desc: "We strive for perfection in every detail of your stay." },
              { icon: Shield, title: "Integrity", desc: "Honesty and transparency are the foundations of our service." },
              { icon: Users, title: "Community", desc: "We support local talent and sustainable Rwandan initiatives." },
              { icon: Award, title: "Hospitality", desc: "Authentic warmth and personalized care for every guest." },
            ].map((value, i) => (
              <div key={i} className="text-center p-6 space-y-4 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto text-gold">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">{value.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
             <img src={heroImg} alt="Hotel interior" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                   {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-gold fill-gold" />)}
                </div>
                <p className="text-white font-heading text-xl font-bold">Consistently rated as Kigali's top Choice</p>
             </div>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Why Stay With Us</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Unique Selling Points</h2>
            </div>

            <ul className="space-y-6">
              {[
                { title: "Prime Location", desc: "Situated in Gasabo district, we are minutes away from the city center and major attractions." },
                { title: "Gourmet Dining", desc: "Our restaurant features world-class chefs specializing in both local and international cuisine." },
                { title: "Premium Comfort", desc: "Every room is equipped with high-end linens, smart features, and breathtaking views." },
                { title: "Bespoke Service", desc: "From airport transfers to custom city tours, our concierge is at your service 24/7." },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-body font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
