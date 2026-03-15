

# Weekly Schedule Section + Day Pages — Implementation Plan

## What We're Building
1. A **7-card preview grid** on the homepage (`WeeklySchedule.tsx`)
2. A **shared data file** with all 7 days' content (`scheduleData.ts`)
3. A **reusable day page template** (`DayPage.tsx`) rendered at 7 routes
4. Route updates in `App.tsx`

## Files to Create/Modify

### 1. `src/data/scheduleData.ts`
Single source of truth for all 7 days. Each entry contains: day name, slug, emoji, theme name, one-line description, hero title, tagline, 4 time blocks (label, time, description), today's focus quote, resources array (name, contact/url), and optional extra CTA (e.g. Sunday's "Feature Your Church"). All content taken verbatim from the prompt.

### 2. `src/components/WeeklySchedule.tsx`
- Section with id="schedule", dark background (#252222)
- Playfair Display heading: "Your Weekly Healing Journey"
- Subtitle in Inter
- Gold divider line (#9c673a)
- 7 cards in responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Each card (#2e2826 bg, rounded): bold day name, emoji + theme, one-line description, "Explore [Day]" button (#9c673a) linking to `/[day]`
- Current day card gets amber border highlight via `new Date().getDay()`
- Framer Motion fade-in on scroll

### 3. `src/pages/DayPage.tsx`
Shared template for all 7 day routes. Uses `useParams()` to get day slug, looks up data from `scheduleData.ts`. Renders:
- Navbar with "← Back to Home" link (navigates to `/#schedule`)
- Hero banner: day name + theme + tagline, amber accent
- Two buttons: "🎵 Listen Live" (external) + "Share Your Story" (placeholder)
- Sunday gets extra "⛪ Feature Your Church FREE" button
- 4 time-block cards in `grid-cols-1 md:grid-cols-2` (Morning/Midday/Afternoon/Evening) — #2e2826 cards
- "Today's Focus" featured quote card with amber left border
- Resources section: dark cards with resource name + contact/link
- Footer + LivePlayerBar (reuses same components as homepage)
- Invalid day slugs redirect to NotFound

### 4. `src/App.tsx`
Add route: `<Route path="/:day" element={<DayPage />} />` before the catch-all. DayPage itself validates the param.

### 5. Update `src/pages/Index.tsx`
Add `<WeeklySchedule />` component in the sections assembly (between About and Gospel Sunday, once those exist — for now it'll be added to the page).

## Styling Notes
- All backgrounds: #252222 or #2e2826 for cards
- Text: #f5efe8 (cream), #bbc1c4 (muted)
- Accent: #9c673a on buttons, borders, dividers
- Headings: Playfair Display; body: Inter
- No light backgrounds, no stock images, no placeholder text

