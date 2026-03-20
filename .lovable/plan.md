
Fix the mismatch by making the public `/new-artist` image renderer use the exact same image framing logic as `AdminNewArtist`.

## What’s actually happening
The saved adjustment values are working:
- Admin saves `image_size` and `image_zoom`
- The database shows the updated values
- `/new-artist` fetches those updated values correctly

The real bug is that the two pages render the image differently.

## Root cause
`src/pages/AdminNewArtist.tsx` preview uses:
- `objectFit: "contain"`
- zoom formula: `scale(1 + (100 - imageZoom) / 50)`

But `src/pages/NewArtist.tsx` uses:
- `objectFit: "cover"`
- zoom formula: `scale(1 + (imageZoom - 50) / 50)`
- forced square `aspectRatio: "1"`

So the public page does not visually match the admin preview even though the saved values are correct.

## Plan

### 1. Make `/new-artist` match the admin preview exactly
Edit `src/pages/NewArtist.tsx` so the floating artist image block uses the same rendering rules as `src/pages/AdminNewArtist.tsx`:
- remove the current conflicting zoom math
- switch the image to `objectFit: "contain"`
- use the same transform formula as admin
- match the image wrapper sizing/styling structure so the crop/scale behavior is identical

### 2. Reuse one consistent image-frame behavior
Align these exact parts between both files:
- outer float card width
- inner image container sizing
- image `objectFit`
- image transform/zoom formula
- fallback image behavior

This ensures “what you see in admin” is what appears on the live page.

### 3. Keep saved size/zoom values as-is
No database change is needed.
The persistence layer is already working based on the saved PATCH requests and fetched live record.

## Files to update
- `src/pages/NewArtist.tsx` — make public rendering match admin preview logic exactly

## Technical detail
Current mismatch:

```text
Admin preview:
contain + scale(1 + (100 - zoom)/50)

Live page:
cover + scale(1 + (zoom - 50)/50)
```

That inversion is why the adjusted photo looks different after saving.

## Expected result after fix
When you adjust the photo in Admin New Artist and save it:
- the live `/new-artist` page will show the same framing
- image size will match
- zoom/crop behavior will match
- the photo will no longer appear “wrong” after save
