

## Problem

The `ArtistAudioProvider` has a debounced sync that writes metadata edits from the ArtistPlayer page back to the DB row (`a0000000-...`). This means:

1. When the player page loads, it reads the live row's metadata into local state
2. Any edit to the metadata fields (or clearing them) triggers `debouncedMetaSync`, which **overwrites** the DB
3. `loadAudioFile` auto-sets the title from the filename if the field is empty — then syncs that to DB
4. The admin's NOW LIVE card reads from DB, so it shows whatever the player page last wrote — which may be a filename, empty string, or stale value

## Fix

**Stop the ArtistPlayer page from writing metadata back to the `artist_spotlight` table.** Only the Admin panel should modify spotlight metadata.

### Changes

**1. `src/components/ArtistAudioProvider.tsx`**
- Remove `debouncedMetaSync` and `upsertSpotlight` for metadata fields entirely
- Remove the auto-title-from-filename logic in `loadAudioFile` (`setMetaTitle((prev) => prev || name)`)
- Remove the cloud upload logic from `loadAudioFile` and `loadImageFile` — these should only be used from the Admin panel now
- Keep the metadata setters (`setMetaTitle`, etc.) as plain local state setters (no DB sync)
- Keep the cloud restore on mount (read-only from DB where `status='live'`)

**2. `src/pages/ArtistPlayer.tsx`**
- The metadata fields on the player page become **display-only** — they show what's in the DB but don't write back
- OR: if users still need to edit metadata from the player page, the edits stay local only (session-level, no DB persistence)

**3. `src/pages/AdminSpotlight.tsx`**
- Already correct: reads `artist`, `title`, `album`, `year`, `image_url` directly from DB
- Show "Not provided" in muted text when a field is empty/null instead of "Unknown" or "Untitled"

### Summary of file changes
| File | Change |
|---|---|
| `ArtistAudioProvider.tsx` | Remove `debouncedMetaSync`, `upsertSpotlight` (metadata), and filename-to-title auto-set. Keep cloud read on mount. |
| `AdminSpotlight.tsx` | Change fallback text from "Unknown"/"Untitled" to "Not provided" in muted style |
| `ArtistPlayer.tsx` | No functional change needed (already reads from provider state) |

