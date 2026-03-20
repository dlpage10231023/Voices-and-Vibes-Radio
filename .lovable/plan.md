

# Fix: No Sound on Artist Player

## Problem
The audio element plays (progress bar moves, time advances) but no sound is heard. This is caused by a **Web Audio API routing issue**:

1. When `getAnalyser()` is called (by the visualizer), it creates an `AudioContext` and calls `createMediaElementSource(audio)`, which routes ALL audio output through the Web Audio API graph.
2. Browser autoplay policy keeps the `AudioContext` in a "suspended" state until a user gesture resumes it.
3. `togglePlay` only resumes the AudioContext if it already exists, but the timing is wrong — the visualizer creates it *after* play starts.
4. Result: audio element is playing, but output is routed through a suspended AudioContext → silence.

## Fix (in `src/components/ArtistAudioProvider.tsx`)

### Change 1: Eagerly create and resume AudioContext in `togglePlay`
Move the AudioContext creation (currently in `getAnalyser`) to happen **before** `a.play()` in `togglePlay`, ensuring the context is created and resumed during the user gesture:

```typescript
const togglePlay = useCallback(async () => {
  const a = audioRef.current;
  if (!a || !a.src) return;
  if (isPlaying) {
    stopPlay();
  } else {
    dayAudio.stopPlay();
    // Ensure AudioContext + source are set up and resumed BEFORE playing
    // This must happen in a user-gesture handler so the browser allows it
    if (!audioCtxRef.current) {
      const actx = new AudioContext();
      const an = actx.createAnalyser();
      an.fftSize = 128;
      an.smoothingTimeConstant = 0.82;
      const src = actx.createMediaElementSource(a);
      src.connect(an);
      an.connect(actx.destination);
      audioCtxRef.current = actx;
      analyserRef.current = an;
      sourceRef.current = src;
    }
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    await a.play().catch(() => {});
    setIsPlaying(true);
  }
}, [isPlaying, stopPlay, dayAudio]);
```

### Change 2: Simplify `getAnalyser` to just return the existing analyser
Since the AudioContext is now created in `togglePlay`, `getAnalyser` becomes a simple getter:

```typescript
const getAnalyser = useCallback((): AnalyserNode | null => {
  if (audioCtxRef.current?.state === "suspended") {
    audioCtxRef.current.resume();
  }
  return analyserRef.current;
}, []);
```

## Files changed
- **Edit**: `src/components/ArtistAudioProvider.tsx` — move AudioContext creation into `togglePlay`, simplify `getAnalyser`

