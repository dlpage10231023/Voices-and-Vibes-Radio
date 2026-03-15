-- Add track metadata columns for artist showcase
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS artist_name text;
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS song_title text;
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS album_name text;
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS album_art_url text;

-- Create album-art storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('album-art', 'album-art', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policies for album-art bucket
CREATE POLICY "Public read album-art" ON storage.objects FOR SELECT TO public USING (bucket_id = 'album-art');
CREATE POLICY "Public insert album-art" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'album-art');
CREATE POLICY "Public delete album-art" ON storage.objects FOR DELETE TO public USING (bucket_id = 'album-art');