import { useEffect, useState } from "react";
import { Sparkles, UtensilsCrossed } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { hotelConfig } from "@/config/hotel";

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

  useEffect(() => {
    supabase
      .from("menu_categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => data && setCategories(data as Category[]));
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("sort_order")
      .then(({ data }) => data && setItems(data as Item[]));
  }, []);

  const specials = items.filter((i) => i.is_special);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="pt-28 pb-12 bg-warm-dark text-center px-4">
        <UtensilsCrossed className="w-10 h-10 text-gold mx-auto mb-3" />
        <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Restaurant</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground">
          Food &amp; Drink Menu
        </h1>
        <p className="font-body text-primary-foreground/60 mt-3 max-w-xl mx-auto text-sm">
          Fresh, locally-sourced ingredients prepared by our chefs at {hotelConfig.fullName}.
        </p>
      </header>

      <main className="container mx-auto px-4 max-w-5xl py-12 space-y-14">
        {specials.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Today's Specials</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {specials.map((item) => (
                <div key={item.id} className="bg-card border-2 border-gold/40 rounded-xl p-5 flex gap-4 relative">
                  <span className="absolute -top-2 left-4 bg-gold text-primary-foreground text-xs font-body font-semibold px-2.5 py-0.5 rounded-full">
                    Special
                  </span>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{item.name}</h3>
                      <span className="font-body font-semibold text-gold whitespace-nowrap">
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

        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">{cat.name}</h2>
              <div className="h-0.5 w-16 bg-gold mb-6" />
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                {catItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-border last:border-b-0">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <h3 className="font-body font-semibold text-foreground">{item.name}</h3>
                        <span className="font-body font-semibold text-gold whitespace-nowrap text-sm">
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
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground">Our menu will be available shortly.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;
