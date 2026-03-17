

## Plan: Artist Spotlight Queue System

### 1. Database Migration

Add columns to `artist_spotlight` and update RLS:

```sql
ALTER TABLE artist_spotlight ADD COLUMN IF NOT EXISTS artist_slug text;
ALTER TABLE artist_spotlight ADD COLUMN IF NOT EXISTS featured_week text;

-- Remove the fixed-UUID default so multiple rows are supported
ALTER TABLE artist_spotlight ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update status values: 'featured' → 'live' for existing rows
UPDATE artist_spotlight SET status = 'live' WHERE status = 'featured';
```

RLS stays open for now (already open). No auth changes needed per the user's Option C choice.

### 2. New File: `src/pages/AdminSpotlight.tsx`

Full admin panel at `/admin/spotlight` with password gate via `VITE_ADMIN_PASSWORD` env var + sessionStorage persistence.

Three sections:

**Section 1 — Now Live**: Fetches `status='live'` row. Shows album art thumbnail, artist name (Dancing Script, coral), track title, album/year. Archive button sets `status='archived'`, then promotes any `status='next'` row to `'live'`. Preview button opens `/artist-player` in new tab.

**Section 2 — Next Up**: Fetches `status='next'` row. Two states: empty (upload form) or loaded (preview card with "Go Live Now" and "Remove" buttons). "Go Live Now" archives current live, promotes next to live. Upload form with artist name, track title, album, year, featured week fields. File upload buttons for audio (→ `day-audio` bucket) and image (→ `album-art` bucket) with progress tracking. "Save as Next Up" button inserts new row with `status='next'`.

**Section 3 — Past Spotlights**: Grid of `status='archived'` rows ordered by `updated_at DESC`. Each card shows art, artist, track, week. "Restore as Next" and "Delete" (with confirm dialog) buttons.

Styling: bg `#0a0a0a`, cards `#1a1a1a`, teal `#009B9B`, coral `#E8624A`, Montserrat labels, Dancing Script artist names.

### 3. Update `src/components/ArtistAudioProvider.tsx`

Change cloud restore query from `status = 'featured'` to `status = 'live'`:

```typescript
.eq("status", "live")
```

Also change the upsert in `loadAudioFile` from `status: "featured"` to `status: "live"`.

### 4. Update `src/pages/ArtistPlayer.tsx`

- Show "Featured Week: [value]" in muted 9px text below album line
- Past spotlights section: fetch from DB (`status='archived'`) instead of hardcoded array

### 5. Update `src/App.tsx`

Add route: `<Route path="/admin/spotlight" element={<AdminSpotlight />} />`

### 6. Update `src/components/Footer.tsx`

Add tiny "Admin" link (8px, muted, far right) linking to `/admin/spotlight`.

### 7. Toast Styling

Use sonner toasts with custom styling matching the spec (dark bg, teal border, Montserrat, 2.5s auto-dismiss).

### Files Changed
1. **SQL migration** — add `artist_slug`, `featured_week` columns; update default id; migrate 'featured' → 'live'
2. **`src/pages/AdminSpotlight.tsx`** — new admin panel page (bulk of the work)
3. **`src/components/ArtistAudioProvider.tsx`** — change 'featured' → 'live' in queries/upserts
4. **`src/pages/ArtistPlayer.tsx`** — add featured_week display, DB-driven past spotlights
5. **`src/App.tsx`** — add admin route
6. **`src/components/Footer.tsx`** — add admin link

