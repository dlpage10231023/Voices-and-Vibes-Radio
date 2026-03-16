

# Use Uploaded Tracks as the Main Player

Since the Citrus3 live stream is off, we'll rewire the site so the **Listen Live / Sticky Player** plays your uploaded tracks from the database instead of the dead stream URL.

## What Changes

1. **Update `AudioProvider`** — Replace the Citrus3 stream URL with logic that fetches today's tracks from the `day_audio` table (using the current day of the week) and plays them in sequence, looping back to the start. Expose current track info so the sticky player can show what's playing.

2. **Update `StickyPlayer`** — Show the current song title/artist instead of just "Live/Offline". Change labels from "Listen Live" to "Listen Now" since it's your uploaded programming, not a live stream.

3. **Update `ListenLiveButton`** — Same label update, keep the same toggle behavior.

4. **Homepage gets music** — Currently only day pages (`/sunday`, etc.) play background audio. With this change, the homepage sticky player will also play today's tracks, so visitors hear music immediately.

5. **Avoid double playback on day pages** — On day pages, the `BackgroundAudio` component already plays tracks. We'll coordinate so only one audio source plays at a time (sticky player pauses when BackgroundAudio is active on a day page, or they share the same audio instance).

## How It Works

- `AudioProvider` becomes the single audio controller site-wide
- It auto-detects today's day slug and loads tracks from `day_audio`
- Tracks play sequentially and loop
- The sticky player and listen buttons control this single player
- On day pages, `BackgroundAudio` takes over with that specific day's tracks

## Current Data
You have **6 tracks uploaded for Sunday**. Other days have no tracks yet — on those days the player will show as unavailable until you upload tracks via `/admin/audio`.

