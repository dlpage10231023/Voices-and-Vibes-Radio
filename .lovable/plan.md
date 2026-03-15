

## Expand the About Section with Doreatha's Photo and Bio

### What changes

Update the existing **About section** (`src/components/About.tsx`) to replace the placeholder "DP" initials host card on the right side with:

1. **Her real photo** — copy the uploaded image to `src/assets/doreatha-page.png` and use it in place of the gradient circle with initials
2. **Expanded bio content** — add the "Our Story" text from the image below or alongside the photo:
   - "Voices & Vibes was born from a simple belief: healing happens in community..."
   - "What We Do" section (Mon–Sat themes + Gospel Sunday)
   - "Why We Do It" beliefs list
3. **Keep existing elements** — the left column (station info, Mon–Sat / Gospel Sunday cards, stats row) stays as-is
4. **Right column redesign** — larger photo (not a tiny circle), her name in Dancing Script, title/credentials, the bio paragraphs styled with the site's existing typography, and her website link

### Files changed
- **Copy** `user-uploads://TRC_Services_3.png` → `src/assets/doreatha-page.png`
- **Edit** `src/components/About.tsx` — replace the host card with photo + expanded bio content

