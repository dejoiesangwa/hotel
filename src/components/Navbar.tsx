import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { hotelConfig } from "@/config/hotel";

const navLinks = [
  { label: "Home", href: "/#" },
  { label: "Rooms", href: "/#rooms" },
  { label: "Amenities", href: "/#amenities" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-dark/90 backdrop-blur-md border-b border-gold/20">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <a href="#" className="font-heading text-xl font-bold text-primary-foreground">
          {hotelConfig.name}<span className="text-gold"> {hotelConfig.nameSuffix}</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-body text-sm text-nav-link hover:text-nav-link-hover transition-colors tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href={hotelConfig.phoneHref} className="flex items-center gap-2 text-gold text-sm font-body">
            <Phone className="w-4 h-4" />
            {hotelConfig.phone}
          </a>
          <a
            href="#booking"
            className="gold-gradient px-5 py-2 rounded-md text-sm font-body font-medium text-primary-foreground"
          >
            Book Now
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-primary-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-warm-dark/95 backdrop-blur-md border-t border-gold/20 px-4 pb-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-body text-nav-link hover:text-nav-link-hover transition-colors border-b border-gold/10"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={() => setOpen(false)}
            className="block mt-4 text-center gold-gradient px-5 py-2.5 rounded-md font-body font-medium text-primary-foreground"
          >
            Book Now
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
