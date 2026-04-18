import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { hotelConfig } from "@/config/hotel";

const Footer = () => {
  return (
    <footer id="contact" className="bg-warm-dark py-14 border-t border-gold/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary-foreground mb-3">
              {hotelConfig.name}<span className="text-gold"> {hotelConfig.nameSuffix}</span>
            </h3>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">
              {hotelConfig.shortDescription}
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
                {hotelConfig.address}
              </p>
              <p className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                {hotelConfig.phone}
              </p>
              <p className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                {hotelConfig.email}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-6 flex items-center justify-between">
          <p className="font-body text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} {hotelConfig.fullName}. All rights reserved.
          </p>
          <Link to="/admin/login" className="font-body text-xs text-primary-foreground/30 hover:text-gold transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
