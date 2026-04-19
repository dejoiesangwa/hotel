-- Gallery images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert gallery"
  ON public.gallery_images FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery"
  ON public.gallery_images FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gallery"
  ON public.gallery_images FOR DELETE TO authenticated
  USING (true);

-- Public storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated can upload gallery images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated can update gallery images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated can delete gallery images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery-images');