import { MapPin, Clock, Star, Phone } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">About Us</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Silver Hotel Kigali</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Nestled in the Gasabo district of Kigali, Silver Hotel offers a perfect blend of modern comfort and
              warm African hospitality. Our 3-star hotel provides an ideal base for both business and leisure
              travelers exploring Rwanda's vibrant capital.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Located near the Kigali Genocide Memorial and the bustling Kimironko Market, we offer easy access
              to the city's most important landmarks and cultural attractions.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <Star className="w-5 h-5 text-gold fill-gold" />
              <Star className="w-5 h-5 text-gold fill-gold" />
              <Star className="w-5 h-5 text-gold/40" />
              <Star className="w-5 h-5 text-gold/40" />
              <span className="font-body text-sm text-muted-foreground ml-2">3.8 / 5 (87 reviews)</span>
            </div>
          </div>

          <div className="space-y-5">
            {[
              { icon: MapPin, title: "Location", text: "KG 48 St, Kigali, Rwanda" },
              { icon: Phone, title: "Phone", text: "0781 088 725" },
              { icon: Clock, title: "Check-in", text: "From 16:00" },
              { icon: Clock, title: "Check-out", text: "Until 11:00" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="font-body text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
