import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-warm-dark py-14 border-t border-gold/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary-foreground mb-3">
              Silver<span className="text-gold"> Hotel</span>
            </h3>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">
              Your home away from home in the heart of Kigali, Rwanda. Experience comfort, hospitality, and African warmth.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-primary-foreground mb-3">Quick Links</h4>
            <div className="space-y-2">
              {["Rooms", "Amenities", "About", "Book Now"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(" ", "")}`}
                  className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-primary-foreground mb-3">Contact</h4>
            <div className="space-y-3">
              <p className="flex items-start gap-2 font-body text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                KG 48 St, Kigali, Rwanda
              </p>
              <p className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                0781 088 725
              </p>
              <p className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                info@silverhotelkigali.com
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-6 text-center">
          <p className="font-body text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Silver Hotel Kigali. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
