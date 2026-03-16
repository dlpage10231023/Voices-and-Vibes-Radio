

## Problem

The right column (artist info, spotlights, track details) stretches too wide because `grid-template-columns: 480px 1fr` lets it fill all remaining viewport space (~1400px on a 1906px screen). This makes the text and content feel sprawling and hard to read.

## Fix

1. **Cap the right column width** — Change the grid from `480px 1fr` to `480px minmax(0, 600px)` so the right column maxes out at 600px.

2. **Add a max-width to the overall grid** — Add `max-width: 1200px` and `margin: 0 auto` to the grid container so the entire two-column layout is centered and bounded.

3. **Update tablet breakpoint** similarly — change `380px 1fr` to `380px minmax(0, 600px)`.

**File**: `src/pages/ArtistPlayer.tsx` — 3 small edits (lines 283, 281, 1082).

