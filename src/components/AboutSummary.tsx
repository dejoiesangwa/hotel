import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hotel-hero.jpg";
import { hotelConfig } from "@/config/hotel";

const AboutSummary = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
            <img
              src={heroImg}
              alt={`Inside ${hotelConfig.fullName}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
          </div>

          <div>
            <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">About Us</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-5">
              Where Comfort Meets Rwandan Hospitality
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              Nestled in the heart of {hotelConfig.city}, {hotelConfig.fullName} blends modern luxury with authentic warmth.
              From beautifully appointed rooms to gourmet dining and personalised service, every detail is crafted
              for a memorable stay.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Discover our story, philosophy, and what makes us {hotelConfig.city}'s preferred destination.
            </p>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSummary;
