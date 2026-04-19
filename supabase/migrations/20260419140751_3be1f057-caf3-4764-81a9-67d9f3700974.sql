ALTER TABLE public.hotel_settings
  ADD COLUMN IF NOT EXISTS star_rating numeric NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS review_score numeric NOT NULL DEFAULT 3.8,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 87;