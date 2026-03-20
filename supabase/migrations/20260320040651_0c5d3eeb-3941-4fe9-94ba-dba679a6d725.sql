ALTER TABLE public.new_artists
  ADD COLUMN image_size integer NOT NULL DEFAULT 220,
  ADD COLUMN image_zoom integer NOT NULL DEFAULT 50;