import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    document.title = "Gallery — Hotel Photos";
    (async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("id, image_url, caption")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (data) setImages(data as GalleryImage[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-gold mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <header className="text-center mb-10">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-2">
            Our Hotel
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            Gallery
          </h1>
          <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">
            Explore our spaces, rooms, and amenities through the lens of our
            guests and team.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-muted-foreground font-body">Loading…</p>
        ) : images.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground">
              No photos yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((img) => (
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
      </main>

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

      <Footer />
    </div>
  );
};

export default Gallery;
