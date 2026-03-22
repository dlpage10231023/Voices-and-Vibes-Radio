

## Why the vinyl is invisible

Line 208 in `src/pages/NewArtist.tsx` sets the spinning record image to `opacity: 0.06` (6% opacity). On the dark `#080c0c` background, this makes it practically invisible.

## Plan

1. **Update line 208 in `src/pages/NewArtist.tsx`** — Change `opacity: 0.06` to a visible value like `opacity: 0.15` or `opacity: 0.2` so the vinyl is clearly visible but still sits behind the content as a background element.

One line change, nothing else modified.

