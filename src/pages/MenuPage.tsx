import { useEffect, useState } from "react";
import { Sparkles, UtensilsCrossed, Wine, Coffee, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hotelConfig } from "@/config/hotel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hotel-hero.jpg";

type Category = { id: string; name: string; sort_order: number };
type Item = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_special: boolean;
  is_available: boolean;
};

const MenuPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [catsData, itemsData] = await Promise.all([
        supabase.from("menu_categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").eq("is_available", true).order("sort_order"),
      ]);

      if (catsData.data) setCategories(catsData.data as Category[]);
      if (itemsData.data) setItems(itemsData.data as Item[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const specials = items.filter((i) => i.is_special);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Culinary Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Fine Dining at Silver Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <UtensilsCrossed className="w-12 h-12 text-gold mx-auto mb-4 animate-bounce" />
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">
            Dining Experience
          </h1>
          <p className="font-body text-gold-light tracking-[0.2em] uppercase text-sm">
            Local Flavors, Global Standards
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4 max-w-6xl">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-body text-muted-foreground">Preparing our menu...</p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Intro Text */}
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">A Symphony of Taste</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                Our culinary team at {hotelConfig.name} is dedicated to bringing you the finest ingredients, sourced locally from Rwandan farmers and prepared with international techniques. Whether you're looking for a hearty breakfast, a business lunch, or a romantic dinner, our menu has something for every palate.
              </p>
              <div className="flex justify-center gap-8 text-gold">
                 <div className="flex flex-col items-center gap-1">
                    <Coffee className="w-6 h-6" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Breakfast</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <Utensils className="w-6 h-6" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Lunch & Dinner</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <Wine className="w-6 h-6" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Bar & Drinks</span>
                 </div>
              </div>
            </div>

            {/* Specials */}
            {specials.length > 0 && (
              <section>
                <div className="flex items-center justify-center gap-3 mb-12">
                  <div className="h-px w-12 bg-gold/30" />
                  <Sparkles className="w-6 h-6 text-gold" />
                  <h3 className="font-heading text-3xl font-bold text-foreground">Chef's Recommendations</h3>
                  <Sparkles className="w-6 h-6 text-gold" />
                  <div className="h-px w-12 bg-gold/30" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {specials.map((item) => (
                    <div key={item.id} className="bg-card border border-gold/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
                      {item.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-heading text-xl font-bold text-foreground">{item.name}</h4>
                          <span className="font-body font-bold text-gold">
                            {hotelConfig.currency} {item.price.toLocaleString()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="font-body text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            <div className="grid lg:grid-cols-2 gap-x-16 gap-y-24">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category_id === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <section key={cat.id}>
                    <div className="flex items-center gap-4 mb-10">
                      <h3 className="font-heading text-3xl font-bold text-foreground">{cat.name}</h3>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="space-y-8">
                      {catItems.map((item) => (
                        <div key={item.id} className="flex gap-6 group">
                          {item.image_url && (
                            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-border group-hover:border-gold transition-colors">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline gap-4 mb-1">
                              <h4 className="font-body font-bold text-foreground group-hover:text-gold transition-colors">{item.name}</h4>
                              <div className="flex-1 border-b border-dotted border-border mx-2 translate-y-[-4px]" />
                              <span className="font-body font-bold text-gold whitespace-nowrap">
                                {hotelConfig.currency} {item.price.toLocaleString()}
                              </span>
                            </div>
                            {item.description && (
                              <p className="font-body text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {items.length === 0 && !loading && (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                <UtensilsCrossed className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-body text-muted-foreground italic">Our menu is currently being updated. Please check back soon.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default MenuPage;
