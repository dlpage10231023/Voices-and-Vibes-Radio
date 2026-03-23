

## Fix Silent Audio on Sticky Bar and Artist Player

### Root Causes

**Artist Player (`/artist-player`)**: The session replay confirms the progress bar IS advancing (0:39 → 0:54), meaning the audio element is playing but producing no audible output. The cause: `createMediaElementSource()` in `ArtistAudioProvider` captures the audio element's output and routes it through the Web Audio API. The audio element needs `crossOrigin = "anonymous"` set **before** loading cross-origin URLs (Supabase storage is a different origin). Without it, some browsers silently mute the MediaElementSource output. Additionally, the AudioContext may not resume properly.

**Sticky Bar (`/home`)**: `AudioProvider` creates `new Audio(url)` without `crossOrigin`. The `.play().catch(() => {})` swallows all errors silently. The `stopAudio` effect that runs on `[tracks]` change destroys the audio reference, which can race with user interaction.

### Changes

**1. `src/components/ArtistAudioProvider.tsx`**
- Set `crossOrigin = "anonymous"` on the audio element at creation time (before any src is set)
- Add `console.warn` in `.catch()` blocks so play failures are visible
- Ensure `AudioContext.resume()` is awaited and errors surfaced

**2. `src/components/AudioProvider.tsx`**
- Set `crossOrigin = "anonymous"` on audio elements created in `playTrackAtIndex`
- Log play errors instead of swallowing them with empty `.catch()`
- Remove the `stopAudio()` call from the `[tracks]` effect — it's a destructive side-effect that can race with user clicks. Instead, just reset state without destroying a potentially-playing element

### Technical Detail

When `createMediaElementSource(element)` is used with a cross-origin audio source, the browser requires CORS headers **and** the element must have `crossOrigin` attribute set. Supabase storage serves proper CORS headers, but the Audio elements in both providers were created without the attribute. This causes the Web Audio API to either mute the output or throw a silent CORS error depending on browser.

