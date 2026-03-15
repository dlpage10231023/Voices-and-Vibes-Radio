-- Table to store per-day audio assignments
CREATE TABLE public.day_audio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_slug TEXT NOT NULL UNIQUE CHECK (day_slug IN ('sunday','monday','tuesday','wednesday','thursday','friday','saturday')),
  audio_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.day_audio ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public site)
CREATE POLICY "Anyone can read day audio" ON public.day_audio FOR SELECT USING (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('day-audio', 'day-audio', true);

-- Public read for audio files
CREATE POLICY "Audio files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'day-audio');

-- Anyone can upload audio
CREATE POLICY "Anyone can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'day-audio');

-- Anyone can update audio
CREATE POLICY "Anyone can update audio" ON storage.objects FOR UPDATE USING (bucket_id = 'day-audio');

-- Anyone can delete audio
CREATE POLICY "Anyone can delete audio" ON storage.objects FOR DELETE USING (bucket_id = 'day-audio');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_day_audio_updated_at
  BEFORE UPDATE ON public.day_audio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();