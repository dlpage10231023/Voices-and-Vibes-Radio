

# Create Public `/new-artist` Page + Homepage Link

## New file: `src/pages/NewArtist.tsx`
Copy the card portion from AdminPromo (lines 509–732) into a standalone public page. Specifically:

**Keep:**
- Background spinning record + radial overlay (lines 379–392)
- The full announcement card: station header, artist row, announcement body with cascade lines, float image, progress bar, play button, EQ bars, volume slider, footer with Copy Link + Listen Live
- Audio element, all playback logic (togglePlay, startEQ, stopEQ, startAnnouncement, progress tracking)
- All animations (promoSpin, promoBlink, responsive media query)
- Site link banner at bottom

**Remove:**
- `PasswordGate` component and auth check
- Left panel (form fields, image upload, audio upload, image size/zoom sliders, Download PNG button, Download HTML button, Copy HTML button)
- `html2canvas` import and all download/copy functions
- `imgInputRef`, `audioInputRef`, `imageSize`, `imageZoom`, `downloading` state
- `handleImage`, `handleAudio`, `downloadPNG`, `downloadImage`, `copyHtml`, `buildFullHtml`, `imgToBase64`, `blobUrlToBase64`

**Changes:**
- Hardcode `data` values (Tony Williams / Soon / 808 Session / Jazz,Gospel,808 Soul / Houston, TX)
- Hardcode artist image as `voicesLogo` (same as current default)
- Set page title via `useEffect` → `document.title = "Tony Williams — New Artist · Voices & Vibes Radio"`
- Audio: use the same `audioSrc`/`audioRef` pattern but start with no audio loaded (or optionally a hardcoded URL if one exists). The play button shows "No audio loaded" if none — same as current behavior
- Copy Link button copies `voicesandvibesradio.com/new-artist`
- Layout: single centered column (no sidebar), the card takes full width up to 680px

## Edit: `src/App.tsx`
Add route: `<Route path="/new-artist" element={<NewArtist />} />` with import

## Edit: `src/components/ArtistSpotlight.tsx`
Add a teal ghost button link below the description text (after line 84):
```
<Link to="/new-artist" className="inline-flex items-center gap-2 ...">
  🎙️ Meet Tony Williams →
</Link>
```
Styled as: transparent background, teal border, teal text, hover brightens — matching the site's existing button patterns.

