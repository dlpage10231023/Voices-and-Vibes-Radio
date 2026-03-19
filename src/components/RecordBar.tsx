import { useRef, useState, useCallback, useEffect } from "react";
import vinylImg from "@/assets/vinyl-record.png";

/* ── Chord / drum data (Afrobeats Jazz 92 BPM) ── */
const CHORDS = [
  [146.83, 174.61, 220, 261.63, 329.63],
  [196, 233.08, 293.66, 349.23, 440],
  [233.08, 293.66, 349.23, 440, 523.25],
  [220, 261.63, 329.63, 392, 493.88],
];
const BASS = [146.83, 196, 233.08, 220];
const KICK_PAT  = [1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0];
const SNARE_PAT = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
const HAT_PAT   = [1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1];
const BPM = 92;
const STEP_DUR = 60 / BPM / 4;
const NOTE_VOLS = [0.06, 0.048, 0.042, 0.036, 0.03];

const RecordBar = () => {
  const [playing, setPlaying] = useState(false);
  const actxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const schedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const eqBarsRef = useRef<HTMLDivElement>(null);
  const eqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Noise buffer ── */
  const getNoise = useCallback((ctx: AudioContext) => {
    if (noiseRef.current) return noiseRef.current;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseRef.current = buf;
    return buf;
  }, []);

  /* ── Synth helpers ── */
  const playChord = useCallback((ctx: AudioContext, master: GainNode, chordIdx: number, time: number) => {
    const freqs = CHORDS[chordIdx % 4];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = ctx.createGain();
      const t = time + i * 0.06;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(NOTE_VOLS[i] ?? 0.03, t + 0.18);
      g.gain.linearRampToValueAtTime(0, t + 0.18 + 0.6);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.18 + 0.6 + 0.05);
    });
    // bass
    const bassOsc = ctx.createOscillator();
    bassOsc.type = "sine";
    bassOsc.frequency.value = BASS[chordIdx % 4];
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, time);
    bg.gain.linearRampToValueAtTime(0.13, time + 0.12);
    bg.gain.linearRampToValueAtTime(0, time + 0.12 + 0.6);
    bassOsc.connect(bg).connect(master);
    bassOsc.start(time);
    bassOsc.stop(time + 0.12 + 0.6 + 0.05);
  }, []);

  const playKick = useCallback((ctx: AudioContext, master: GainNode, time: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(148, time);
    osc.frequency.exponentialRampToValueAtTime(74, time + 0.52);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.52);
    osc.connect(g).connect(master);
    osc.start(time);
    osc.stop(time + 0.55);
  }, []);

  const playSnare = useCallback((ctx: AudioContext, master: GainNode, time: number) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 280;
    bp.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    src.connect(bp).connect(g).connect(master);
    src.start(time);
    src.stop(time + 0.2);
  }, [getNoise]);

  const playHat = useCallback((ctx: AudioContext, master: GainNode, time: number) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    src.connect(hp).connect(g).connect(master);
    src.start(time);
    src.stop(time + 0.06);
  }, [getNoise]);

  /* ── Scheduler ── */
  const scheduleStep = useCallback((ctx: AudioContext, master: GainNode, step: number, time: number) => {
    const s = step % 16;
    if (s === 0) playChord(ctx, master, Math.floor(step / 16) % 4, time);
    if (KICK_PAT[s]) playKick(ctx, master, time);
    if (SNARE_PAT[s]) playSnare(ctx, master, time);
    if (HAT_PAT[s]) playHat(ctx, master, time);
  }, [playChord, playKick, playSnare, playHat]);

  const startScheduler = useCallback((ctx: AudioContext, master: GainNode) => {
    stepRef.current = 0;
    nextStepTimeRef.current = ctx.currentTime + 0.1;
    schedRef.current = setInterval(() => {
      while (nextStepTimeRef.current < ctx.currentTime + 0.15) {
        scheduleStep(ctx, master, stepRef.current, nextStepTimeRef.current);
        nextStepTimeRef.current += STEP_DUR;
        stepRef.current++;
      }
    }, 100);
  }, [scheduleStep]);

  /* ── EQ bars animation ── */
  const startEqAnim = useCallback(() => {
    eqIntervalRef.current = setInterval(() => {
      const el = eqBarsRef.current;
      if (!el) return;
      const bars = el.children;
      for (let i = 0; i < bars.length; i++) {
        (bars[i] as HTMLElement).style.height = `${4 + Math.random() * 18}px`;
      }
    }, 90);
  }, []);

  const stopEqAnim = useCallback(() => {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqIntervalRef.current = null;
    const el = eqBarsRef.current;
    if (el) {
      for (let i = 0; i < el.children.length; i++) {
        (el[i] as unknown as HTMLElement)?.style && ((el.children[i] as HTMLElement).style.height = "4px");
      }
    }
  }, []);

  /* ── Play / Pause ── */
  const handleToggle = useCallback(async () => {
    if (playing) {
      // stop
      const m = masterRef.current;
      const ctx = actxRef.current;
      if (m && ctx) {
        m.gain.cancelScheduledValues(ctx.currentTime);
        m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
        m.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      }
      if (schedRef.current) clearInterval(schedRef.current);
      schedRef.current = null;
      stopEqAnim();
      setPlaying(false);
      return;
    }

    // start
    let ctx = actxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      actxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctx.state === "suspended") await ctx.resume();
    const master = masterRef.current!;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
    startScheduler(ctx, master);
    startEqAnim();
    setPlaying(true);
  }, [playing, startScheduler, startEqAnim, stopEqAnim]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (schedRef.current) clearInterval(schedRef.current);
      if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    };
  }, []);

  return (
    <div
      className="relative w-full flex items-center overflow-hidden"
      style={{
        height: 100,
        background: "linear-gradient(135deg, #080c0c, #0d1a1a, #080c0c)",
        borderBottom: "1px solid rgba(0,155,155,0.2)",
      }}
    >
      {/* Left glow */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: 200,
          background: "radial-gradient(ellipse at left center, rgba(0,155,155,0.12), transparent 70%)",
        }}
      />

      {/* LEFT — Spinning Record */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
        <img
          src={vinylImg}
          alt="Vinyl record"
          className="rounded-full object-cover object-center"
          style={{
            width: 88,
            height: 88,
            animation: "vinylSpin 10s linear infinite",
            animationPlayState: playing ? "running" : "paused",
            filter: playing ? "brightness(1)" : "brightness(0.8)",
          }}
        />
        {/* Center dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 10,
            height: 10,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#009B9B",
            boxShadow: "0 0 8px #009B9B",
          }}
        />
        {/* Needle arm */}
        <div
          className="absolute"
          style={{
            right: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 16,
            height: 2,
            background: "linear-gradient(to right, #009B9B, transparent)",
            opacity: 0.6,
          }}
        />
      </div>

      {/* CENTER — Station Info */}
      <div className="flex-1 px-6 min-w-0">
        <div
          className="font-dancing font-bold leading-tight"
          style={{
            fontSize: "1.6rem",
            background: "linear-gradient(90deg, #009B9B, #E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Voices &amp; Vibes Radio
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#8ab8b8",
            letterSpacing: "0.08em",
          }}
        >
          Restorative Conversations meet Jazz · Houston, TX
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Live badge */}
          <span className="flex items-center gap-1" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#E8624A" }}>
            <span className="rounded-full animate-blink" style={{ width: 5, height: 5, background: "#E8624A", display: "inline-block" }} />
            Live Now
          </span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.45)", letterSpacing: "0.08em" }}>Est. Jan 2026</span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.45)" }}>
            {playing ? "33 RPM · Spinning" : "33 RPM · Idle"}
          </span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              color: "#009B9B",
              background: "rgba(0,155,155,0.08)",
              border: "1px solid rgba(0,155,155,0.2)",
              padding: "2px 7px",
            }}
          >
            92 BPM · Afrobeats Jazz
          </span>
        </div>
      </div>

      {/* CENTER-RIGHT — EQ Bars */}
      <div ref={eqBarsRef} className="flex items-end gap-0.5 mr-4 flex-shrink-0" style={{ height: 28 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 4,
              borderRadius: 1,
              background: i % 2 === 0 ? "#009B9B" : "#E8624A",
              transition: "height 80ms ease",
            }}
          />
        ))}
      </div>

      {/* RIGHT — Controls */}
      <div className="flex items-center gap-2 pr-5 flex-shrink-0">
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 8,
            color: playing ? "#009B9B" : "#8ab8b8",
            background: "rgba(0,155,155,0.06)",
            border: "1px solid rgba(0,155,155,0.15)",
            padding: "3px 8px",
          }}
        >
          {playing ? "● 33 RPM" : "33 RPM"}
        </span>

        <button
          onClick={handleToggle}
          className="flex items-center justify-center border-none cursor-pointer"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: playing ? "#E8624A" : "#009B9B",
            color: "#0a0a0a",
            fontSize: "1rem",
            boxShadow: playing
              ? "0 0 16px rgba(232,98,74,0.35)"
              : "0 0 16px rgba(0,155,155,0.35)",
          }}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <a
          href="https://hello.citrus3.com:2020/public/voicesandvibes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 no-underline"
          style={{
            background: "rgba(0,155,155,0.08)",
            border: "1px solid rgba(0,155,155,0.25)",
            padding: "8px 14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,155,155,0.16)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,155,155,0.08)")}
        >
          <span style={{ fontSize: 14 }}>🎙️</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#009B9B" }}>
            Live Stream
          </span>
        </a>
      </div>
    </div>
  );
};

export default RecordBar;
