

## Plan: Add sway animation to artist image

The `sway` keyframe exists in `tailwind.config.ts` but has no corresponding entry in the `animation` map, so `animate-sway` doesn't work.

### Steps

1. **`tailwind.config.ts`** — Add `sway: "sway 3s ease-in-out infinite"` to the `animation` object (alongside `accordion-down` / `accordion-up`).

2. **`src/pages/NewArtist.tsx` (line 269)** — Add `animation: "sway 3s ease-in-out infinite"` to the inline style on the artist image container `<div>`.

Two small edits. The image will gently sway side-to-side.

