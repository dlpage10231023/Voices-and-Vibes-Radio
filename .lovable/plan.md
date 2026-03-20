

# Add Slow Wave Animation to Artist Image Frame

## What
Add a subtle, slow-moving wave/pulse border animation around the album art container on the Artist Player page, giving the image frame an organic, flowing feel.

## How

### Edit: `src/pages/ArtistPlayer.tsx`

**1. Add CSS keyframes** (in the existing `<style>` block at ~line 148):
- Add a `@keyframes wave-border` animation that slowly shifts a gradient border using `background-position` or `border-image` to create a flowing wave effect around the image frame.
- Use a CSS approach with a pseudo-element wrapper that has an animated gradient border cycling through the brand colors (#009B9B → #E8624A → #D4A830 → #009B9B).

**2. Wrap the Album Art Zone** (~line 212) with an animated border container:
- Add an outer `div` with a slowly rotating conic/linear gradient border (8-12s cycle) that creates the "moving waves" effect.
- The animation runs continuously but is more pronounced when playing.

### Animation approach
```css
@keyframes waveGlow {
  0%   { background-position: 0% 50% }
  50%  { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
```
- Outer div: `background: linear-gradient(...)` with `background-size: 300% 300%` animated via `waveGlow` over ~8s.
- Inner div (existing art container): inset by 2px to reveal the animated gradient as a border.
- Subtle box-shadow glow that pulses in sync.

### Files changed
- `src/pages/ArtistPlayer.tsx` — add keyframes + animated wrapper around album art zone

