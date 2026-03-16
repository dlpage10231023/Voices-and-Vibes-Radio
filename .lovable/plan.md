

# Splash/Promo Page — Implementation Plan

## Summary
Convert the uploaded `vv-promo-2.html` into a React component at `src/pages/Splash.tsx` and make it the root route (`/`). The current homepage moves to `/home`.

## Route Changes (`src/App.tsx`)
- Add `Splash` at `/`
- Move current `Index` to `/home`
- Keep all other routes unchanged

## New File: `src/pages/Splash.tsx`
A single React component that faithfully reproduces the uploaded HTML promo, using:

- **Framer Motion** for scene transitions (opacity fade in/out)
- **Tailwind** for utility classes where convenient; inline styles + a local `<style>` tag or CSS module for the extensive custom animations (scanlines, pulse rings, sound bars, bar animations, etc.) — matching the uploaded CSS exactly
- **Web Audio API** for the jazz/afrobeats generative music engine (direct port of the JS from the HTML file)
- **React Router `useNavigate`** for `enterSite()` → navigates to `/home`

### Component Structure
- `useState` for: `currentScene`, `isPlaying` (auto-advance), `musicPlaying`, `volume`, `promoEnded`
- `useRef` for: `audioCtx`, `masterGain`, `scheduledNodes`, timers, progress interval
- `useEffect` for: auto-advance timer, progress bar tick, keyboard listeners (arrow keys, space)
- `useCallback` for: `showScene`, `next`, `prev`, `goTo`, `togglePlay`, `toggleMusic`, `setVolume`, `enterSite`

### 8 Scenes (exact content from HTML)
1. **Cold Open** — mic emoji with pulse rings, dark bg, sound bars
2. **Title Reveal** — "Voices & Vibes", teal glow bg, tagline
3. **Tagline** — "Where Conversations Meet Jazz / Faith Meets Healing"
4. **Streaming** — "Live Now" badge, "Streaming 24/7", animated bars
5. **Weekly Themes** — 7 day theme cards grid
6. **Gospel Sunday** — coral glow bg, church spotlight text
7. **Host** — Doreatha Page, LPC credentials
8. **CTA** — "Enter Site →" button, finale glow

### Fixed UI (always visible)
- **Skip button** (top-right, fixed) — "Skip Intro →", upgrades to "✦ Enter Site →" on promo end
- **Progress bar** (bottom, 3px) — teal→coral gradient fill per scene duration
- **Scene dots** (8 dots, clickable)
- **Controls** (prev, play/pause, scene counter, next, music toggle, volume slider)

### Scene Durations (from `data-dur`)
s1: 4000ms, s2: 5500ms, s3: 5500ms, s4: 5000ms, s5: 6500ms, s6: 5500ms, s7: 5500ms, s8: 7000ms

### Audio Engine (direct port)
- BPM 92, Dm9→Gm9→Bbmaj7→Am9 chord cycle
- Afrobeats kick/snare/hihat/clave patterns
- Pentatonic melody phrases every 2 bars
- Simple impulse response reverb
- Fade in/out on toggle, volume slider control
- Music starts OFF by default; user clicks "Music: Off" to enable

### Brand Colors (CSS custom properties or Tailwind arbitrary values)
All hex codes from the prompt: teal `#009B9B`, coral `#E8624A`, etc.

### Fonts
Already loaded in `index.html`: Dancing Script, Montserrat, Playfair Display. Will use existing Tailwind font classes (`font-dancing`, `font-montserrat`, `font-playfair`).

## Files Changed
1. **`src/pages/Splash.tsx`** — new file, full promo page component
2. **`src/App.tsx`** — add Splash route at `/`, move Index to `/home`

## No Changes To
- Existing components, styles, AudioProvider, or any other files
- No external audio files needed
- No new dependencies (framer-motion already available)

