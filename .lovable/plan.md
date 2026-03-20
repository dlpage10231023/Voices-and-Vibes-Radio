

# Persist Image Size & Zoom to Database

## Problem
The admin page has "Image Size" and "Image Zoom" sliders, but these values are only stored in local React state. When saved, they're not included in the database payload, so the public `/new-artist` page has no access to them and uses hardcoded defaults.

## Plan

### 1. Add two columns to `new_artists` table (migration)
```sql
ALTER TABLE public.new_artists
  ADD COLUMN image_size integer NOT NULL DEFAULT 220,
  ADD COLUMN image_zoom integer NOT NULL DEFAULT 50;
```

### 2. Edit `src/pages/AdminNewArtist.tsx`
- Include `image_size` and `image_zoom` in the `save()` payload
- Restore these values in `startEdit()` when loading an existing artist

### 3. Edit `src/pages/NewArtist.tsx`
- Read `image_size` and `image_zoom` from the fetched artist data
- Apply them to the floating image container (width = `image_size`, transform scale from `image_zoom`)

## Files changed
- **Migration**: add `image_size` and `image_zoom` columns to `new_artists`
- **Edit**: `src/pages/AdminNewArtist.tsx` — save/restore size+zoom values
- **Edit**: `src/pages/NewArtist.tsx` — use saved size+zoom from DB

