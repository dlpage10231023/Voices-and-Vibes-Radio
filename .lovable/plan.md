

## Plan: Cloud-Based Artist Spotlight Player

### What Changes

**1. Database migration — create `artist_spotlight` table**

```sql
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

-- Option C: Open for now
CREATE POLICY "Anyone can read" ON public.artist_spotlight FOR SELECT USING (true);
CREATE POLICY "Anyone can insert" ON public.artist_spotlight FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update" ON public.artist_spotlight FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete" ON public.artist_spotlight FOR DELETE USING (true);
```

Fixed UUID `a0000000-...0001` ensures single-row upsert pattern.

**2. Update `src/components/ArtistAudioProvider.tsx`**

- **`loadAudioFile`**: After creating blob URL for local playback, upload file to `day-audio` bucket (path: `artist-spotlight/track.<ext>`), get public URL, then upsert into `artist_spotlight` with the fixed UUID.
- **`loadImageFile`**: Same pattern — upload to `album-art` bucket, upsert `image_url`.
- **Metadata setters** (`setMetaTitle`, `setMetaArtist`, `setMetaAlbum`, `setMetaYear`): After setting local state, debounce-upsert the changed field to `artist_spotlight`.
- **Restore on mount** (new effect): Query `artist_spotlight` where `status = 'featured'`. If a row exists, set `audio.src` directly to the public `audio_url`, set `artSrc` to `image_url`, populate all metadata from the row, set `hasSource = true`. Fall back to IndexedDB if no cloud record.
- Keep all existing IndexedDB caching as-is for the uploader's local session.

**3. No changes needed to `ArtistPlayer.tsx` or `ArtistSpotlight.tsx`** — they already read from the provider context.

### How visitors experience it

```text
visitor opens site → provider mounts → fetches artist_spotlight row
→ audio.src = "https://...supabase.co/storage/.../track.mp3"
→ browser streams directly — no download, no blob
→ album art + metadata displayed from DB row
```

### Files changed
1. **SQL migration** — new `artist_spotlight` table + RLS
2. **`src/components/ArtistAudioProvider.tsx`** — cloud upload, cloud restore, metadata sync

