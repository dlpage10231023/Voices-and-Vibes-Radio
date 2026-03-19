

# Add Commercial Playback Between Artist Tracks

Currently commercials are admin-manageable but never actually play. This plan integrates them into the artist audio playback so they automatically play between spotlight tracks.

## How It Will Work

When a spotlight track ends, instead of immediately playing the next track, the system will play a commercial first. After the commercial finishes, the next spotlight track plays. Commercials rotate in order so users hear different ads over time.

## Technical Changes

### 1. Update `ArtistAudioProvider.tsx`
- Fetch live commercials from the `commercials` table on mount (alongside spotlight tracks)
- Add state: `isPlayingCommercial` (boolean), `commercialIndex` (number), commercials list
- Modify the `onEnd` handler:
  - When a **spotlight track** ends → load and play the next commercial
  - When a **commercial** ends → advance to the next spotlight track
- The commercial index increments each time one plays, cycling through all commercials
- During commercial playback, update `metaTitle` to show the commercial name and hide track controls (prev/next disabled)

### 2. Expose `isPlayingCommercial` in context
- Add `isPlayingCommercial: boolean` to `ArtistAudioState`
- Consumer components can use this to show "Commercial Break" or disable skip

### 3. Update `ArtistPlayer.tsx` (minor)
- When `isPlayingCommercial` is true, show a "Commercial" label instead of track metadata
- Disable prev/next track buttons during commercials

## What Won't Change
- Admin commercials UI stays the same
- Day page audio is unaffected
- Single-track playback (no commercials list) skips commercial logic

