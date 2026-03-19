import { useState, useRef, useCallback, useEffect } from "react";

/* ═══ 8 HEALING MOODS ═══ */
const MOODS = [
  {
    id: 0, name: "Healing Jazz", sub: "Smooth & Restorative · 88 BPM", badge: "Jazz", bpm: 88,
    desc: "Therapy-inspired · Midtempo", accent: "#009B9B",
    chords: [[146.83,174.61,220,261.63,329.63],[196,233.08,293.66,349.23,440],[233.08,293.66,349.23,440,523.25],[220,261.63,329.63,392,493.88]],
    bass: [146.83,196,233.08,220],
    kick:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    hat:[1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0], clave:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
  },
  {
    id: 1, name: "Gospel Groove", sub: "Sunday Soul Vibes · 96 BPM", badge: "Gospel", bpm: 96,
    desc: "Faith & Healing · Uplifting", accent: "#009B9B",
    chords: [[174.61,220,261.63,329.63,415.3],[196,233.08,293.66,349.23,440],[220,261.63,329.63,392,493.88],[233.08,293.66,349.23,440,523.25]],
    bass: [174.61,196,220,233.08],
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hat:[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1], clave:[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0],
  },
  {
    id: 2, name: "Afrobeats Jazz", sub: "Voices & Vibes Signature · 92 BPM", badge: "Signature", bpm: 92,
    desc: "Rhythm & Restoration", accent: "#009B9B",
    chords: [[146.83,174.61,220,261.63,329.63],[196,233.08,293.66,349.23,440],[233.08,293.66,349.23,440,523.25],[220,261.63,329.63,392,493.88]],
    bass: [146.83,196,233.08,220],
    kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hat:[1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1], clave:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
  },
  {
    id: 3, name: "Soul Saturday", sub: "Deep Rest & Peace · 76 BPM", badge: "Soul", bpm: 76,
    desc: "Self-Care Soundscape · Slow", accent: "#009B9B",
    chords: [[261.63,329.63,392,493.88,587.33],[164.81,220,261.63,329.63,415.3],[220,261.63,329.63,415.3,493.88],[174.61,220,261.63,329.63,440]],
    bass: [130.81,164.81,220,174.61],
    kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hat:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0], clave:[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
  },
  {
    id: 4, name: "Gospel Sunday", sub: "Church & Praise Vibes · 84 BPM", badge: "New", bpm: 84,
    desc: "Faith · Worship · Healing", accent: "#8855CC",
    chords: [[196,246.94,293.66,369.99,493.88],[261.63,329.63,392,493.88,523.25],[164.81,220,261.63,329.63,415.3],[146.83,220,293.66,370,440]],
    bass: [98,130.81,82.41,73.42],
    kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], snare:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,0],
    hat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], clave:[1,0,0,1,0,1,0,0,1,0,0,1,0,0,1,0],
  },
  {
    id: 5, name: "Healing Meditation", sub: "Stillness & Restoration · 60 BPM", badge: "New", bpm: 60,
    desc: "Therapeutic · Breathwork · Calm", accent: "#8855CC",
    chords: [[220,277.18,329.63,415.3,554.37],[185,220,277.18,329.63,440],[146.83,185,220,277.18,370],[164.81,220,293.66,369.99,440]],
    bass: [55,46.25,36.71,41.20],
    kick:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], snare:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    hat:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], clave:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
  },
  {
    id: 6, name: "Soul Saturday Deep", sub: "Late Night Rest · 70 BPM", badge: "New", bpm: 70,
    desc: "R&B Soul · Night Healing", accent: "#009B9B",
    chords: [[155.56,196,233.08,311.13,392],[130.81,155.56,196,233.08,311.13],[174.61,207.65,261.63,311.13,415.3],[116.54,155.56,185,233.08,311.13]],
    bass: [77.78,65.41,87.31,58.27],
    kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hat:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], clave:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
  },
  {
    id: 7, name: "Trap Jazz Fusion", sub: "Healing Energy · 108 BPM", badge: "New", bpm: 108,
    desc: "Urban · Jazz · Powerful", accent: "#E8624A",
    chords: [[146.83,196,220,293.66,370,440],[196,246.94,293.66,370,466.16,587.33],[261.63,329.63,392,493.88,587.33,659.26],[174.61,220,277.18,329.63,415.3,554.37]],
    bass: [73.42,98,65.41,87.31],
    kick:[1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    hat:[1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0], clave:[1,0,1,0,0,0,1,0,0,1,0,0,1,0,0,0],
  },
];

const NUM_BARS = 30;
const SCHEDULE_AHEAD = 0.15;

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodIdx, setMoodIdx] = useState(2);
  const [volume, setVolume] = useState(65);
  const [elapsed, setElapsed] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(NUM_BARS).fill(4));

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const compRef = useRef<DynamicsCompressorNode | null>(null);
  const beatLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vizRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const playingRef = useRef(false);
  const moodIdxRef = useRef(2);
  const changingMood = useRef(false);

  useEffect(() => { moodIdxRef.current = moodIdx; }, [moodIdx]);

  const initCtx = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Compressor
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    compRef.current = comp;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0.001;
    masterRef.current = master;

    // EQ
    const eqLow = ctx.createBiquadFilter();
    eqLow.type = "lowshelf"; eqLow.frequency.value = 200; eqLow.gain.value = 2;
    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type = "highshelf"; eqHigh.frequency.value = 4000; eqHigh.gain.value = -2;

    // Reverb (3.5s impulse)
    const conv = ctx.createConvolver();
    const irLen = ctx.sampleRate * 3.5;
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.8);
    }
    conv.buffer = ir;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.35;
    conv.connect(reverbGain);
    reverbGain.connect(master);
    reverbRef.current = conv;

    // Signal chain: comp → eqLow → eqHigh → master → destination
    comp.connect(eqLow);
    eqLow.connect(eqHigh);
    // Direct signal
    const directGain = ctx.createGain();
    directGain.gain.value = 0.4;
    eqHigh.connect(directGain);
    directGain.connect(master);
    // Reverb send
    eqHigh.connect(conv);

    master.connect(ctx.destination);
  }, []);

  /* ═══ SYNTH: Chord tones (sine only, rolled) ═══ */
  const playChord = useCallback((freqs: number[], t: number, dur: number, vol: number) => {
    const ctx = ctxRef.current!;
    freqs.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(compRef.current!);
      const start = t + i * 0.06; // rolled stagger
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.18); // soft attack
      g.gain.setValueAtTime(vol, start + dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.55); // long release
      o.start(start);
      o.stop(start + dur + 0.6);
    });
  }, []);

  /* ═══ SYNTH: Bass note ═══ */
  const playBass = useCallback((freq: number, t: number, dur: number, vol: number) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(compRef.current!);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.12); // bass attack
    g.gain.setValueAtTime(vol, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  }, []);

  /* ═══ DRUMS ═══ */
  const playKick = useCallback((t: number, freq = 55) => {
    const ctx = ctxRef.current!;
    // Oscillator layer
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 2, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    o.connect(og);
    og.gain.setValueAtTime(0.9, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.52);
    og.connect(compRef.current!);
    o.start(t);
    o.stop(t + 0.55);
    // Noise layer
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 180;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(lp); lp.connect(ng); ng.connect(compRef.current!);
    src.start(t); src.stop(t + 0.25);
  }, []);

  const playSnare = useCallback((t: number, tone = 200) => {
    const ctx = ctxRef.current!;
    // Noise layer
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = tone; bp.Q.value = 1.5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(bp); bp.connect(ng); ng.connect(compRef.current!);
    src.start(t); src.stop(t + 0.2);
    // Triangle tone
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = "triangle"; o.frequency.value = tone;
    o.connect(og);
    og.gain.setValueAtTime(0.2, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    og.connect(compRef.current!);
    o.start(t); o.stop(t + 0.2);
  }, []);

  const playHat = useCallback((t: number, hp = 7000) => {
    const ctx = ctxRef.current!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass"; hpf.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(hpf); hpf.connect(g); g.connect(compRef.current!);
    src.start(t); src.stop(t + 0.06);
  }, []);

  const playClave = useCallback((t: number, freq = 800) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    o.connect(g);
    g.gain.setValueAtTime(0.24, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    g.connect(compRef.current!);
    o.start(t); o.stop(t + 0.08);
  }, []);

  /* ═══ SCHEDULER ═══ */
  const scheduleStep = useCallback((stepTime: number, step: number) => {
    const mi = moodIdxRef.current;
    const mood = MOODS[mi];
    const beat = 60 / mood.bpm;
    const s = step % 16;
    const ci = Math.floor(step / 16) % 4;

    // Play chord on beat 0 of each bar
    if (s === 0) {
      playChord(mood.chords[ci], stepTime, beat * 3.8, 0.035);
      playBass(mood.bass[ci], stepTime, beat * 0.65, 0.28);
    }
    // Extra bass hits
    if (s === 6) playBass(mood.bass[ci], stepTime, beat * 0.38, 0.18);
    if (s === 10) playBass(mood.bass[ci] * 1.125, stepTime, beat * 0.45, 0.22);

    // Drums
    if (mood.kick[s]) playKick(stepTime);
    if (mood.snare[s]) playSnare(stepTime);
    if (mood.hat[s]) playHat(stepTime);
    if (mood.clave[s]) playClave(stepTime);
  }, [playChord, playBass, playKick, playSnare, playHat, playClave]);

  const scheduler = useCallback(() => {
    if (!playingRef.current) return;
    const ctx = ctxRef.current!;
    const mood = MOODS[moodIdxRef.current];
    const stepDur = 60 / mood.bpm / 4;
    while (nextStepTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(nextStepTimeRef.current, currentStepRef.current);
      nextStepTimeRef.current += stepDur;
      currentStepRef.current++;
    }
  }, [scheduleStep]);

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
    currentStepRef.current = 0;
    nextStepTimeRef.current = ctx.currentTime + 0.1;
    const vol = (volume / 100) * 0.72;
    const m = masterRef.current!;
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(0.001, ctx.currentTime);
    m.gain.linearRampToValueAtTime(vol, ctx.currentTime + 3.5);
    beatLoopRef.current = setInterval(scheduler, 100);
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
      m.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    }
  }, []);

  const togglePlay = useCallback(() => {
    playingRef.current ? stopAudio() : startAudio();
  }, [startAudio, stopAudio]);

  const changeMood = useCallback((dir: 1 | -1) => {
    if (changingMood.current) return;
    setMoodIdx(prev => {
      const next = (prev + dir + MOODS.length) % MOODS.length;
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

  const selectMood = useCallback((idx: number) => {
    if (changingMood.current || idx === moodIdxRef.current) return;
    setMoodIdx(idx);
    moodIdxRef.current = idx;
    if (playingRef.current) {
      changingMood.current = true;
      stopAudio();
      setTimeout(() => {
        startAudio();
        changingMood.current = false;
      }, 400);
    }
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

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (beatLoopRef.current) clearInterval(beatLoopRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (vizRef.current) clearTimeout(vizRef.current);
      ctxRef.current?.close();
    };
  }, []);

  const mood = MOODS[moodIdx];
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
        8 Healing Moods · 24/7 Worldwide
      </div>

      {/* Visualizer */}
      <div
        className="flex items-end justify-center gap-1 mb-2"
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
                  ? `linear-gradient(to top, ${mood.accent}99, ${mood.accent})`
                  : "linear-gradient(to top, #c04030, #E8624A)",
            }}
          />
        ))}
      </div>

      {/* Mood indicator dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {MOODS.map((m, i) => (
          <button
            key={i}
            onClick={() => selectMood(i)}
            className="border-none cursor-pointer p-0 transition-all"
            style={{
              width: i === moodIdx ? "10px" : "6px",
              height: i === moodIdx ? "10px" : "6px",
              borderRadius: "50%",
              background: i === moodIdx ? m.accent : "rgba(138,184,184,0.3)",
              boxShadow: i === moodIdx ? `0 0 10px ${m.accent}88` : "none",
            }}
            title={m.name}
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
          {mood.name} · {mood.sub}
        </span>
      </div>
      <div
        className="font-montserrat"
        style={{ fontSize: "12px", color: "#8ab8b8", marginBottom: "1.2rem", fontWeight: 300 }}
      >
        {mood.desc}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="w-full relative" style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: `linear-gradient(to right, ${mood.accent}, #E8624A)`,
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
      <div className="flex items-center justify-center gap-4 mb-5">
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
      <div className="flex items-center gap-3 mb-5">
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

      {/* Mood Grid — 2 columns */}
      <div
        className="grid gap-2 mb-5"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {MOODS.map((m, i) => {
          const active = i === moodIdx;
          return (
            <button
              key={m.id}
              onClick={() => selectMood(i)}
              className="border-none cursor-pointer text-left p-3 transition-all font-montserrat"
              style={{
                background: active ? `${m.accent}15` : "rgba(255,255,255,0.03)",
                border: active ? `1px solid ${m.accent}` : "1px solid rgba(255,255,255,0.06)",
                boxShadow: active ? `0 0 16px ${m.accent}30` : "none",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: "9px", color: "#8ab8b8", letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: m.badge === "New" ? m.accent : "#8ab8b8",
                    background: m.badge === "New" ? `${m.accent}20` : "rgba(138,184,184,0.1)",
                    padding: "2px 6px",
                  }}
                >
                  {m.badge}
                </span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: active ? "#fff" : "#ccc", marginBottom: "2px" }}>
                {m.name}
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "9px", color: "#8ab8b8", fontWeight: 300 }}>{m.desc}</span>
                <span style={{ fontSize: "9px", color: active ? m.accent : "rgba(138,184,184,0.5)", fontWeight: 600 }}>
                  {m.bpm}
                </span>
              </div>
            </button>
          );
        })}
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
