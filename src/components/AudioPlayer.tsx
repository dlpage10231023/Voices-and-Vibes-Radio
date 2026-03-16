import { useState, useRef, useCallback, useEffect } from "react";

/* ═══ MOOD DATA ═══ */
const moods = [
  { name: "Healing Jazz · Smooth & Restorative", meta: "Therapy-inspired · Midtempo", bpm: 88, chordSet: 0 },
  { name: "Gospel Groove · Sunday Soul Vibes", meta: "Faith & Healing · Uplifting", bpm: 96, chordSet: 1 },
  { name: "Afrobeats Jazz · Rhythm & Restoration", meta: "Voices & Vibes Signature", bpm: 92, chordSet: 2 },
  { name: "Soul Saturday · Deep Rest & Peace", meta: "Self-Care Soundscape · Slow", bpm: 76, chordSet: 3 },
];

const CHORD_SETS = [
  [[293.66,349.23,440,523.25,659.25],[392,466.16,587.33,698.46,880],[466.16,587.33,698.46,932.33,1046.5],[440,523.25,659.25,783.99,987.77]],
  [[349.23,440,523.25,659.25,783.99],[392,466.16,587.33,698.46,880],[440,523.25,659.25,783.99,987.77],[466.16,587.33,698.46,932.33,1046.5]],
  [[293.66,349.23,440,523.25,659.25],[392,466.16,587.33,698.46,880],[466.16,587.33,698.46,932.33,1046.5],[440,523.25,659.25,783.99,987.77]],
  [[261.63,329.63,392,493.88,587.33],[329.63,392,493.88,587.33,783.99],[440,523.25,659.25,783.99,987.77],[349.23,440,523.25,659.25,783.99]],
];
const BASS_SETS = [
  [146.83,196,233.08,220],[174.61,196,220,233.08],[146.83,196,233.08,220],[130.81,164.81,220,174.61],
];
const KICKS  = [[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],[1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0],[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]];
const SNARES = [[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]];
const HIHATS = [[1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],[1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]];
const CLAVES = [[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],[0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0],[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];

const NUM_BARS = 30;
const LOOKAHEAD = 0.12;
const SCHEDULE_AHEAD = 0.28;

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodIdx, setMoodIdx] = useState(2);
  const [volume, setVolume] = useState(65);
  const [elapsed, setElapsed] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(NUM_BARS).fill(4));

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const beatLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vizRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentBarRef = useRef(0);
  const nextBarTimeRef = useRef(0);
  const playingRef = useRef(false);
  const moodIdxRef = useRef(2);
  const changingMood = useRef(false);

  /* keep ref in sync */
  useEffect(() => { moodIdxRef.current = moodIdx; }, [moodIdx]);

  const initCtx = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.001;
    master.connect(ctx.destination);
    masterRef.current = master;

    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
    conv.buffer = ir;
    const rg = ctx.createGain();
    rg.gain.value = 0.22;
    conv.connect(rg);
    rg.connect(master);
    reverbRef.current = conv;
  }, []);

  const osc = useCallback((freq: number, type: OscillatorType, t: number, dur: number, vol: number, det = 0) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const rs = ctx.createGain();
    rs.gain.value = 0.25;
    o.type = type; o.frequency.value = freq; o.detune.value = det;
    o.connect(g); g.connect(masterRef.current!);
    o.connect(rs); rs.connect(reverbRef.current!);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(vol * 0.55, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }, []);

  const noise = useCallback((t: number, dur: number, vol: number, cf: number) => {
    const ctx = ctxRef.current!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.09, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = cf; f.Q.value = 2.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(masterRef.current!);
    src.start(t); src.stop(t + dur + 0.04);
  }, []);

  const scheduleBar = useCallback((barStart: number, barNum: number) => {
    const mi = moodIdxRef.current;
    const mood = moods[mi];
    const beat = 60 / mood.bpm;
    const sixteenth = beat / 4;
    const ci = barNum % 4;
    const chords = CHORD_SETS[mood.chordSet];
    const bass = BASS_SETS[mood.chordSet];

    chords[ci].forEach((fr, i) => {
      const s = i * 0.02;
      osc(fr, "sine", barStart + s, beat * 3.8, 0.042);
      osc(fr, "triangle", barStart + s, beat * 3.8, 0.016, -4);
    });
    osc(chords[ci][0] / 2, "sine", barStart, beat * 4, 0.055);

    osc(bass[ci], "sine", barStart, beat * 0.65, 0.32);
    osc(bass[ci], "sine", barStart + beat * 1.5, beat * 0.38, 0.22);
    osc(bass[ci] * 1.125, "sine", barStart + beat * 2.5, beat * 0.45, 0.26);
    osc(bass[ci], "sine", barStart + beat * 3.0, beat * 0.55, 0.20);

    for (let s = 0; s < 16; s++) {
      const t = barStart + s * sixteenth;
      if (KICKS[mi][s]) noise(t, 0.18, 0.50, 80);
      if (SNARES[mi][s]) noise(t, 0.11, 0.28, 280);
      if (HIHATS[mi][s]) noise(t, 0.04, 0.08, 5800);
      if (CLAVES[mi][s]) noise(t, 0.06, 0.16, 1100);
    }

    if (barNum % 2 === 0) {
      const root = chords[ci];
      const mel = [root[0], root[1], root[2], root[4], root[2], root[1]];
      mel.forEach((fr, i) => {
        osc(fr, "sine", barStart + beat * 0.25 + i * beat * 0.55, beat * 0.42, 0.025);
      });
    }

    if (mi === 1 && barNum % 2 === 1) {
      [1, 1.5, 2, 3].forEach((bOff, i) => {
        osc(chords[ci][i % chords[ci].length], "square", barStart + beat * bOff, beat * 0.25, 0.018);
      });
    }
  }, [osc, noise]);

  const scheduler = useCallback(() => {
    if (!playingRef.current) return;
    const ctx = ctxRef.current!;
    const beat = 60 / moods[moodIdxRef.current].bpm;
    while (nextBarTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleBar(nextBarTimeRef.current, currentBarRef.current);
      nextBarTimeRef.current += beat * 4;
      currentBarRef.current++;
    }
  }, [scheduleBar]);

  const animViz = useCallback(() => {
    if (!playingRef.current) return;
    setBarHeights(Array(NUM_BARS).fill(0).map(() => 4 + Math.random() * 34));
    vizRef.current = setTimeout(animViz, 90);
  }, []);

  const startAudio = useCallback(() => {
    initCtx();
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    playingRef.current = true;
    setIsPlaying(true);
    currentBarRef.current = 0;
    nextBarTimeRef.current = ctx.currentTime + 0.1;
    const vol = (volume / 100) * 0.72;
    const m = masterRef.current!;
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(0.001, ctx.currentTime);
    m.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.2);
    beatLoopRef.current = setInterval(scheduler, LOOKAHEAD * 1000);
    animViz();
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, [initCtx, volume, scheduler, animViz]);

  const stopAudio = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    if (beatLoopRef.current) clearInterval(beatLoopRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (vizRef.current) clearTimeout(vizRef.current);
    setBarHeights(Array(NUM_BARS).fill(4));
    const ctx = ctxRef.current;
    if (ctx && masterRef.current) {
      const m = masterRef.current;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    }
  }, []);

  const togglePlay = useCallback(() => {
    playingRef.current ? stopAudio() : startAudio();
  }, [startAudio, stopAudio]);

  const changeMood = useCallback((dir: 1 | -1) => {
    if (changingMood.current) return;
    setMoodIdx(prev => {
      const next = (prev + dir + moods.length) % moods.length;
      moodIdxRef.current = next;
      if (playingRef.current) {
        changingMood.current = true;
        stopAudio();
        setTimeout(() => {
          startAudio();
          changingMood.current = false;
        }, 400);
      }
      return next;
    });
  }, [stopAudio, startAudio]);

  const handleVolume = useCallback((val: number) => {
    setVolume(val);
    if (ctxRef.current && masterRef.current && playingRef.current) {
      const v = (val / 100) * 0.72;
      const ctx = ctxRef.current;
      masterRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterRef.current.gain.setValueAtTime(v, ctx.currentTime);
    }
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (beatLoopRef.current) clearInterval(beatLoopRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (vizRef.current) clearTimeout(vizRef.current);
      ctxRef.current?.close();
    };
  }, []);

  const mood = moods[moodIdx];
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const progressPct = ((elapsed % 480) / 480) * 100;

  return (
    <div
      className="w-full max-w-[480px] relative overflow-hidden"
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(0,155,155,0.2)",
        padding: "2.5rem 2rem 2rem",
      }}
    >
      {/* Glow effects */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,155,155,0.12), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,98,74,0.08), transparent 70%)" }}
      />

      {/* Live badge */}
      <div
        className="inline-flex items-center gap-[7px] mb-6"
        style={{
          background: "rgba(232,98,74,0.12)",
          border: "1px solid rgba(232,98,74,0.35)",
          color: "#E8624A",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          padding: "5px 14px",
        }}
      >
        <span
          className="w-[6px] h-[6px] rounded-full"
          style={{ background: "#E8624A", animation: "ap-blink 1.3s infinite" }}
        />
        LIVE · voicesandvibesradio.com
      </div>

      {/* Station name */}
      <div className="font-dancing text-[2.2rem] font-bold leading-none" style={{ color: "#E8624A" }}>
        Voices &amp; <span style={{ color: "#009B9B" }}>Vibes</span>
      </div>
      <div
        className="font-montserrat mb-7"
        style={{
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#8ab8b8",
          fontWeight: 500,
          marginTop: "2px",
        }}
      >
        Healing Conversations &amp; Restorative Jazz
      </div>

      {/* Visualizer */}
      <div
        className="flex items-end justify-center gap-1 mb-7"
        style={{
          height: "46px",
          background: "rgba(0,155,155,0.04)",
          border: "1px solid rgba(0,155,155,0.1)",
          padding: "8px 12px",
        }}
      >
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: `${h}px`,
              borderRadius: "2px 2px 0 0",
              transition: "height 0.12s ease",
              background:
                i % 2 === 0
                  ? "linear-gradient(to top, #007A7A, #00C4C4)"
                  : "linear-gradient(to top, #c04030, #E8624A)",
            }}
          />
        ))}
      </div>

      {/* Now playing */}
      <div
        className="font-montserrat"
        style={{
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#009B9B",
          fontWeight: 700,
          marginBottom: "0.4rem",
        }}
      >
        Now Playing
      </div>
      <div
        className="font-montserrat overflow-hidden whitespace-nowrap relative"
        style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "0.2rem" }}
      >
        <span
          className="inline-block"
          style={{ animation: "ap-scroll-text 12s linear infinite" }}
        >
          {mood.name}
        </span>
      </div>
      <div
        className="font-montserrat"
        style={{ fontSize: "12px", color: "#8ab8b8", marginBottom: "1.5rem", fontWeight: 300 }}
      >
        {mood.meta}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full relative" style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(to right, #009B9B, #E8624A)",
              transition: "width 0.5s linear",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5" style={{ fontSize: "10px", color: "#8ab8b8", letterSpacing: "0.05em" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            {mins}:{String(secs).padStart(2, "0")}
          </span>
          <span style={{ color: "rgba(138,184,184,0.4)" }}>LIVE</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-7">
        <button
          onClick={() => changeMood(-1)}
          className="border-none cursor-pointer text-[1.1rem] p-1.5 transition-all"
          style={{ background: "none", color: "#8ab8b8" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#8ab8b8"; e.currentTarget.style.transform = "scale(1)"; }}
          title="Previous mood"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className="flex items-center justify-center border-none cursor-pointer text-[1.4rem] transition-all"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: isPlaying ? "#E8624A" : "#009B9B",
            color: "#0a0a0a",
            boxShadow: isPlaying
              ? "0 0 24px rgba(232,98,74,0.35)"
              : "0 0 24px rgba(0,155,155,0.35)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isPlaying ? "#F07A62" : "#00C4C4";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isPlaying ? "#E8624A" : "#009B9B";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => changeMood(1)}
          className="border-none cursor-pointer text-[1.1rem] p-1.5 transition-all"
          style={{ background: "none", color: "#8ab8b8" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#8ab8b8"; e.currentTarget.style.transform = "scale(1)"; }}
          title="Next mood"
        >
          ⏭
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 mb-7">
        <span style={{ fontSize: "14px", color: "#8ab8b8" }}>🔈</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => handleVolume(Number(e.target.value))}
          className="flex-1 h-[3px] cursor-pointer outline-none"
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            accentColor: "#009B9B",
          }}
        />
        <span
          className="font-montserrat"
          style={{ fontSize: "11px", color: "#8ab8b8", minWidth: "30px", textAlign: "right", letterSpacing: "0.05em" }}
        >
          {volume}%
        </span>
      </div>

      {/* Links */}
      <div className="flex gap-3">
        <a
          href="https://hello.citrus3.com:2020/public/voicesandvibes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center no-underline font-montserrat transition-all"
          style={{
            padding: "10px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "#009B9B",
            color: "#0a0a0a",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#00C4C4"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#009B9B"; }}
        >
          🎙️ Full Live Stream
        </a>
        <a
          href="#schedule"
          className="flex-1 text-center no-underline font-montserrat transition-all"
          style={{
            padding: "10px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1px solid rgba(0,155,155,0.3)",
            color: "#009B9B",
            background: "transparent",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,155,155,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          View Schedule
        </a>
      </div>

      {/* Footer */}
      <div
        className="mt-5 text-center font-montserrat"
        style={{
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(138,184,184,0.35)",
        }}
      >
        voicesandvibesradio.com · Est. Jan 2026
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes ap-blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        @keyframes ap-scroll-text { 0%,15%{transform:translateX(0)} 85%,100%{transform:translateX(-60%)} }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:14px; height:14px; border-radius:50%;
          background:#009B9B; cursor:pointer; box-shadow:0 0 8px rgba(0,155,155,0.5);
        }
        input[type=range]::-moz-range-thumb {
          width:14px; height:14px; border-radius:50%; border:none;
          background:#009B9B; cursor:pointer;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
