

## Plan: Add KKB Arcade Hub Link to Book Spotlight

Add a second card to the Book Spotlight section for the KKB Arcade Hub alongside the existing Kaleidoscope Kids Books entry.

### Changes

**`src/components/BookSpotlight.tsx`**
- Add a new entry to the `books` array:
  - Title: "KKB Arcade Hub" (or similar)
  - URL: `https://kkb-arcade-hub.lovable.app`
  - Emoji: 🎮 (game-themed)
- The existing grid is already set up for `md:grid-cols-2`, so both cards will display side by side on desktop automatically.

This is a purely additive change — no existing content is modified.

