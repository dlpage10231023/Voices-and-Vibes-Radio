

# Admin New Artist Page + Dynamic Public Page

## Overview
Create a `new_artists` database table, a password-protected admin page at `/admin/new-artist` (replicating the AdminPromo editor pattern), and update the public `/new-artist` page to fetch data dynamically from the database.

## 1. Database: Create `new_artists` table
New migration:
```sql
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

-- Public read (for the public page)
CREATE POLICY "Anyone can read new_artists" ON public.new_artists FOR SELECT USING (true);
CREATE POLICY "Anyone can insert new_artists" ON public.new_artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update new_artists" ON public.new_artists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete new_artists" ON public.new_artists FOR DELETE USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_new_artists_updated_at
  BEFORE UPDATE ON public.new_artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. New file: `src/pages/AdminNewArtist.tsx`
Exact replica of AdminPromo's structure:
- **PasswordGate** (same component, same `VITE_ADMIN_PASSWORD`)
- **Left panel**: Editor form with fields for artist name, track title, subtitle, genres, location, slug, image upload (to `album-art` bucket), audio upload (to `day-audio` bucket)
- **Right panel**: Live card preview (same card UI as current NewArtist.tsx)
- **Save button**: Upserts to `new_artists` table
- **Artist list**: Shows all saved artists with "Set Active" toggle (deactivates others when one is activated)
- **Remove**: Download PNG/HTML/Copy HTML buttons (keep them for admin use)

## 3. Edit: `src/pages/NewArtist.tsx`
- On mount, fetch active artist: `supabase.from('new_artists').select('*').eq('is_active', true).maybeSingle()`
- Populate `data`, `imageUrl`, `audioSrc` from the DB row
- If image_url exists, use it for the float image and vinyl; otherwise fall back to `voicesLogo`
- If audio_url exists, set it as `audioSrc` so the play button works
- Show "No artist currently featured" fallback if no active row

## 4. Edit: `src/App.tsx`
Add route: `/admin/new-artist` → `AdminNewArtist`

## Files changed
- **New migration**: `new_artists` table
- **New**: `src/pages/AdminNewArtist.tsx`
- **Edit**: `src/pages/NewArtist.tsx` — fetch from DB
- **Edit**: `src/App.tsx` — add admin route

