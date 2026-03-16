import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

/* ── helpers ── */
const fmt = (s: number) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
};

/* ── Past Spotlights data ── */
const pastSpotlights = [
  { id: 1, name: "Nia Soleil", track: "Golden Hour", color: "#007A7A" },
  { id: 2, name: "Marcus Reed", track: "Soul Revival", color: "#0d1a1a" },
  { id: 3, name: "Amara Joy", track: "Still Waters", color: "#1a0d0d" },
  { id: 4, name: "David Okon", track: "Restoration", color: "#007A7A" },
];

const ArtistPlayer = () => {
  const navigate = useNavigate();

  /* ── state ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [artSrc, setArtSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaArtist, setMetaArtist] = useState("");
  const [metaAlbum, setMetaAlbum] = useState("");
  const [metaYear, setMetaYear] = useState("");

  /* right column state */
  const [trackStory, setTrackStory] = useState("");

  /* ── refs ── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  /* ── computed display values ── */
  const dispTitle = metaTitle || "Upload a track to begin";
  const dispArtist = metaArtist || "Artist Name";
  const dispAlbum =
    (metaAlbum || "Album") + (metaYear ? " · " + metaYear : " · Year");
  const scrollTitle = dispTitle.length > 28;

  /* ── init audio element once ── */
  useEffect(() => {
    const a = new Audio();
    a.volume = 0.8;
    audioRef.current = a;

    const onTime = () => {
      if (!a.duration) return;
      setElapsed(a.currentTime);
      setProgress((a.currentTime / a.duration) * 100);
    };
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => {
      if (a.loop) {
        a.currentTime = 0;
        a.play();
      } else {
        stopPlay();
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.pause();
      cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── analyser init ── */
  const initAnalyser = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 128;
    an.smoothingTimeConstant = 0.82;
    const src = ctx.createMediaElementSource(audioRef.current!);
    src.connect(an);
    an.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = an;
    sourceRef.current = src;
  }, []);

  /* ── visualizer draw loop ── */
  const drawVis = useCallback(() => {
    const an = analyserRef.current;
    const canvas = canvasRef.current;
    if (!an || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const bufLen = an.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      an.getByteFrequencyData(data);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const floor = ctx.createLinearGradient(0, 0, 0, canvas.height);
      floor.addColorStop(0, "rgba(0,0,0,0)");
      floor.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barW = (canvas.width / bufLen) * 2.2;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (data[i] / 255) * canvas.height * 0.95;
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(0,155,155,0.85)" : "rgba(232,98,74,0.7)";
        ctx.fillRect(x, canvas.height - barH, barW - 1, barH);
        x += barW + 1;
      }
    };
    draw();
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ── play / stop ── */
  const stopPlay = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    cancelAnimationFrame(animRef.current);
    clearCanvas();
  }, [clearCanvas]);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current!;
    if (!a.src) {
      audioInputRef.current?.click();
      return;
    }
    initAnalyser();
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();

    if (isPlaying) {
      stopPlay();
    } else {
      a.play();
      setIsPlaying(true);
      drawVis();
    }
  }, [isPlaying, initAnalyser, stopPlay, drawVis]);

  /* ── controls ── */
  const skipBack = () => {
    const a = audioRef.current!;
    a.currentTime = Math.max(0, a.currentTime - 10);
  };
  const skipFwd = () => {
    const a = audioRef.current!;
    a.currentTime = Math.min(a.duration || 0, a.currentTime + 10);
  };
  const toggleLoop = () => {
    setIsLooping((v) => {
      audioRef.current!.loop = !v;
      return !v;
    });
  };
  const toggleShuffle = () => setIsShuffled((v) => !v);
  const toggleMute = () => {
    setIsMuted((v) => {
      audioRef.current!.muted = !v;
      return !v;
    });
  };
  const handleVolume = (val: number) => {
    setVolume(val);
    audioRef.current!.volume = val / 100;
  };
  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current!;
    if (!a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * a.duration;
  };

  /* ── file loading ── */
  const loadAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    audioRef.current!.src = url;
    audioRef.current!.load();
    if (!metaTitle) {
      const name = file.name.replace(/\.[^/.]+$/, "");
      setMetaTitle(name);
    }
  };
  const loadImage = (file: File) => {
    setArtSrc(URL.createObjectURL(file));
  };

  /* ── drag & drop ── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    for (const f of Array.from(e.dataTransfer.files)) {
      if (f.type.startsWith("audio/")) loadAudio(f);
      else if (f.type.startsWith("image/")) loadImage(f);
    }
  };

  /* ── load past spotlight into player ── */
  const loadSpotlight = (spot: typeof pastSpotlights[0]) => {
    setMetaArtist(spot.name);
    setMetaTitle(spot.track);
    setMetaAlbum("");
    setMetaYear("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* inline styles for animations */}
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes tscroll{0%,15%{transform:translateX(0)}85%,100%{transform:translateX(-40%)}}
        .art-canvas-wrap{position:absolute;bottom:0;left:0;right:0;height:80px;pointer-events:none;transition:opacity .4s}
        input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.1);height:3px;border-radius:2px;cursor:pointer;outline:none;flex:1}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#009B9B;cursor:pointer;box-shadow:0 0 6px rgba(0,155,155,.5)}
        input[type=range]::-moz-range-thumb{width:13px;height:13px;border-radius:50%;border:none;background:#009B9B}
      `}</style>

      {/* ── Page Header ── */}
      <div className="text-center pt-[100px] px-[5vw] mb-8">
        <span
          className="font-dancing text-[2rem] font-bold block mb-1"
          style={{
            background: "linear-gradient(135deg,#009B9B,#E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Voices &amp; Vibes Radio
        </span>
        <div
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "#8ab8b8", fontFamily: "'Share Tech Mono', monospace" }}
        >
          Artist Spotlight Player
        </div>
      </div>

      {/* ── Two Column Grid ── */}
      <div
        className="artist-grid grid gap-8 px-[5vw] pb-[80px] items-start mx-auto"
        style={{
          gridTemplateColumns: "480px minmax(0, 600px)",
          maxWidth: "1200px",
        }}
      >
        {/* ===== LEFT COLUMN — Player Card ===== */}
        <div className="flex flex-col items-center justify-end h-full">
          {/* Player Card */}
          <div
            className="w-full relative overflow-hidden"
            style={{
              maxWidth: 520,
              background: "#1a1a1a",
              border: dragOver
                ? "1px solid #009B9B"
                : "1px solid rgba(0,155,155,0.2)",
              boxShadow: dragOver ? "0 0 30px rgba(0,155,155,0.2)" : "none",
              transition: "border-color .2s, box-shadow .2s",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {/* glow effects */}
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle at top left, rgba(0,155,155,0.1), transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 pointer-events-none"
              style={{
                width: 160,
                height: 160,
                background:
                  "radial-gradient(circle at bottom right, rgba(232,98,74,0.08), transparent 70%)",
              }}
            />

            {/* ── Album Art Zone ── */}
            <div
              className="w-full relative overflow-hidden flex items-center justify-center cursor-pointer"
              style={{
                aspectRatio: "1/1",
                maxHeight: 340,
                background: "#0d0d0d",
              }}
              onClick={() => {
                if (artSrc) imgInputRef.current?.click();
              }}
            >
              {/* Image */}
              {artSrc && (
                <img
                  src={artSrc}
                  alt="Album Art"
                  className="w-full h-full object-cover"
                  style={{
                    transition: "transform .6s ease, filter .4s ease",
                    transform: isPlaying ? "scale(1.04)" : "scale(1)",
                    filter: isPlaying ? "brightness(0.85)" : "brightness(1)",
                  }}
                />
              )}

              {/* Placeholder */}
              {!artSrc && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{
                    background: "linear-gradient(135deg,#0d1a1a,#1a0d0d)",
                  }}
                >
                  <div className="text-[4rem] opacity-40">🎙️</div>
                  <p
                    className="text-[11px] tracking-[0.2em] uppercase text-center px-8"
                    style={{ color: "#8ab8b8", maxWidth: 200 }}
                  >
                    Upload album art or drag &amp; drop an image here
                  </p>
                  <button
                    className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer"
                    style={{
                      background: "rgba(0,155,155,0.15)",
                      border: "1px solid rgba(0,155,155,0.4)",
                      color: "#009B9B",
                      padding: "8px 20px",
                      transition: "background .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(0,155,155,0.3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(0,155,155,0.15)")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      imgInputRef.current?.click();
                    }}
                  >
                    Choose Image
                  </button>
                </div>
              )}

              {/* Vinyl ring (playing only) */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: isPlaying ? 1 : 0,
                  transition: "opacity .4s",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle,rgba(0,0,0,0.85) 30%,rgba(0,155,155,0.3) 31%,rgba(0,0,0,0.6) 60%,rgba(232,98,74,0.2) 61%,rgba(0,0,0,0.7) 100%)",
                    border: "2px solid rgba(0,155,155,0.3)",
                    animation: isPlaying ? "spin 4s linear infinite" : "none",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#009B9B",
                    boxShadow: "0 0 12px rgba(0,155,155,0.6)",
                  }}
                />
              </div>

              {/* Canvas visualizer */}
              <canvas
                ref={canvasRef}
                className="art-canvas-wrap"
                style={{ opacity: isPlaying ? 1 : 0 }}
              />

              {/* NOW PLAYING badge */}
              <div
                className="absolute top-4 left-4 flex items-center gap-[6px] font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase text-white"
                style={{
                  background: "rgba(232,98,74,0.85)",
                  padding: "5px 12px",
                  opacity: isPlaying ? 1 : 0,
                  transition: "opacity .3s",
                }}
              >
                <span
                  className="inline-block rounded-full bg-white"
                  style={{
                    width: 6,
                    height: 6,
                    animation: "blink 1.2s infinite",
                  }}
                />
                Now Playing
              </div>

              {/* Watermark */}
              <div
                className="absolute bottom-3 right-4 font-dancing font-bold text-[1rem] pointer-events-none"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  opacity: isPlaying ? 1 : 0,
                  transition: "opacity .3s",
                }}
              >
                Voices &amp; Vibes Radio
              </div>
            </div>

            {/* ── Track Info ── */}
            <div
              className="relative"
              style={{
                padding: "1.5rem 1.75rem 1.25rem",
                borderBottom: "1px solid rgba(0,155,155,0.08)",
              }}
            >
              <div
                className="font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase mb-[0.4rem]"
                style={{ color: "#009B9B" }}
              >
                🎙️ Voices &amp; Vibes Radio · Artist Spotlight
              </div>
              <div className="text-[1.15rem] font-montserrat font-bold text-white mb-[0.2rem] whitespace-nowrap overflow-hidden">
                <span
                  className="inline-block"
                  style={{
                    animation: scrollTitle
                      ? "tscroll 14s linear infinite"
                      : "none",
                  }}
                >
                  {dispTitle}
                </span>
              </div>
              <div
                className="font-montserrat text-[13px] mb-[0.1rem]"
                style={{ color: "#8ab8b8" }}
              >
                {dispArtist}
              </div>
              <div
                className="font-montserrat font-light text-[11px] italic"
                style={{ color: "rgba(138,184,184,0.5)" }}
              >
                {dispAlbum}
              </div>
            </div>

            {/* ── Progress ── */}
            <div style={{ padding: "1rem 1.75rem 0.75rem" }}>
              <div
                className="w-full relative cursor-pointer mb-2"
                style={{
                  height: 4,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                }}
                onClick={seekTo}
              >
                <div
                  className="h-full pointer-events-none"
                  style={{
                    width: `${progress}%`,
                    borderRadius: 2,
                    background: "linear-gradient(to right,#009B9B,#E8624A)",
                    transition: "width .25s linear",
                  }}
                />
              </div>
              <div
                className="flex justify-between text-[10px] tracking-[0.06em]"
                style={{ color: "#8ab8b8" }}
              >
                <span>{fmt(elapsed)}</span>
                <span>{duration > 0 ? fmt(duration) : "0:00"}</span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div
              className="flex items-center justify-center"
              style={{ padding: "0.75rem 1.75rem 1rem", gap: "1.25rem" }}
            >
              <button
                className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]"
                style={{ color: isShuffled ? "#009B9B" : "#8ab8b8" }}
                onClick={toggleShuffle}
                title="Shuffle"
              >
                🔀
              </button>
              <button
                className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]"
                style={{ color: "#8ab8b8" }}
                onClick={skipBack}
                title="Back 10s"
              >
                ⏪
              </button>
              <button
                className="border-none cursor-pointer flex items-center justify-center text-[1.5rem] transition-all"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: isPlaying ? "#E8624A" : "#009B9B",
                  color: "#0a0a0a",
                  boxShadow: isPlaying
                    ? "0 0 28px rgba(232,98,74,0.4)"
                    : "0 0 28px rgba(0,155,155,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={togglePlay}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]"
                style={{ color: "#8ab8b8" }}
                onClick={skipFwd}
                title="Forward 10s"
              >
                ⏩
              </button>
              <button
                className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]"
                style={{ color: isLooping ? "#009B9B" : "#8ab8b8" }}
                onClick={toggleLoop}
                title="Loop"
              >
                🔁
              </button>
            </div>

            {/* ── Volume ── */}
            <div
              className="flex items-center w-full"
              style={{ padding: "0 1.75rem 1.25rem", gap: "0.75rem" }}
            >
              <span
                className="text-[14px] cursor-pointer"
                style={{ color: "#8ab8b8" }}
                onClick={toggleMute}
              >
                {isMuted ? "🔇" : "🔈"}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolume(Number(e.target.value))}
              />
              <span
                className="text-[11px] min-w-[32px] text-right"
                style={{
                  color: "#8ab8b8",
                  fontFamily: "'Share Tech Mono', monospace",
                }}
              >
                {volume}%
              </span>
            </div>

            {/* ── Upload Section ── */}
            <div
              className="grid grid-cols-2"
              style={{
                borderTop: "1px solid rgba(0,155,155,0.08)",
                padding: "1.25rem 1.75rem",
                gap: "0.75rem",
              }}
            >
              <button
                className="flex flex-col items-center gap-[0.4rem] cursor-pointer text-center transition-all"
                style={{
                  background: "rgba(0,155,155,0.05)",
                  border: "1px dashed rgba(0,155,155,0.25)",
                  padding: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,155,155,0.12)";
                  e.currentTarget.style.borderColor = "rgba(0,155,155,0.5)";
                  e.currentTarget.style.borderStyle = "solid";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,155,155,0.05)";
                  e.currentTarget.style.borderColor = "rgba(0,155,155,0.25)";
                  e.currentTarget.style.borderStyle = "dashed";
                }}
                onClick={() => audioInputRef.current?.click()}
              >
                <div className="text-[1.4rem]">🎵</div>
                <div
                  className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: "#009B9B" }}
                >
                  Upload Track
                </div>
                <div className="text-[10px]" style={{ color: "#8ab8b8" }}>
                  MP3, WAV, OGG
                </div>
              </button>
              <button
                className="flex flex-col items-center gap-[0.4rem] cursor-pointer text-center transition-all"
                style={{
                  background: "rgba(232,98,74,0.05)",
                  border: "1px dashed rgba(232,98,74,0.25)",
                  padding: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(232,98,74,0.12)";
                  e.currentTarget.style.borderColor = "rgba(232,98,74,0.5)";
                  e.currentTarget.style.borderStyle = "solid";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(232,98,74,0.05)";
                  e.currentTarget.style.borderColor = "rgba(232,98,74,0.25)";
                  e.currentTarget.style.borderStyle = "dashed";
                }}
                onClick={() => imgInputRef.current?.click()}
              >
                <div className="text-[1.4rem]">🖼️</div>
                <div
                  className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: "#E8624A" }}
                >
                  Album Art
                </div>
                <div className="text-[10px]" style={{ color: "#8ab8b8" }}>
                  JPG, PNG, WebP
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN — Info Panels ===== */}
        <div className="flex flex-col gap-3">

          {/* ── Section label ── */}
          <div
            className="font-montserrat text-[9px] tracking-[0.25em] uppercase"
            style={{ color: "#5a9090", paddingLeft: 2 }}
          >
            Artist info
          </div>

          {/* ── Row 1: Artist Bio Card ── */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(0,155,155,0.2)",
              padding: "1rem 1.25rem",
            }}
          >
            {/* Top row: avatar + name/pills */}
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar thumbnail */}
              <div
                className="flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, #1a2a2a, #0a1010)",
                  border: "1px solid rgba(0,155,155,0.3)",
                }}
              >
                {artSrc ? (
                  <img src={artSrc} alt="Artist" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[1.4rem] opacity-60">🎩</span>
                )}
              </div>
              <div className="min-w-0">
                <div
                  className="font-dancing font-bold text-[1.25rem] leading-tight mb-[2px]"
                  style={{ color: "#E8624A" }}
                >
                  {metaArtist || "Artist Name"}
                </div>
                <div
                  className="font-montserrat text-[10px] tracking-[0.12em] uppercase mb-2"
                  style={{ color: "#8ab8b8" }}
                >
                  Houston, TX · Jazz · Gospel
                </div>
                <div className="flex flex-wrap gap-[5px]">
                  {["Jazz", "Gospel"].map((tag) => (
                    <span
                      key={tag}
                      className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase"
                      style={{
                        padding: "2px 8px",
                        border: "1px solid rgba(0,155,155,0.3)",
                        background: "rgba(0,155,155,0.1)",
                        color: "#009B9B",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase"
                    style={{
                      padding: "2px 8px",
                      border: "1px solid rgba(232,98,74,0.3)",
                      background: "rgba(232,98,74,0.1)",
                      color: "#E8624A",
                    }}
                  >
                    Soon 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Bio text */}
            <p
              className="font-montserrat font-light text-[12px] leading-[1.7] mb-3"
              style={{ color: "#8ab8b8" }}
            >
              A soulful guitarist bringing healing through music. Known for blending smooth jazz with gospel influences, his sound is a journey through faith and feeling.
            </p>

            {/* Social row */}
            <div className="flex items-center gap-2">
              {["Facebook", "Instagram"].map((label) => (
                <button
                  key={label}
                  className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#8ab8b8",
                    padding: "4px 10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(0,155,155,0.4)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
                  }
                >
                  {label}
                </button>
              ))}
              <button
                className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all"
                style={{
                  border: "1px solid rgba(232,98,74,0.35)",
                  color: "#E8624A",
                  padding: "4px 10px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(232,98,74,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Book Artist
              </button>
            </div>
          </div>

          {/* ── Row 2: About This Track ── */}
          <div
            className="font-montserrat font-bold text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "#009B9B" }}
          >
            About this track
          </div>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(0,155,155,0.2)",
              padding: "0.85rem 1rem",
            }}
          >
            <textarea
              value={trackStory}
              onChange={(e) => setTrackStory(e.target.value)}
              placeholder="A powerful upcoming release blending smooth jazz guitar with gospel soul. This track carries a message of hope and healing — a perfect fit for the Voices & Vibes community."
              rows={3}
              className="w-full font-montserrat text-[11px] outline-none resize-none mb-3"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: "#8ab8b8",
                lineHeight: "1.65",
              }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-[5px]">
              {["Smooth Jazz", "Gospel Soul", "Healing", "2025 Release"].map((tag) => (
                <span
                  key={tag}
                  className="font-montserrat text-[8px] tracking-[0.08em]"
                  style={{
                    padding: "2px 8px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#5a9090",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Row 3: Past Artist Spotlights ── */}
          <div
            className="font-montserrat font-bold text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "#009B9B" }}
          >
            Previous spotlights
          </div>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(0,155,155,0.2)",
              padding: "0.85rem 1rem",
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {pastSpotlights.slice(0, 3).map((spot) => (
                <button
                  key={spot.id}
                  className="text-left cursor-pointer transition-all overflow-hidden"
                  style={{
                    background: "#0f1a1a",
                    border: "1px solid rgba(0,155,155,0.15)",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(232,98,74,0.5)";
                    e.currentTarget.style.boxShadow =
                      "0 0 14px rgba(232,98,74,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,155,155,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => loadSpotlight(spot)}
                >
                  {/* Thumbnail art */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      height: 48,
                      background: `linear-gradient(135deg, ${spot.color}, #0d1818)`,
                    }}
                  >
                    <span className="text-[1.1rem] opacity-50">🎵</span>
                  </div>
                  <div style={{ padding: "5px 8px" }}>
                    <div className="font-montserrat font-bold text-[10px] text-white truncate">
                      {spot.name}
                    </div>
                    <div
                      className="font-montserrat text-[9px] truncate"
                      style={{ color: "#5a9090" }}
                    >
                      {spot.track}
                    </div>
                  </div>
                </button>
              ))}

              {/* Submit Your Artist card */}
              <div
                className="flex items-center justify-center cursor-pointer transition-all"
                style={{
                  border: "1px dashed rgba(0,155,155,0.2)",
                  background: "transparent",
                  minHeight: 82,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,155,155,0.5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,155,155,0.2)")
                }
              >
                <div className="text-center">
                  <div
                    className="font-montserrat font-bold text-[11px]"
                    style={{ color: "#009B9B" }}
                  >
                    + Submit
                  </div>
                  <div
                    className="font-montserrat text-[9px]"
                    style={{ color: "#5a9090" }}
                  >
                    Your Artist
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Metadata Fields ── */}
          <div
            className="font-montserrat font-bold text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "#009B9B" }}
          >
            Track details
          </div>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(0,155,155,0.2)",
              padding: "0.85rem 1rem",
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Track Title", value: metaTitle, set: setMetaTitle, ph: "Song name" },
                { label: "Artist", value: metaArtist, set: setMetaArtist, ph: "Artist name" },
                { label: "Album", value: metaAlbum, set: setMetaAlbum, ph: "Album title" },
                { label: "Year", value: metaYear, set: setMetaYear, ph: "2024" },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    className="block font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-[0.3rem]"
                    style={{ color: "#009B9B" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full font-montserrat text-[11px] text-white outline-none"
                    style={{
                      background: "rgba(0,155,155,0.05)",
                      border: "1px solid rgba(0,155,155,0.2)",
                      padding: "7px 9px",
                      transition: "border-color .2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#009B9B")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,155,155,0.2)")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer Links ── */}
          <div className="flex gap-2 mt-1">
            <a
              href="https://hello.citrus3.com:2020/public/voicesandvibes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase no-underline transition-all"
              style={{ background: "#009B9B", color: "#0a0a0a", padding: 9 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#00C4C4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#009B9B")}
            >
              🎙️ Full Live Stream
            </a>
            <button
              className="flex-1 text-center font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all"
              style={{ border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: 9 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,155,155,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => navigate("/home")}
            >
              ← Back to Site
            </button>
          </div>

          {/* ── Feature Pills ── */}
          <div className="flex flex-wrap gap-[5px] mt-1">
            {["Real Audio Visualizer", "Album Art", "MP3 · WAV · OGG", "voicesandvibesradio.com"].map((p) => (
              <span
                key={p}
                className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase"
                style={{ padding: "3px 9px", border: "1px solid rgba(0,155,155,0.25)", color: "#8ab8b8" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && loadAudio(e.target.files[0])}
      />
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
      />

      {/* ── Responsive: stack on mobile ── */}
      <style>{`
        @media (max-width: 768px) {
          .artist-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1200px) {
          .artist-grid {
            grid-template-columns: 380px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ArtistPlayer;
