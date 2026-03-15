
-- Drop the unique constraint on day_slug (find and drop it)
ALTER TABLE public.day_audio DROP CONSTRAINT IF EXISTS day_audio_day_slug_key;

-- Add sort_order column
ALTER TABLE public.day_audio ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Add RLS policies for insert, update, delete (public access for admin)
CREATE POLICY "Anyone can insert day audio" ON public.day_audio FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update day audio" ON public.day_audio FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete day audio" ON public.day_audio FOR DELETE TO public USING (true);
