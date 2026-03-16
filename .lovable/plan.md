

## Problem

The two-column grid is stacking vertically because:

1. **Broken CSS selector**: The responsive `<style>` block targets `.min-h-screen > div:nth-child(3)` but the grid is actually the 4th child (after `<Navbar>`, `<style>`, and the header div). So on viewports ≤960px, the selector hits the **header**, not the grid — meaning the grid columns are never overridden properly. More importantly, the wrong element may be getting `grid-template-columns: 1fr !important` applied.

2. **`items-end`** on the grid should be `items-start`.

## Fix

1. **Add a stable CSS class** (e.g., `artist-grid`) to the grid container div (line 280-281).

2. **Change the grid className** from:
   ```
   className="grid gap-8 px-[5vw] pb-[80px] items-end"
   ```
   to:
   ```
   className="artist-grid grid gap-8 px-[5vw] pb-[80px] items-start"
   ```

3. **Update the `<style>` block** (lines 1073-1085) to target `.artist-grid` instead of `.min-h-screen > div:nth-child(3)`:
   ```css
   @media (max-width: 768px) {
     .artist-grid { grid-template-columns: 1fr !important; }
   }
   @media (min-width: 769px) and (max-width: 1200px) {
     .artist-grid { grid-template-columns: 380px 1fr !important; }
   }
   ```

4. **Keep the inline style** `gridTemplateColumns: "480px 1fr"` as the desktop default.

These four changes fix the selector mismatch and ensure the grid is always side-by-side on desktop (≥1201px), slightly narrower on tablet (769–1200px), and single-column on mobile (≤768px).

