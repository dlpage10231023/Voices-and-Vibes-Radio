import { useRef, useState, useEffect } from "react";
import vinylImg from "@/assets/vinyl-record-new.jpg";

const CHANNELS = [
  { id: "01", label: "Jazz", name: "Healing Jazz", desc: "Therapy-inspired · Midtempo", bpm: 88 },
  { id: "02", label: "Gospel", name: "Gospel Groove", desc: "Faith & Healing · Uplifting", bpm: 96 },
  { id: "03", label: "Signature", name: "Afrobeats Jazz", desc: "Rhythm & Restoration", bpm: 92 },
  { id: "04", label: "Soul", name: "Soul Saturday", desc: "Self-Care Soundscape · Slow", bpm: 76 },
  { id: "05", label: "New", name: "Gospel Sunday", desc: "Faith · Worship · Healing", bpm: 84 },
  { id: "06", label: "New", name: "Healing Meditation", desc: "Therapeutic · Breathwork · Calm", bpm: 60 },
  { id: "07", label: "New", name: "Soul Saturday Deep", desc: "R&B Soul · Night Healing", bpm: 70 },
  { id: "08", label: "New", name: "Trap Jazz Fusion", desc: "Urban · Jazz · Powerful", bpm: 108 },
];

const RecordBar = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState(2);
  const [showChannels, setShowChannels] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const schedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTimeRef = useRef(0);
  const chordIdxRef = useRef(0);
  const eqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eqBarsRef = useRef<HTMLDivElement[]>([]);

  const currentChannel = CHANNELS[activeChannel];

  const CHORDS = [
    [146.83, 174.61, 220, 261.63, 329.63],
    [196, 233.08, 293.66, 349.23, 440],
    [233.08, 293.66, 349.23, 440, 523.25],
    [220, 261.63, 329.63, 392, 493.88],
  ];
  const BASS = [146.83, 196, 233.08, 220];
  const KICK  = [1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0];
  const SNARE = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
  const HAT   = [1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1];

  function initAudio() {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    masterGainRef.current = gain;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBufferRef.current = buf;
  }

  function playNote(freq: number, t: number, dur: number, vol: number, atk: number, rel: number) {
    const ctx = audioCtxRef.current!;
    const gain = masterGainRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.5);
    g.gain.linearRampToValueAtTime(0, t + dur + rel);
    o.connect(g);
    g.connect(gain);
    o.start(t);
    o.stop(t + dur + rel + 0.2);
  }

  function playKick(t: number) {
    const ctx = audioCtxRef.current!;
    const gain = masterGainRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(148, t);
    o.frequency.exponentialRampToValueAtTime(74, t + 0.52);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
    o.connect(g);
    g.connect(gain);
    o.start(t);
    o.stop(t + 0.6);
  }

  function playSnare(t: number) {
    const ctx = audioCtxRef.current!;
    const gain = masterGainRef.current!;
    const n = ctx.createBufferSource();
    n.buffer = noiseBufferRef.current;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 280;
    f.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(f);
    f.connect(g);
    g.connect(gain);
    n.start(t);
    n.stop(t + 0.22);
  }

  function playHat(t: number) {
    const ctx = audioCtxRef.current!;
    const gain = masterGainRef.current!;
    const n = ctx.createBufferSource();
    n.buffer = noiseBufferRef.current;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    n.connect(f);
    f.connect(g);
    g.connect(gain);
    n.start(t);
    n.stop(t + 0.07);
  }

  function scheduleBar(t: number, barDur: number) {
    const ci = chordIdxRef.current;
    playNote(BASS[ci], t, barDur * 1.1, 0.13, 0.12, 0.8);
    const vols = [0.06, 0.048, 0.042, 0.036, 0.03];
    CHORDS[ci].forEach((freq, i) =>
      playNote(freq, t + i * 0.06, barDur * 0.92, vols[i] || 0.025, 0.18 + i * 0.04, 0.6)
    );
    const stepDur = barDur / 16;
    for (let s = 0; s < 16; s++) {
      const st = t + s * stepDur;
      if (KICK[s]) playKick(st);
      if (SNARE[s]) playSnare(st);
      if (HAT[s]) playHat(st);
    }
    chordIdxRef.current = (ci + 1) % 4;
  }

  function startScheduler() {
    const barDur = (60 / 92) * 4;
    nextTimeRef.current = audioCtxRef.current!.currentTime + 0.1;
    chordIdxRef.current = 0;
    schedIntervalRef.current = setInterval(() => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      while (nextTimeRef.current < ctx.currentTime + 0.15) {
        scheduleBar(nextTimeRef.current, barDur);
        nextTimeRef.current += barDur;
      }
    }, 100);
  }

  function startEQ() {
    eqIntervalRef.current = setInterval(() => {
      eqBarsRef.current.forEach((bar) => {
        if (bar) bar.style.height = (4 + Math.random() * 20) + "px";
      });
    }, 90);
  }

  function stopEQ() {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqBarsRef.current.forEach((bar) => {
      if (bar) bar.style.height = "4px";
    });
  }

  function togglePlay() {
    initAudio();
    const ctx = audioCtxRef.current!;
    const gain = masterGainRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    if (!isPlaying) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
      startScheduler();
      startEQ();
      setIsPlaying(true);
    } else {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      if (schedIntervalRef.current) clearInterval(schedIntervalRef.current);
      stopEQ();
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    return () => {
      if (schedIntervalRef.current) clearInterval(schedIntervalRef.current);
      if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-[199] flex items-center overflow-hidden"
      style={{
        top: 66,
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
            animationPlayState: isPlaying ? "running" : "paused",
            filter: isPlaying ? "brightness(1)" : "brightness(0.8)",
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
          <span className="flex items-center gap-1" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#E8624A" }}>
            <span className="rounded-full animate-blink" style={{ width: 5, height: 5, background: "#E8624A", display: "inline-block" }} />
            Live Now
          </span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.45)", letterSpacing: "0.08em" }}>Est. Jan 2026</span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.45)" }}>
            {isPlaying ? "33 RPM · Spinning" : "33 RPM · Idle"}
          </span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          {/* BPM Badge — always visible */}
          <span
            id="rbBpmDisplay"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              color: "#009B9B",
              background: "rgba(0,155,155,0.12)",
              border: "1px solid rgba(0,155,155,0.3)",
              padding: "3px 10px",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {currentChannel.bpm} BPM · {currentChannel.name}
          </span>
          <span style={{ color: "rgba(138,184,184,0.3)", fontSize: 8 }}>·</span>
          {/* Channel selector button */}
          <button
            onClick={() => setShowChannels(!showChannels)}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              fontWeight: 700,
              color: "#E8624A",
              background: "rgba(232,98,74,0.1)",
              border: "1px solid rgba(232,98,74,0.3)",
              padding: "2px 8px",
              letterSpacing: "0.1em",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ♫ CH {currentChannel.id} ▾
          </button>
        </div>
        {/* Channel dropdown */}
        {showChannels && (
          <div
            className="absolute left-6 z-[300] flex flex-col gap-0.5"
            style={{
              top: 90,
              background: "#0d1a1a",
              border: "1px solid rgba(0,155,155,0.3)",
              padding: 6,
              maxHeight: 220,
              overflowY: "auto",
              minWidth: 260,
            }}
          >
            {CHANNELS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => { setActiveChannel(idx); setShowChannels(false); }}
                className="flex items-center gap-2 text-left cursor-pointer border-none"
                style={{
                  padding: "4px 8px",
                  background: idx === activeChannel ? "rgba(0,155,155,0.15)" : "transparent",
                  borderLeft: idx === activeChannel ? "2px solid #009B9B" : "2px solid transparent",
                }}
              >
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.5)" }}>{ch.id}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: ch.label === "New" ? "#E8624A" : "#009B9B", minWidth: 50 }}>{ch.label}</span>
                <span style={{ fontSize: 9, color: "#f5efe8", fontWeight: 600 }}>{ch.name}</span>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "rgba(138,184,184,0.45)", marginLeft: "auto" }}>{ch.bpm} BPM</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CENTER-RIGHT — EQ Bars */}
      <div className="flex items-end gap-0.5 mr-4 flex-shrink-0" style={{ height: 28 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) eqBarsRef.current[i] = el; }}
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
            color: isPlaying ? "#009B9B" : "#8ab8b8",
            background: "rgba(0,155,155,0.06)",
            border: "1px solid rgba(0,155,155,0.15)",
            padding: "3px 8px",
          }}
        >
          {isPlaying ? "● 33 RPM" : "33 RPM"}
        </span>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center border-none cursor-pointer"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: isPlaying ? "#E8624A" : "#009B9B",
            color: "#0a0a0a",
            fontSize: "1rem",
            boxShadow: isPlaying
              ? "0 0 16px rgba(232,98,74,0.35)"
              : "0 0 16px rgba(0,155,155,0.35)",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
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
