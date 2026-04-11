
-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  bed_type TEXT NOT NULL DEFAULT '1 King Bed',
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Everyone can view available rooms
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);

-- Only authenticated users (receptionists) can manage rooms
CREATE POLICY "Authenticated users can insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rooms" ON public.rooms FOR DELETE TO authenticated USING (true);

-- Create hotel settings table (single row for config)
CREATE TABLE public.hotel_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reception_email TEXT NOT NULL DEFAULT 'info@silverhotelkigali.com',
  hotel_name TEXT NOT NULL DEFAULT 'Silver Hotel Kigali',
  phone TEXT DEFAULT '+250 781 088 725',
  check_in_time TEXT DEFAULT '16:00',
  check_out_time TEXT DEFAULT '11:00',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.hotel_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update settings" ON public.hotel_settings FOR UPDATE TO authenticated USING (true);

-- Insert default settings
INSERT INTO public.hotel_settings (reception_email, hotel_name, phone) VALUES ('info@silverhotelkigali.com', 'Silver Hotel Kigali', '+250 781 088 725');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  room_id UUID REFERENCES public.rooms(id),
  room_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a booking
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- Only authenticated users can view/manage bookings
CREATE POLICY "Authenticated users can view bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);

-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

CREATE POLICY "Anyone can view room images" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');
CREATE POLICY "Authenticated users can upload room images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'room-images');
CREATE POLICY "Authenticated users can update room images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'room-images');
CREATE POLICY "Authenticated users can delete room images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'room-images');

-- Seed initial rooms
INSERT INTO public.rooms (name, description, price, capacity, bed_type, features) VALUES
  ('Deluxe Double Room', 'Spacious room with a king-size bed, modern amenities, and a warm ambiance perfect for couples or solo travelers.', 30984, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Free Parking', 'Breakfast Included']),
  ('Twin Room', 'Comfortable room featuring two twin beds, ideal for friends or colleagues traveling together.', 49574, 2, '2 Twin Beds', ARRAY['Free Wi-Fi', 'Free Parking', 'Breakfast Included']),
  ('Executive Suite', 'Our premium suite with a separate living area, premium furnishings, and panoramic views of Kigali.', 75000, 3, '1 King Bed + Sofa', ARRAY['Free Wi-Fi', 'Free Parking', 'Breakfast', 'Mini Bar']);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.hotel_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
