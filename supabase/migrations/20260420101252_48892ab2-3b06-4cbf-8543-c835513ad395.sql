
-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated can view all testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can submit testimonial"
  ON public.testimonials FOR INSERT
  WITH CHECK (is_approved = false);

CREATE POLICY "Authenticated can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (true);

-- Menu categories
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage menu categories"
  ON public.menu_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Menu items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  is_special BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage menu items"
  ON public.menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default menu categories
INSERT INTO public.menu_categories (name, sort_order) VALUES
  ('Starters', 1),
  ('Main Courses', 2),
  ('Desserts', 3),
  ('Drinks', 4);
