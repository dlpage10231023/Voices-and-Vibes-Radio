
CREATE TABLE public.artist_spotlight (
  id uuid PRIMARY KEY DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid,
  audio_url text,
  image_url text,
  title text DEFAULT '',
  artist text DEFAULT '',
  album text DEFAULT '',
  year text DEFAULT '',
  status text DEFAULT 'featured',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.artist_spotlight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read spotlight" ON public.artist_spotlight FOR SELECT USING (true);
CREATE POLICY "Anyone can insert spotlight" ON public.artist_spotlight FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update spotlight" ON public.artist_spotlight FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete spotlight" ON public.artist_spotlight FOR DELETE USING (true);

CREATE TRIGGER update_artist_spotlight_updated_at
BEFORE UPDATE ON public.artist_spotlight
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
