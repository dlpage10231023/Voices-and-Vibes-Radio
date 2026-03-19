

# Add PNG Download with Site Link to Promo Editor

## What changes
In `src/pages/AdminPromo.tsx`:

1. **Add `downloadPNG` function** using the already-imported `html2canvas`:
   - Captures `cardRef.current` at 2× scale with `backgroundColor: '#080c0c'`
   - Converts to PNG and triggers download as `{slug}-promo.png`

2. **Add a "🎧 Listen at voicesandvibesradio.com" footer banner** inside the card (below the existing footer div, inside `cardRef`) so it's captured in the PNG — styled with the site's teal/coral gradient

3. **Add "📸 Download PNG" button** in the left-side editor panel, above the existing "Download Card" HTML button. The existing HTML download button stays as a secondary option renamed to "📥 Download HTML (with audio)"

## Technical detail
- `html2canvas` is already imported (line 2) but unused — no new dependencies needed
- The site link banner renders inside the card ref so it's included in the PNG capture
- PNG is static (no audio) — ideal for Instagram, Facebook, Twitter, iMessage, etc.

