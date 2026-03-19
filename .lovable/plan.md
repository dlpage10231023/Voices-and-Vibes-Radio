

## Plan: Move RecordBar into the Navbar Position

You want the RecordBar to sit at the very top of the page where the Navbar currently lives — the bar that shows "Voices & Vibes", navigation links, and the "Live" button.

### What will change

1. **`src/pages/Index.tsx`** — Move `<RecordBar />` from between Hero and Ticker to directly after `<Navbar />`, before `<Hero />`.

2. **`src/components/RecordBar.tsx`** — Make it fixed-position, sitting directly below the Navbar:
   - `position: fixed`, `top: 66px` (right below the 66px Navbar), `z-index: 199`
   - Full width, same 100px height

3. **`src/pages/Index.tsx`** — Add top padding to the page content to account for both the Navbar (66px) and RecordBar (100px) = 166px total offset, so content doesn't hide behind them.

4. **`src/components/Hero.tsx`** — Adjust any existing top offset/padding if it currently only accounts for the 66px Navbar.

### Technical details

- RecordBar gets `fixed top-[66px] left-0 right-0 z-[199]` so it stacks below the Navbar but stays visible on scroll
- No changes to RecordBar's internal layout, audio engine, or styling
- No changes to the Navbar component itself

