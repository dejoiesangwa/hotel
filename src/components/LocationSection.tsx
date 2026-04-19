import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { hotelConfig } from "@/config/hotel";

const LocationSection = () => {
  const { latitude, longitude, zoom } = hotelConfig.map;
  // Embedded Google Maps (no API key needed)
  const mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <section id="location" className="py-20 bg-warm-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Find Us</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Our Location
          </h2>
          <p className="font-body text-muted-foreground mt-3 max-w-2xl mx-auto">
            Conveniently located in {hotelConfig.district}, {hotelConfig.city}.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Map */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden border border-border shadow-lg bg-card">
            <iframe
              title={`Map showing ${hotelConfig.fullName}`}
              src={mapSrc}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[420px] border-0"
            />
          </div>

          {/* Contact details */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
            <h3 className="font-heading text-xl font-bold text-foreground mb-1">
              {hotelConfig.fullName}
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-foreground">Address</h4>
                <p className="font-body text-sm text-muted-foreground">{hotelConfig.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-foreground">Phone</h4>
                <a href={hotelConfig.phoneHref} className="font-body text-sm text-muted-foreground hover:text-gold">
                  {hotelConfig.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-foreground">Email</h4>
                <a href={`mailto:${hotelConfig.email}`} className="font-body text-sm text-muted-foreground hover:text-gold break-all">
                  {hotelConfig.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-foreground">Reception Hours</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Check-in: {hotelConfig.checkInTime}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Check-out: {hotelConfig.checkOutTime}
                </p>
              </div>
            </div>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full gold-gradient text-primary-foreground font-body font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
