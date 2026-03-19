
CREATE TABLE public.commercials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  audio_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status text DEFAULT 'live',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.commercials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read commercials" ON public.commercials FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert commercials" ON public.commercials FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update commercials" ON public.commercials FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete commercials" ON public.commercials FOR DELETE TO public USING (true);
