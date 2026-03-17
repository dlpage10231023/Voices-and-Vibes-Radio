
-- Add new columns for queue system
ALTER TABLE public.artist_spotlight ADD COLUMN IF NOT EXISTS artist_slug text;
ALTER TABLE public.artist_spotlight ADD COLUMN IF NOT EXISTS featured_week text;

-- Allow multiple rows by changing the default from fixed UUID to random
ALTER TABLE public.artist_spotlight ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Migrate existing 'featured' status to 'live'
UPDATE public.artist_spotlight SET status = 'live' WHERE status = 'featured';

-- Update default status to 'live'
ALTER TABLE public.artist_spotlight ALTER COLUMN status SET DEFAULT 'live';
