import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("id, image_url, caption")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setImages(data as GalleryImage[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="gallery" className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Our Hotel</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Gallery</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-lg mx-auto">
            Explore our spaces, rooms, and amenities through the lens of our guests and team.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground font-body">Loading…</p>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg max-w-md mx-auto">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-body text-muted-foreground text-sm">No photos yet. Check back soon.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(img)}
                className={`group relative w-full overflow-hidden rounded-2xl bg-secondary mb-4 break-inside-avoid shadow-md hover:shadow-2xl transition-all duration-500 ${
                  i % 3 === 0 ? 'aspect-[4/5]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[3/4]'
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
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <p className="font-body text-sm text-white font-medium">{img.caption}</p>
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
