import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vinylRecordImg from "@/assets/vinyl-record-new.jpg";

const SCENE_DURATIONS = [4000, 5500, 5500, 5000, 6500, 5500, 5500, 7000];
const TOTAL_SCENES = 8;

// Music constants
const BPM = 92;
const BEAT = 60 / BPM;
const LOOKAHEAD = 0.12;
const SCHEDULE_AHEAD = 0.25;

const chords = [
  [293.66, 349.23, 440.0, 523.25, 659.25],
  [392.0, 466.16, 587.33, 698.46, 880.0],
  [466.16, 587.33, 698.46, 932.33, 1046.5],
  [440.0, 523.25, 659.25, 783.99, 987.77],
];
const bassNotes = [146.83, 196.0, 233.08, 220.0];
const kickPattern = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0];
const snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
const hihatPattern = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0];
const clavePattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0];

// Sound bar configs for scenes
const soundBarsS1 = [
  { h: 40, d: 0, c: "t" }, { h: 80, d: 0.1, c: "c" }, { h: 120, d: 0.2, c: "t" }, { h: 60, d: 0.3, c: "c" },
  { h: 100, d: 0.4, c: "t" }, { h: 140, d: 0.5, c: "c" }, { h: 70, d: 0.6, c: "t" }, { h: 110, d: 0.7, c: "c" },
  { h: 50, d: 0.8, c: "t" }, { h: 130, d: 0.9, c: "c" }, { h: 90, d: 1, c: "t" }, { h: 160, d: 1.1, c: "c" },
  { h: 45, d: 1.2, c: "t" }, { h: 95, d: 1.3, c: "c" }, { h: 115, d: 1.4, c: "t" }, { h: 55, d: 1.5, c: "c" },
  { h: 85, d: 1.6, c: "t" }, { h: 105, d: 1.7, c: "c" }, { h: 35, d: 1.8, c: "t" }, { h: 75, d: 1.9, c: "c" },
];
const soundBarsS2 = [
  { h: 60, d: 0, c: "t" }, { h: 100, d: 0.15, c: "c" }, { h: 140, d: 0.3, c: "t" }, { h: 80, d: 0.45, c: "c" },
  { h: 120, d: 0.6, c: "t" }, { h: 160, d: 0.75, c: "c" }, { h: 90, d: 0.9, c: "t" }, { h: 130, d: 1.05, c: "c" },
  { h: 70, d: 1.2, c: "t" }, { h: 150, d: 1.35, c: "c" }, { h: 110, d: 1.5, c: "t" }, { h: 50, d: 1.65, c: "c" },
  { h: 95, d: 1.8, c: "t" }, { h: 115, d: 1.95, c: "c" }, { h: 55, d: 2.1, c: "t" }, { h: 85, d: 2.25, c: "c" },
];
const soundBarsS8 = [
  { h: 80, d: 0, c: "t" }, { h: 120, d: 0.1, c: "c" }, { h: 160, d: 0.2, c: "t" }, { h: 90, d: 0.3, c: "c" },
  { h: 140, d: 0.4, c: "t" }, { h: 100, d: 0.5, c: "c" }, { h: 170, d: 0.6, c: "t" }, { h: 110, d: 0.7, c: "c" },
  { h: 60, d: 0.8, c: "t" }, { h: 150, d: 0.9, c: "c" }, { h: 130, d: 1, c: "t" }, { h: 70, d: 1.1, c: "c" },
  { h: 115, d: 1.2, c: "t" }, { h: 145, d: 1.3, c: "c" }, { h: 55, d: 1.4, c: "t" }, { h: 95, d: 1.5, c: "c" },
];

const SoundBars = ({ bars }: { bars: typeof soundBarsS1 }) => (
  <div className="splash-sound-bars-bg">
    {bars.map((b, i) => (
      <div
        key={i}
        className={`splash-sb ${b.c === "t" ? "splash-sb-t" : "splash-sb-c"}`}
        style={{ height: b.h, animationDelay: `${b.d}s` }}
      />
    ))}
  </div>
);

const Scanlines = () => <div className="splash-scanlines" />;
const Vignette = () => <div className="splash-vignette" />;
const Watermark = () => <div className="splash-watermark">voicesandvibesradio.com</div>;

const PulseRings = ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
  <div className="splash-pulse-rings" style={style}>
    <div className="splash-ring" />
    <div className="splash-ring" />
    <div className="splash-ring" />
    {children}
  </div>
);

const DividerLine = ({ className = "" }: { className?: string }) => (
  <div className={`splash-divider-line ${className}`} />
);

const HLine = ({ className = "" }: { className?: string }) => (
  <div className={`splash-h-line ${className}`} />
);

const ActiveBars = () => (
  <div className="splash-bars-active">
    {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.15, 0.25, 0.35, 0.45].map((d, i) => (
      <div
        key={i}
        className={`splash-bar-a ${i % 2 === 0 ? "splash-bar-t" : "splash-bar-c"}`}
        style={{ animationDelay: `${d}s` }}
      />
    ))}
  </div>
);

const Splash = () => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [promoEnded, setPromoEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const scheduledNodesRef = useRef<AudioNode[]>([]);
  const beatLoopRef = useRef<number | null>(null);
  const currentBarRef = useRef(0);
  const nextBarTimeRef = useRef(0);
  const musicPlayingRef = useRef(false);

  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const progressStartRef = useRef<number | null>(null);
  const currentSceneRef = useRef(0);
  const isPlayingRef = useRef(true);

  // Keep refs in sync
  useEffect(() => { currentSceneRef.current = currentScene; }, [currentScene]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { musicPlayingRef.current = musicPlaying; }, [musicPlaying]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  }, []);

  const enterSite = useCallback(() => {
    stopMusicFn();
    localStorage.setItem("vv_intro_seen", "true");
    navigate("/home");
  }, [navigate]);

  // Audio engine functions
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(0.001, ctx.currentTime);
    mg.connect(ctx.destination);
    masterGainRef.current = mg;

    const convolver = ctx.createConvolver();
    const irLen = ctx.sampleRate * 2.5;
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.2);
    }
    convolver.buffer = ir;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.28;
    convolver.connect(reverbGain);
    reverbGain.connect(mg);
    reverbRef.current = convolver;
  }, []);

  const makeOsc = useCallback((freq: number, type: OscillatorType, startT: number, dur: number, gainVal: number, detune = 0) => {
    const ctx = audioCtxRef.current!;
    const mg = masterGainRef.current!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(g);
    g.connect(mg);
    if (reverbRef.current) {
      const rSend = ctx.createGain();
      rSend.gain.value = 0.3;
      osc.connect(rSend);
      rSend.connect(reverbRef.current);
    }
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(gainVal, startT + 0.04);
    g.gain.exponentialRampToValueAtTime(gainVal * 0.6, startT + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    osc.start(startT);
    osc.stop(startT + dur + 0.1);
    scheduledNodesRef.current.push(osc, g);
  }, []);

  const makeNoise = useCallback((startT: number, dur: number, gainVal: number, filterFreq: number) => {
    const ctx = audioCtxRef.current!;
    const mg = masterGainRef.current!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = filterFreq;
    filt.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, startT);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(mg);
    src.start(startT);
    src.stop(startT + dur + 0.05);
    scheduledNodesRef.current.push(src, g);
  }, []);

  const makeBass = useCallback((freq: number, startT: number, dur: number) => {
    makeOsc(freq, "sine", startT, dur, 0.35);
    makeOsc(freq * 2, "triangle", startT, dur * 0.3, 0.06);
  }, [makeOsc]);

  const playChord = useCallback((chordIdx: number, startT: number, dur: number) => {
    const notes = chords[chordIdx % chords.length];
    notes.forEach((freq, i) => {
      const strum = i * 0.018;
      makeOsc(freq, "sine", startT + strum, dur, 0.045);
      makeOsc(freq, "triangle", startT + strum, dur, 0.02, -3);
    });
    makeOsc(notes[0] / 2, "sine", startT, dur, 0.06);
  }, [makeOsc]);

  const scheduleBar = useCallback((barStart: number, barNum: number) => {
    const sixteenth = BEAT / 4;
    const chordIdx = barNum % chords.length;
    playChord(chordIdx, barStart, BEAT * 4 * 0.92);
    makeBass(bassNotes[chordIdx], barStart, BEAT * 0.7);
    makeBass(bassNotes[chordIdx], barStart + BEAT * 1.5, BEAT * 0.4);
    makeBass(bassNotes[chordIdx] * 1.125, barStart + BEAT * 2.5, BEAT * 0.5);
    makeBass(bassNotes[chordIdx], barStart + BEAT * 3, BEAT * 0.6);
    for (let s = 0; s < 16; s++) {
      const t = barStart + s * sixteenth;
      if (kickPattern[s]) makeNoise(t, 0.18, 0.55, 80);
      if (snarePattern[s]) makeNoise(t, 0.12, 0.3, 300);
      if (hihatPattern[s]) makeNoise(t, 0.04, 0.09, 5800);
      if (clavePattern[s]) makeNoise(t, 0.06, 0.18, 1200);
    }
    if (barNum % 2 === 0) {
      const penta = [chords[chordIdx][0], chords[chordIdx][1], chords[chordIdx][2], chords[chordIdx][4]];
      const phrase = [0, 2, 1, 3, 2, 1, 0, 2];
      phrase.forEach((noteIdx, i) => {
        const mT = barStart + i * BEAT * 0.5 + BEAT * 0.25;
        makeOsc(penta[noteIdx % penta.length], "sine", mT, BEAT * 0.38, 0.028);
      });
    }
  }, [playChord, makeBass, makeNoise, makeOsc]);

  const scheduleMusic = useCallback(() => {
    if (!musicPlayingRef.current || !audioCtxRef.current) return;
    while (nextBarTimeRef.current < audioCtxRef.current.currentTime + SCHEDULE_AHEAD) {
      scheduleBar(nextBarTimeRef.current, currentBarRef.current);
      nextBarTimeRef.current += BEAT * 4;
      currentBarRef.current++;
    }
  }, [scheduleBar]);

  const startMusicFn = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const mg = masterGainRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    musicPlayingRef.current = true;
    setMusicPlaying(true);
    currentBarRef.current = 0;
    nextBarTimeRef.current = ctx.currentTime + 0.1;
    mg.gain.cancelScheduledValues(ctx.currentTime);
    mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
    const targetVol = (volume / 100) * 0.7;
    mg.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 2.5);
    beatLoopRef.current = window.setInterval(scheduleMusic, LOOKAHEAD * 1000);
  }, [initAudio, scheduleMusic, volume]);

  const stopMusicFn = useCallback(() => {
    musicPlayingRef.current = false;
    setMusicPlaying(false);
    if (beatLoopRef.current) clearInterval(beatLoopRef.current);
    const ctx = audioCtxRef.current;
    const mg = masterGainRef.current;
    if (ctx && mg) {
      mg.gain.cancelScheduledValues(ctx.currentTime);
      mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
      mg.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function stopMusicCleanup() {
    musicPlayingRef.current = false;
    if (beatLoopRef.current) clearInterval(beatLoopRef.current);
    const ctx = audioCtxRef.current;
    const mg = masterGainRef.current;
    if (ctx && mg) {
      mg.gain.cancelScheduledValues(ctx.currentTime);
      mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
      mg.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
    }
  }

  const toggleMusic = useCallback(() => {
    if (!musicPlayingRef.current) startMusicFn();
    else stopMusicFn();
  }, [startMusicFn, stopMusicFn]);

  const handleVolume = useCallback((val: number) => {
    setVolume(val);
    const ctx = audioCtxRef.current;
    const mg = masterGainRef.current;
    if (ctx && mg && musicPlayingRef.current) {
      const v = (val / 100) * 0.7;
      mg.gain.cancelScheduledValues(ctx.currentTime);
      mg.gain.setValueAtTime(v, ctx.currentTime);
    }
  }, []);

  const startProgress = useCallback((sceneIdx: number) => {
    clearTimers();
    const dur = SCENE_DURATIONS[sceneIdx];
    progressStartRef.current = Date.now();
    setProgress(0);
    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (progressStartRef.current || 0);
      const pct = Math.min((elapsed / dur) * 100, 100);
      setProgress(pct);
    }, 50);
    timerRef.current = window.setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (isPlayingRef.current) {
        if (sceneIdx < TOTAL_SCENES - 1) {
          const next = sceneIdx + 1;
          setCurrentScene(next);
          setAnimKey((k) => k + 1);
        } else {
          setProgress(100);
          setIsPlaying(false);
          setPromoEnded(true);
        }
      }
    }, dur);
  }, [clearTimers]);

  // Auto-advance on scene change
  useEffect(() => {
    if (isPlaying) {
      startProgress(currentScene);
    }
    return clearTimers;
  }, [currentScene, animKey, isPlaying, startProgress, clearTimers]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      stopMusicCleanup();
    };
  }, []);

  const goToNext = useCallback(() => {
    clearTimers();
    setCurrentScene((prev) => {
      const next = (prev + 1) % TOTAL_SCENES;
      return next;
    });
    setAnimKey((k) => k + 1);
    setIsPlaying(true);
    setPromoEnded(false);
  }, [clearTimers]);

  const goToPrev = useCallback(() => {
    clearTimers();
    setCurrentScene((prev) => {
      const next = (prev - 1 + TOTAL_SCENES) % TOTAL_SCENES;
      return next;
    });
    setAnimKey((k) => k + 1);
    setIsPlaying(true);
    setPromoEnded(false);
  }, [clearTimers]);

  const goTo = useCallback((idx: number) => {
    clearTimers();
    setCurrentScene(idx);
    setAnimKey((k) => k + 1);
    setIsPlaying(true);
    setPromoEnded(false);
  }, [clearTimers]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimers();
    } else {
      setIsPlaying(true);
      if (currentScene === TOTAL_SCENES - 1 && promoEnded) {
        setCurrentScene(0);
        setPromoEnded(false);
      }
      setAnimKey((k) => k + 1);
    }
  }, [isPlaying, clearTimers, currentScene, promoEnded]);

  const getPlayLabel = () => {
    if (promoEnded && !isPlaying) return "▶ Replay";
    return isPlaying ? "⏸ Pause" : "▶ Play";
  };

  // Animation class helper - returns classes with key-based reset
  const ac = (cls: string) => `${cls}`;

  return (
    <>
      <style>{splashCSS}</style>

      {/* Skip / Enter Button */}
      <button
        className={`splash-skip-btn ${promoEnded ? "splash-skip-enter" : ""}`}
        onClick={enterSite}
      >
        {promoEnded ? "✦ Enter Site →" : "Skip Intro →"}
      </button>

      <div className="splash-promo">
        {/* Scene 1: Cold Open */}
        <div className={`splash-scene ${currentScene === 0 ? "active" : ""}`} key={`s1-${animKey}`}>
          <div className="splash-bg-dark" />
          <Scanlines />
          <Vignette />
          <SoundBars bars={soundBarsS1} />
          <div className="splash-scene-center">
            <PulseRings>
              <div className={`splash-mic-icon ${ac("splash-anim-scalein splash-d1")}`}>🎙️</div>
            </PulseRings>
          </div>
          <Watermark />
        </div>

        {/* Scene 2: Title Reveal */}
        <div className={`splash-scene ${currentScene === 1 ? "active" : ""}`} key={`s2-${animKey}`}>
          <div className="splash-bg-teal-glow" />
          <Scanlines />
          <Vignette />
          <SoundBars bars={soundBarsS2} />
          <div className="splash-scene-center">
            <div className={`splash-label ${ac("splash-anim-fadein splash-d1")}`}>Est. January 2026 · Houston, TX</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d2")}`}>Voices &</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d3")}`}><span className="splash-teal">Vibes</span></div>
            <DividerLine className={ac("splash-anim-fadein splash-d4")} />
            <div className={`splash-italic-title ${ac("splash-anim-fadein splash-d5")}`}>Healing Conversations & Restorative Jazz</div>
          </div>
          <Watermark />
        </div>

        {/* Scene 3: Tagline */}
        <div className={`splash-scene ${currentScene === 2 ? "active" : ""}`} key={`s3-${animKey}`}>
          <div className="splash-bg-dark" />
          <Scanlines />
          <Vignette />
          <div className="splash-scene-center">
            <div className={`splash-label splash-label-coral ${ac("splash-anim-fadein splash-d1")}`}>Our Mission</div>
            <div className={`splash-mono-title ${ac("splash-anim-fadeup splash-d2")}`}>Where <span className="splash-teal">Conversations</span></div>
            <div className={`splash-mono-title ${ac("splash-anim-fadeup splash-d3")}`}>Meet <span className="splash-coral">Jazz</span></div>
            <HLine className={ac("splash-anim-fadein splash-d4")} />
            <div className={`splash-mono-title ${ac("splash-anim-fadeup splash-d5")}`} style={{ fontSize: "clamp(1.2rem,3.5vw,2.5rem)" }}>Faith Meets <span className="splash-teal">Healing</span></div>
          </div>
          <Watermark />
        </div>

        {/* Scene 4: Streaming */}
        <div className={`splash-scene ${currentScene === 3 ? "active" : ""}`} key={`s4-${animKey}`}>
          <div className="splash-bg-teal-glow" />
          <Scanlines />
          <Vignette />
          <div className="splash-scene-center">
            <div className={`splash-live-badge ${ac("splash-anim-scalein splash-d1")}`}>
              <span className="splash-live-dot" /> Live Now
            </div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d2")}`} style={{ fontSize: "clamp(3rem,9vw,7rem)" }}>Streaming</div>
            <div className={`splash-mono-title ${ac("splash-anim-fadeup splash-d3")}`} style={{ color: "#009B9B", fontSize: "clamp(2rem,6vw,5rem)" }}>24/7</div>
            <div className={ac("splash-anim-fadein splash-d4")} style={{ marginTop: "1rem" }}>
              <ActiveBars />
            </div>
            <div className={`splash-body-text ${ac("splash-anim-fadein splash-d5")}`} style={{ marginTop: "1.5rem" }}>Streaming worldwide · voicesandvibesradio.com</div>
          </div>
          <Watermark />
        </div>

        {/* Scene 5: Weekly Themes */}
        <div className={`splash-scene ${currentScene === 4 ? "active" : ""}`} key={`s5-${animKey}`}>
          <div className="splash-bg-dark" />
          <Scanlines />
          <Vignette />
          <div className="splash-scene-center">
            <div className={`splash-label ${ac("splash-anim-fadein splash-d1")}`}>7 Days · 7 Themes</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d2")}`} style={{ fontSize: "clamp(2.5rem,7vw,5.5rem)" }}>Your Healing Journey</div>
            <div className="splash-theme-grid">
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d2")}`}><div className="splash-day">Sun</div><div className="splash-theme-name">Gospel Sunday</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d3")}`}><div className="splash-day">Mon</div><div className="splash-theme-name">Mindful Monday</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d3")}`}><div className="splash-day">Tue</div><div className="splash-theme-name">Healing Tuesday</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d4")}`}><div className="splash-day">Wed</div><div className="splash-theme-name">Connection Wed</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d4")}`}><div className="splash-day">Thu</div><div className="splash-theme-name">Purpose Thursday</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d5")}`} style={{ borderColor: "rgba(232,98,74,0.3)", background: "rgba(232,98,74,0.07)" }}><div className="splash-day" style={{ color: "#E8624A" }}>Fri</div><div className="splash-theme-name">Freedom Friday</div></div>
              <div className={`splash-theme-card ${ac("splash-anim-fadeup splash-d5")}`}><div className="splash-day">Sat</div><div className="splash-theme-name">Soul Saturday</div></div>
            </div>
          </div>
          <Watermark />
        </div>

        {/* Scene 6: Gospel Sunday */}
        <div className={`splash-scene ${currentScene === 5 ? "active" : ""}`} key={`s6-${animKey}`}>
          <div className="splash-bg-coral-glow" />
          <Scanlines />
          <Vignette />
          <div className="splash-scene-center">
            <div className={`splash-label splash-label-coral ${ac("splash-anim-fadein splash-d1")}`}>Every Sunday</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d2")}`} style={{ color: "#fff", fontSize: "clamp(2rem,6vw,5rem)" }}>Gospel</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d3")}`} style={{ fontSize: "clamp(3rem,9vw,7rem)" }}>Sunday</div>
            <DividerLine className={ac("splash-anim-fadein splash-d4")} />
            <div className={`splash-body-text ${ac("splash-anim-fadein splash-d5")}`}>Church spotlights · Gospel music · Faith-based healing<br />Featuring congregations from around the world</div>
            <div className={ac("splash-anim-fadeup splash-d6")} style={{ marginTop: "1.5rem" }}>
              <span className="splash-pill splash-pill-coral">100% Free Church Spotlight</span>
            </div>
          </div>
          <Watermark />
        </div>

        {/* Scene 7: Host */}
        <div className={`splash-scene ${currentScene === 6 ? "active" : ""}`} key={`s7-${animKey}`}>
          <div className="splash-bg-teal-glow" />
          <Scanlines />
          <Vignette />
          <div className="splash-scene-center">
            <div className={`splash-label ${ac("splash-anim-fadein splash-d1")}`}>Your Host</div>
            <div className={`splash-italic-title ${ac("splash-anim-slideleft splash-d2")}`} style={{ fontSize: "clamp(1rem,2.5vw,1.5rem)", color: "#009B9B", marginBottom: "0.5rem" }}>Licensed Professional Counselor · LPC, NCC</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d3")}`} style={{ fontSize: "clamp(3rem,9vw,7rem)", color: "#fff" }}>Doreatha</div>
            <div className={`splash-script-title ${ac("splash-anim-fadeup splash-d4")}`} style={{ fontSize: "clamp(3rem,9vw,7rem)" }}>Page</div>
            <HLine className={ac("splash-anim-fadein splash-d5")} />
            <div className={`splash-body-text ${ac("splash-anim-fadein splash-d5")}`}>Rooted In Hope Therapy · Houston, Texas</div>
          </div>
          <Watermark />
        </div>

        {/* Scene 8: CTA */}
        <div className={`splash-scene ${currentScene === 7 ? "active" : ""}`} key={`s8-${animKey}`}>
          <div className="splash-bg-dark" />
          <Scanlines />
          <Vignette />
          <SoundBars bars={soundBarsS8} />

          {/* Spinning vinyl record background */}
          <img
            src={vinylRecordImg}
            alt="Vinyl record"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 90vh)",
              height: "min(90vw, 90vh)",
              borderRadius: "50%",
              objectFit: "cover",
              zIndex: 0,
              filter: "brightness(0.45)",
              animation: musicPlaying ? "vinylSpin 12s linear infinite" : "none",
            }}
          />

          {/* Dark radial overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,12,12,0.5) 0%, rgba(8,12,12,0.75) 55%, rgba(8,12,12,0.92) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Center needle dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#009B9B",
              boxShadow: "0 0 14px #009B9B, 0 0 28px rgba(0,155,155,0.4)",
              zIndex: 3,
            }}
          />

          <div className="splash-scene-center" style={{ zIndex: 10 }}>
            <div className={`splash-mono-title splash-finale-title ${ac("splash-anim-fadeup splash-d2")}`}>Voices & <span className="splash-coral">Vibes</span></div>
            <div className={`splash-mono-title splash-finale-title ${ac("splash-anim-fadeup splash-d3")}`} style={{ fontSize: "clamp(1rem,3vw,2.2rem)", color: "#009B9B", letterSpacing: "0.2em" }}>RADIO</div>
            <DividerLine className={ac("splash-anim-fadein splash-d4")} />
            <div className={`splash-body-text ${ac("splash-anim-fadein splash-d5")}`}>Healing Conversations & Restorative Jazz · 24/7 Worldwide</div>
            <div className={ac("splash-anim-fadeup splash-d6")} style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="splash-enter-site-btn" onClick={enterSite}>Enter Site →</button>
            </div>
          </div>
          <Watermark />
        </div>

        {/* Progress bar */}
        <div className="splash-progress">
          <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Dots */}
        <div className="splash-dots">
          {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
            <div key={i} className={`splash-dot ${currentScene === i ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        {/* Controls */}
        <div className="splash-controls">
          <button className="splash-ctrl-btn" onClick={goToPrev}>← Prev</button>
          <button className="splash-play-pause" onClick={togglePlay}>{getPlayLabel()}</button>
          <span className="splash-scene-counter">{currentScene + 1} / {TOTAL_SCENES}</span>
          <button className="splash-ctrl-btn splash-ctrl-coral" onClick={goToNext}>Next →</button>
          <button
            className="splash-ctrl-btn"
            onClick={toggleMusic}
            style={{
              borderColor: musicPlaying ? "rgba(0,155,155,0.5)" : "rgba(232,98,74,0.4)",
              color: musicPlaying ? "#009B9B" : "#E8624A",
            }}
          >
            🎵 Music: {musicPlaying ? "On" : "Off"}
          </button>
          <input
            type="range"
            className="splash-vol-slider"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
};

// All CSS scoped with splash- prefix to avoid conflicts
const splashCSS = `
.splash-promo {
  width: 100vw; height: 100vh;
  position: relative; overflow: hidden;
  background: #000; cursor: pointer;
}

.splash-scene {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0s;
}
.splash-scene.active { opacity: 1; pointer-events: auto; transition: opacity 0.6s ease; }

/* Backgrounds */
.splash-bg-teal-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,155,155,0.25) 0%, transparent 70%),
             radial-gradient(ellipse 40% 40% at 10% 90%, rgba(232,98,74,0.15) 0%, transparent 60%),
             #050e0e;
}
.splash-bg-coral-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,98,74,0.22) 0%, transparent 65%),
             radial-gradient(ellipse 40% 40% at 90% 10%, rgba(0,155,155,0.12) 0%, transparent 60%),
             #0e0505;
}
.splash-bg-dark {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 90% 70% at 50% 30%, rgba(0,155,155,0.18) 0%, transparent 60%),
             #030808;
}

/* Scanlines */
.splash-scanlines {
  position: absolute; inset: 0; pointer-events: none; z-index: 50;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  animation: splashScanMove 8s linear infinite;
}
@keyframes splashScanMove { 0% { background-position: 0 0 } 100% { background-position: 0 100px } }

/* Vignette */
.splash-vignette {
  position: absolute; inset: 0; pointer-events: none; z-index: 49;
  background: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%);
}

/* Sound bars */
.splash-sound-bars-bg {
  position: absolute; bottom: 0; left: 0; right: 0; height: 220px;
  display: flex; align-items: flex-end; justify-content: center; gap: 5px;
  opacity: 0.07; pointer-events: none; z-index: 1; padding: 0 5%;
}
.splash-sb { width: 10px; border-radius: 3px 3px 0 0; animation: splashSbwave 1.6s ease-in-out infinite; }
.splash-sb-t { background: #009B9B; }
.splash-sb-c { background: #E8624A; }
@keyframes splashSbwave { 0%,100% { transform: scaleY(0.15) } 50% { transform: scaleY(1) } }

/* Mic icon */
.splash-mic-icon {
  font-size: 5rem;
  filter: drop-shadow(0 0 30px rgba(0,155,155,0.6));
  animation: splashMicPulse 3s ease-in-out infinite;
  position: relative; z-index: 10;
}
@keyframes splashMicPulse { 0%,100% { filter: drop-shadow(0 0 20px rgba(0,155,155,0.5)) } 50% { filter: drop-shadow(0 0 50px rgba(0,155,155,0.9)) } }

/* Pulse rings */
.splash-pulse-rings {
  position: relative; width: 300px; height: 300px;
  display: flex; align-items: center; justify-content: center;
}
.splash-ring {
  position: absolute; border-radius: 50%; border: 1px solid rgba(0,155,155,0.4);
  animation: splashRingPulse 3s ease-out infinite;
}
.splash-ring:nth-child(1) { width: 160px; height: 160px; animation-delay: 0s; }
.splash-ring:nth-child(2) { width: 220px; height: 220px; animation-delay: 0.6s; }
.splash-ring:nth-child(3) { width: 280px; height: 280px; animation-delay: 1.2s; }
@keyframes splashRingPulse { 0% { opacity: 0.6; transform: scale(0.8) } 100% { opacity: 0; transform: scale(1.3) } }

/* Active bars */
.splash-bars-active {
  display: flex; align-items: flex-end; gap: 4px; height: 60px;
  position: relative; z-index: 10;
}
.splash-bar-a {
  width: 7px; border-radius: 3px 3px 0 0;
  animation: splashBarAnim 0.8s ease-in-out infinite alternate;
}
.splash-bar-t { background: linear-gradient(to top, #007A7A, #00C4C4); }
.splash-bar-c { background: linear-gradient(to top, #c04030, #F07A62); }
@keyframes splashBarAnim { 0% { height: 8px } 100% { height: 55px } }

/* Text animations */
@keyframes splashFadeUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
@keyframes splashFadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes splashSlideLeft { from { opacity: 0; transform: translateX(-40px) } to { opacity: 1; transform: translateX(0) } }
@keyframes splashSlideRight { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
@keyframes splashScaleIn { from { opacity: 0; transform: scale(0.7) } to { opacity: 1; transform: scale(1) } }

.splash-anim-fadeup { animation: splashFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
.splash-anim-fadein { animation: splashFadeIn 1s ease both; }
.splash-anim-slideleft { animation: splashSlideLeft 0.9s cubic-bezier(0.16,1,0.3,1) both; }
.splash-anim-slideright { animation: splashSlideRight 0.9s cubic-bezier(0.16,1,0.3,1) both; }
.splash-anim-scalein { animation: splashScaleIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }

.splash-d1 { animation-delay: 0.2s; }
.splash-d2 { animation-delay: 0.55s; }
.splash-d3 { animation-delay: 0.95s; }
.splash-d4 { animation-delay: 1.35s; }
.splash-d5 { animation-delay: 1.75s; }
.splash-d6 { animation-delay: 2.15s; }

/* Typography */
.splash-label {
  font-size: clamp(10px,1.5vw,13px); letter-spacing: 0.4em; text-transform: uppercase;
  color: #009B9B; margin-bottom: 0.75rem;
  display: flex; align-items: center; gap: 0.75rem;
  font-family: 'Montserrat', sans-serif; font-weight: 700;
}
.splash-label::before, .splash-label::after {
  content: ''; display: block; width: 30px; height: 1px; background: #009B9B; opacity: 0.5;
}
.splash-label-coral { color: #E8624A; }
.splash-label-coral::before, .splash-label-coral::after { background: #E8624A; }

.splash-script-title {
  font-family: 'Dancing Script', cursive;
  font-size: clamp(4rem,12vw,9rem); font-weight: 700;
  line-height: 0.9; color: #E8624A;
  text-shadow: 0 0 60px rgba(232,98,74,0.3);
}
.splash-teal { color: #009B9B; text-shadow: 0 0 60px rgba(0,155,155,0.3); }
.splash-coral { color: #E8624A; }

.splash-mono-title {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.5rem,5vw,4rem); font-weight: 900;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #fff; line-height: 1.1;
}

.splash-italic-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.2rem,3.5vw,2.8rem); font-style: italic;
  color: rgba(240,220,200,0.9);
}

.splash-body-text {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(13px,2vw,17px); color: rgba(180,220,220,0.85);
  line-height: 1.9; font-weight: 300; max-width: 560px; text-align: center;
}

.splash-divider-line {
  width: 80px; height: 2px;
  background: linear-gradient(to right, #009B9B, #E8624A);
  margin: 1.5rem auto;
}

.splash-h-line {
  width: 100%; max-width: 500px; height: 1px;
  background: linear-gradient(to right, transparent, rgba(0,155,155,0.5), rgba(232,98,74,0.5), transparent);
  margin: 1.5rem auto;
}

.splash-scene-center {
  text-align: center; position: relative; z-index: 10; padding: 2rem;
}

/* Pill */
.splash-pill {
  display: inline-block;
  background: rgba(0,155,155,0.15); border: 1px solid rgba(0,155,155,0.4);
  color: #009B9B; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  padding: 6px 16px; font-weight: 700; font-family: 'Montserrat', sans-serif;
}
.splash-pill-coral { background: rgba(232,98,74,0.15); border-color: rgba(232,98,74,0.4); color: #E8624A; }

/* Theme cards */
.splash-theme-grid {
  display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; justify-content: center;
  position: relative; z-index: 10;
}
.splash-theme-card {
  background: rgba(0,155,155,0.08); border: 1px solid rgba(0,155,155,0.2);
  padding: 1rem 1.25rem; min-width: 140px; text-align: center;
}
.splash-day {
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: #009B9B; font-weight: 700; margin-bottom: 0.4rem;
  font-family: 'Montserrat', sans-serif;
}
.splash-theme-name {
  font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: #fff;
}

/* Skip button */
.splash-skip-btn {
  position: fixed; top: 1.2rem; right: 1.5rem; z-index: 300;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.6); font-family: 'Montserrat', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 8px 18px; cursor: pointer; backdrop-filter: blur(6px);
  transition: all 0.2s;
}
.splash-skip-btn:hover { background: rgba(0,155,155,0.3); border-color: rgba(0,155,155,0.6); color: #fff; }
.splash-skip-enter {
  background: rgba(0,155,155,0.4); border-color: #009B9B; color: #fff;
  padding: 12px 28px; font-size: 13px;
}

/* Enter site button */
.splash-enter-site-btn {
  display: inline-block;
  background: #009B9B; color: #000;
  padding: 16px 40px; font-size: 14px; font-weight: 900;
  letter-spacing: 0.18em; text-transform: uppercase;
  border: none; cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 0 40px rgba(0,155,155,0.5);
  animation: splashEnterPulse 2s ease-in-out infinite;
}
.splash-enter-site-btn:hover { background: #00C4C4; transform: scale(1.04); }
@keyframes splashEnterPulse {
  0%,100% { box-shadow: 0 0 30px rgba(0,155,155,0.4) }
  50% { box-shadow: 0 0 60px rgba(0,155,155,0.8) }
}

/* Progress bar */
.splash-progress {
  position: fixed; bottom: 72px; left: 0; right: 0; height: 3px;
  background: rgba(255,255,255,0.1); z-index: 100;
}
.splash-progress-fill {
  height: 100%; background: linear-gradient(to right, #009B9B, #E8624A);
  transition: width 0.1s linear;
}

/* Dots */
.splash-dots {
  position: fixed; bottom: 82px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 100;
}
.splash-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.25); transition: all 0.3s; cursor: pointer;
}
.splash-dot.active { background: #009B9B; transform: scale(1.4); }

/* Controls */
.splash-controls {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 1rem; z-index: 100;
}
.splash-ctrl-btn {
  background: rgba(0,155,155,0.15); border: 1px solid rgba(0,155,155,0.35);
  color: #009B9B; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 8px 20px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 700;
  transition: all 0.2s;
}
.splash-ctrl-btn:hover { background: rgba(0,155,155,0.3); }
.splash-ctrl-coral {
  background: rgba(232,98,74,0.15); border-color: rgba(232,98,74,0.35); color: #E8624A;
}
.splash-ctrl-coral:hover { background: rgba(232,98,74,0.3); }

.splash-play-pause {
  background: #009B9B; border: none; color: #000;
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 10px 28px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 700;
  transition: background 0.2s;
}
.splash-play-pause:hover { background: #00C4C4; }

.splash-scene-counter {
  font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.15em; min-width: 50px; text-align: center;
}

/* Live badge */
.splash-live-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(232,98,74,0.15); border: 1px solid rgba(232,98,74,0.4);
  color: #E8624A; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
  padding: 6px 16px; margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}
.splash-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #E8624A;
  animation: splashBlink 1.2s infinite;
}
@keyframes splashBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }

/* Watermark */
.splash-watermark {
  position: absolute; bottom: 130px; right: 3vw;
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(0,155,155,0.4); z-index: 10; font-weight: 700;
  font-family: 'Montserrat', sans-serif;
}

/* Finale glow */
@keyframes splashFinaleGlow {
  0%,100% { text-shadow: 0 0 40px rgba(0,155,155,0.4), 0 0 80px rgba(232,98,74,0.2) }
  50% { text-shadow: 0 0 80px rgba(0,155,155,0.8), 0 0 120px rgba(232,98,74,0.5) }
}
.splash-finale-title { animation: splashFinaleGlow 2.5s ease-in-out infinite; }

/* Volume slider */
.splash-vol-slider {
  width: 80px; accent-color: #009B9B; cursor: pointer; vertical-align: middle;
}
`;

export default Splash;
