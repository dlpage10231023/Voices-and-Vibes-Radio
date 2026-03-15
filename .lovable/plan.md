

## Understanding

Currently, each day supports only **one** audio file (single row per `day_slug`). You want to upload **multiple separate audio files** per day, which will play as a playlist (background music).

## Plan

### 1. Database: Allow multiple audio files per day
- Remove the unique constraint on `day_slug` in the `day_audio` table so multiple rows can exist per day
- Add a `sort_order` column (integer, default 0) for ordering tracks

### 2. Update Audio Admin UI
- Each day section shows a **list of uploaded tracks** (not just one)
- "Upload" button adds a new track to the list (doesn't replace)
- Each track has its own "Remove" button and preview player
- Tracks are displayed in order with drag or manual reorder (simple up/down buttons)

### 3. Update BackgroundAudio playback
- Fetch all audio URLs for the day (ordered by `sort_order`)
- Play them as a sequential playlist — when one ends, start the next
- Loop back to the first track after the last one finishes

### 4. Update hooks
- `useDayAudio` returns an array of audio URLs instead of a single one
- `useAllDayAudio` returns arrays per day slug

### Files changed
- **Migration**: Drop unique constraint on `day_slug`, add `sort_order` column
- **`src/hooks/useDayAudio.ts`**: Return arrays, order by `sort_order`
- **`src/components/BackgroundAudio.tsx`**: Sequential playlist playback with looping
- **`src/pages/AudioAdmin.tsx`**: Multi-file upload list per day with individual remove buttons

