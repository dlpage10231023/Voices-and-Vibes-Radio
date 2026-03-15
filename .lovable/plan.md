

## Video Commercials Between Songs

Add video upload support so commercials play visually between audio tracks on day pages.

### Database Changes
- Add `media_type` column to `day_audio` table (`text`, default `'audio'`, values: `'audio'` or `'video'`)
- Create a `day-video` storage bucket (public) for video files

### Admin UI (`AudioAdmin.tsx`)
- Add a second upload button per day: "Add Commercial" (accepts `video/*`)
- Video entries show a `<video>` preview instead of `<audio>` preview
- Badge/label on each item showing "Audio" or "Video"
- Same reorder and remove controls apply to both types

### Playback (`BackgroundAudio.tsx` → rename concept to `BackgroundMedia`)
- Currently returns `null` — needs to render a visible `<video>` element when a video track is playing
- Playlist logic: iterate through tracks in order. If next item is audio, play via `<audio>`. If video, show a centered overlay `<video>` element that auto-plays, then hides when ended
- Video plays at full volume; audio stays at 0.15
- After video ends, resume next track in playlist

### Hooks (`useDayAudio.ts`)
- Include `media_type` in the returned track objects (no other changes needed since the table already stores everything)

### Files to change
1. **Migration SQL**: Add `media_type` column, create `day-video` storage bucket with public RLS
2. **`src/hooks/useDayAudio.ts`**: Add `media_type` to the `DayAudio` interface
3. **`src/components/BackgroundAudio.tsx`**: Render video overlay when current track is video, handle audio/video switching
4. **`src/pages/AudioAdmin.tsx`**: Add "Add Commercial" button, video preview, media type badge

