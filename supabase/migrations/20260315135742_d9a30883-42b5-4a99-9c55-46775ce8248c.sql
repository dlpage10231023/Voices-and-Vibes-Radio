-- Add media_type column to day_audio table
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'audio';

-- Create day-video storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('day-video', 'day-video', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to day-video bucket
CREATE POLICY "Public read access for day-video" ON storage.objects FOR SELECT TO public USING (bucket_id = 'day-video');
CREATE POLICY "Public insert access for day-video" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'day-video');
CREATE POLICY "Public delete access for day-video" ON storage.objects FOR DELETE TO public USING (bucket_id = 'day-video');