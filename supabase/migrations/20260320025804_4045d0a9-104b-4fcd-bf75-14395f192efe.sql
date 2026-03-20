
CREATE TABLE public.new_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name text NOT NULL DEFAULT '',
  track_title text NOT NULL DEFAULT '',
  track_subtitle text NOT NULL DEFAULT '',
  genres text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  image_url text,
  audio_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.new_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read new_artists" ON public.new_artists FOR SELECT USING (true);
CREATE POLICY "Anyone can insert new_artists" ON public.new_artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update new_artists" ON public.new_artists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete new_artists" ON public.new_artists FOR DELETE USING (true);

CREATE TRIGGER update_new_artists_updated_at
  BEFORE UPDATE ON public.new_artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
