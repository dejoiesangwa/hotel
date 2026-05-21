import { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hotel-hero.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomTwin from "@/assets/room-twin.jpg";
import roomSuite from "@/assets/room-suite.jpg";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  category?: string;
};

const FILTERS = [
  "All",
  "Rooms & Suites",
  "Events",
  "Meetings",
  "Swimming Pool",
  "Dining",
  "Exterior",
];

// Fallback images for demo when no DB images
const FALLBACK_IMAGES: GalleryImage[] = [
  { id: "f1", image_url: roomDeluxe, caption: "Deluxe Double Room", category: "Rooms & Suites" },
  { id: "f2", image_url: roomTwin, caption: "Twin Room", category: "Rooms & Suites" },
  { id: "f3", image_url: roomSuite, caption: "Executive Suite", category: "Rooms & Suites" },
  { id: "f4", image_url: heroImg, caption: "Hotel Exterior", category: "Exterior" },
  { id: "f5", image_url: roomDeluxe, caption: "Banquet Setup", category: "Events" },
  { id: "f6", image_url: heroImg, caption: "Conference Room", category: "Meetings" },
  { id: "f7", image_url: roomSuite, caption: "Pool Area", category: "Swimming Pool" },
  { id: "f8", image_url: roomTwin, caption: "Restaurant Dining", category: "Dining" },
];

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("id, image_url, caption")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setImages(data as GalleryImage[]);
        } else {
          setImages(FALLBACK_IMAGES);
        }
        setLoading(false);
      });
  }, []);

  const filtered = activeFilter === "All"
    ? images
    : images.filter(img => img.category === activeFilter || (img.caption && img.caption.toLowerCase().includes(activeFilter.toLowerCase())));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="Hotel Gallery" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-3">Visual Journey</p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">Our Gallery</h1>
          <p className="font-body text-white/75 max-w-lg mx-auto">
            Discover the beauty of Silver Hotel Kigali through every room, event, and experience.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-0">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-5 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  activeFilter === f
                    ? "bg-gold text-white shadow-md"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="py-16 container mx-auto px-4">
        {loading ? (
          <p className="text-center text-muted-foreground font-body py-20">Loading gallery…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-lg max-w-md mx-auto">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-body text-muted-foreground">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(img)}
                className={`group relative w-full overflow-hidden rounded-2xl bg-secondary mb-4 break-inside-avoid shadow-md hover:shadow-2xl transition-all duration-500 ${
                  i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[3/4]"
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.caption || "Hotel photo"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                    <p className="font-body text-sm text-white font-medium">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox.image_url}
            alt={lightbox.caption || "Hotel photo"}
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center font-body text-sm text-white/80 px-4">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}

      <ContactSection />
      <Footer />
    </div>
  );
};

export default GalleryPage;
