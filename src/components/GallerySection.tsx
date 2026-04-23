import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

const staticImages: GalleryImage[] = [
  {
    id: "1",
    image_url: "/src/assets/room-deluxe.jpg",
    caption: "Deluxe Room",
  },
  {
    id: "2",
    image_url: "/src/assets/room-suite.jpg",
    caption: "Executive Suite",
  },
  {
    id: "3",
    image_url: "/src/assets/room-twin.jpg",
    caption: "Twin Room",
  },
  {
    id: "4",
    image_url: "/src/assets/hotel-hero.jpg",
    caption: "Hotel Exterior",
  },
  {
    id: "5",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    caption: "Luxury Lobby",
  },
  {
    id: "6",
    image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
    caption: "Infinity Pool",
  },
  {
    id: "7",
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
    caption: "Gourmet Dining",
  },
  {
    id: "8",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800",
    caption: "Spa & Wellness",
  },
];

const GallerySection = () => {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Our Hotel</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Gallery</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-lg mx-auto">
            Explore our spaces, rooms, and amenities through the lens of our guests and team.
          </p>
        </div>

        {staticImages.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg max-w-md mx-auto">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-body text-muted-foreground text-sm">No photos yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {staticImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setLightbox(img)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <img
                  src={img.image_url}
                  alt={img.caption || "Hotel photo"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-body text-xs text-white">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightbox.image_url}
            alt={lightbox.caption || "Hotel photo"}
            className="max-h-[90vh] max-w-full object-contain"
          />
          {lightbox.caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center font-body text-sm text-white px-4">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default GallerySection;
