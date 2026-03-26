import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecordBar from "@/components/RecordBar";
import { useArtistAudio } from "@/components/ArtistAudioProvider";
import { supabase } from "@/integrations/supabase/client";

/* ── helpers ── */
const fmt = (s: number) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
};

interface ArchivedSpot {
  id: string;
  artist: string | null;
  title: string | null;
  image_url: string | null;
  featured_week: string | null;
}


const ArtistPlayer = () => {
  const navigate = useNavigate();
  const ctx = useArtistAudio();
  const [archivedSpots, setArchivedSpots] = useState<ArchivedSpot[]>([]);
  const [featuredWeek, setFeaturedWeek] = useState<string | null>(null);

  useEffect(() => {
    // Fetch featured week from live row
    supabase.from("artist_spotlight").select("featured_week").eq("status", "live").limit(1).maybeSingle().then(({ data }) => {
      if (data?.featured_week) setFeaturedWeek(data.featured_week);
    });
    // Fetch archived spotlights
    supabase.from("artist_spotlight").select("id,artist,title,image_url,featured_week").eq("status", "archived").order("updated_at", { ascending: false }).limit(4).then(({ data }) => {
      if (data) setArchivedSpots(data);
    });
  }, []);

  const {
    isPlaying, elapsed, duration, progress, volume, isMuted, isLooping, isShuffled,
    metaTitle, metaArtist, metaAlbum, metaYear, artSrc,
    togglePlay, skipBack, skipFwd, seekTo,
    nextTrack, prevTrack, trackIndex, trackCount,
    toggleLoop, toggleShuffle, toggleMute, setVolume,
    loadAudioFile, loadImageFile, setArtSrc,
    audioElement, getAnalyser,
    isPlayingCommercial,
  } = ctx;

  const imgInputRef = useRef<HTMLInputElement | null>(null);

  /* ── Visualizer (uses shared analyser from provider) ── */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  const drawVis = useCallback(() => {
    const an = getAnalyser();
    const canvas = canvasRef.current;
    if (!an || !canvas) return;
    const c = canvas.getContext("2d")!;
    const bufLen = an.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      an.getByteFrequencyData(data);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      c.clearRect(0, 0, canvas.width, canvas.height);

      const floor = c.createLinearGradient(0, 0, 0, canvas.height);
      floor.addColorStop(0, "rgba(0,0,0,0)");
      floor.addColorStop(1, "rgba(0,0,0,0.6)");
      c.fillStyle = floor;
      c.fillRect(0, 0, canvas.width, canvas.height);

      const barW = canvas.width / bufLen * 2.2;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = data[i] / 255 * canvas.height * 0.95;
        c.fillStyle =
        i % 2 === 0 ? "rgba(0,155,155,0.85)" : "rgba(232,98,74,0.7)";
        c.fillRect(x, canvas.height - barH, barW - 1, barH);
        x += barW + 1;
      }
    };
    draw();
  }, [getAnalyser]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d")!;
    c.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Start/stop visualizer based on play state
  useEffect(() => {
    if (isPlaying && audioElement) {
      drawVis();
    } else {
      cancelAnimationFrame(animRef.current);
      clearCanvas();
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, audioElement, drawVis, clearCanvas]);

  /* ── computed display values ── */
  const hasTitle = Boolean(metaTitle?.trim());
  const hasArtist = Boolean(metaArtist?.trim());
  const hasAlbumInfo = Boolean(metaAlbum?.trim() || metaYear?.trim());
  const dispTitle = hasTitle ? metaTitle.trim() : "Not provided";
  const dispArtist = hasArtist ? metaArtist.trim() : "Not provided";
  const dispAlbum = hasAlbumInfo
    ? [metaAlbum?.trim(), metaYear?.trim()].filter(Boolean).join(" · ")
    : "Not provided";
  const scrollTitle = dispTitle.length > 28;

  /* ── drag & drop ── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    for (const f of Array.from(e.dataTransfer.files)) {
      if (f.type.startsWith("audio/")) loadAudioFile(f);else
      if (f.type.startsWith("image/")) loadImageFile(f);
    }
  };

  /* ── load past spotlight info (does NOT interrupt current playback) ── */
  const loadSpotlight = (_spot: ArchivedSpot) => {
    // Archived spots are display-only; don't change current playback
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <RecordBar />

      {/* inline styles for animations */}
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes tscroll{0%,15%{transform:translateX(0)}85%,100%{transform:translateX(-40%)}}
        @keyframes float{0%{transform:scale(0.68)}50%{transform:scale(0.82) translate(-1%,-1%)}100%{transform:scale(0.68)}}
        .art-float{animation:float 12s ease-in-out infinite}
        .art-canvas-wrap{position:absolute;bottom:0;left:0;right:0;height:80px;pointer-events:none;transition:opacity .4s}
        input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.1);height:3px;border-radius:2px;cursor:pointer;outline:none;flex:1}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#009B9B;cursor:pointer;box-shadow:0 0 6px rgba(0,155,155,.5)}
        input[type=range]::-moz-range-thumb{width:13px;height:13px;border-radius:50%;border:none;background:#009B9B}
        @keyframes waveGlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .wave-border{background:linear-gradient(270deg,#009B9B,#E8624A,#D4A830,#009B9B);background-size:300% 300%;animation:waveGlow 8s ease infinite;padding:2px}
        .wave-border-inner{background:#0d0d0d;width:100%;height:100%}
      `}</style>

      {/* ── Page Header ── */}
      <div className="text-center pt-[80px] px-[5vw] mb-8">
        <span
          className="font-dancing text-[2rem] font-bold block mb-1"
          style={{
            background: "linear-gradient(135deg,#009B9B,#E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
          
          Voices &amp; Vibes Radio
        </span>
        <div
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "#8ab8b8", fontFamily: "'Share Tech Mono', monospace" }}>
          
          Artist Spotlight Player
        </div>
      </div>

      {/* ── Two Column Grid ── */}
      <div className="artist-grid grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 px-[5vw] pb-[80px] items-start">
        {/* ===== LEFT COLUMN — Player Card ===== */}
        <div className="flex-col h-full my-0 mx-0 gap-[10px] flex items-center justify-center">
          <div
            className="w-full relative overflow-hidden"
            style={{
              maxWidth: 860,
              background: "#1a1a1a",
              border: "1px solid rgba(0,155,155,0.2)",
              transition: "border-color .2s, box-shadow .2s"
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}>
            
            {/* glow effects */}
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: 200, height: 200,
                background: "radial-gradient(circle at top left, rgba(0,155,155,0.1), transparent 70%)"
              }} />
            
            <div
              className="absolute bottom-0 right-0 pointer-events-none"
              style={{
                width: 160, height: 160,
                background: "radial-gradient(circle at bottom right, rgba(232,98,74,0.08), transparent 70%)"
              }} />
            

            {/* ── Album Art Zone ── */}
            <div className="wave-border w-full">
            <div
               className="w-full relative overflow-hidden flex items-center justify-center wave-border-inner aspect-square md:aspect-video"
               style={{ maxHeight: 520 }}>
              
              {artSrc &&
              <img
                src={artSrc}
                alt="Album Art"
                className={`w-full h-full object-contain ${!isPlaying ? "art-float" : ""}`}
                style={{
                  transition: "transform .6s ease, filter .4s ease",
                  transform: isPlaying ? "scale(1.04)" : undefined,
                  filter: isPlaying ? "brightness(0.85)" : "brightness(1)"
                }} />

              }

              {!artSrc &&
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ background: "linear-gradient(135deg,#0d1a1a,#1a0d0d)" }}>
                
                  <div className="text-[4rem] opacity-40">🎙️</div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-center px-8" style={{ color: "#8ab8b8", maxWidth: 200 }}>
                    Upload album art or drag &amp; drop an image here
                  </p>
                  <button
                  className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer"
                  style={{
                    background: "rgba(0,155,155,0.15)",
                    border: "1px solid rgba(0,155,155,0.4)",
                    color: "#009B9B",
                    padding: "8px 20px",
                    transition: "background .2s"
                  }}
                  onClick={(e) => {e.stopPropagation();imgInputRef.current?.click();}}>
                  
                    Choose Image
                  </button>
                </div>
              }

              {/* Vinyl ring */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: isPlaying ? 1 : 0, transition: "opacity .4s" }}>
                
                <div
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle,rgba(0,0,0,0.85) 30%,rgba(0,155,155,0.3) 31%,rgba(0,0,0,0.6) 60%,rgba(232,98,74,0.2) 61%,rgba(0,0,0,0.7) 100%)",
                    border: "2px solid rgba(0,155,155,0.3)",
                    animation: isPlaying ? "spin 4s linear infinite" : "none"
                  }} />
                
                <div className="absolute" style={{ width: 14, height: 14, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 12px rgba(0,155,155,0.6)" }} />
              </div>

              {/* Canvas visualizer */}
              <canvas ref={canvasRef} className="art-canvas-wrap" style={{ opacity: isPlaying ? 1 : 0 }} />

              {/* NOW PLAYING badge */}
              <div
                className="absolute top-4 left-4 flex items-center gap-[6px] font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase text-white"
                style={{
                  background: "rgba(232,98,74,0.85)", padding: "5px 12px",
                  opacity: isPlaying ? 1 : 0, transition: "opacity .3s"
                }}>
                
                <span className="inline-block rounded-full bg-white" style={{ width: 6, height: 6, animation: "blink 1.2s infinite" }} />
                Now Playing
              </div>

              {/* Watermark */}
              <div
                className="absolute bottom-3 right-4 font-dancing font-bold text-[1rem] pointer-events-none"
                style={{ color: "rgba(255,255,255,0.35)", opacity: isPlaying ? 1 : 0, transition: "opacity .3s" }}>
                
                Voices &amp; Vibes Radio
              </div>
            </div>
            </div>

            {/* ── Track Info ── */}
            <div className="relative text-center" style={{ padding: "1.5rem 1.75rem 1.25rem", borderBottom: "1px solid rgba(0,155,155,0.08)" }}>
              {isPlayingCommercial ? (
                <>
                  <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-[0.5rem]" style={{ color: "#E8624A" }}>
                    🔊 Commercial Break
                  </div>
                  <div className="text-[1.4rem] font-montserrat font-bold mb-[0.25rem]" style={{ color: "#ffffff" }}>
                    {metaTitle.replace("🔊 ", "")}
                  </div>
                  <div className="font-montserrat text-[12px] italic" style={{ color: "rgba(138,184,184,0.5)" }}>
                    Up next: Track {(trackIndex + 1) % trackCount + 1}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-[0.5rem]" style={{ color: "#009B9B" }}>
                    🎙️ Voices &amp; Vibes Radio · Artist Spotlight
                  </div>
                  <div className="text-[1.4rem] font-montserrat font-bold mb-[0.25rem] whitespace-nowrap overflow-hidden" style={{ color: hasTitle ? "#ffffff" : "#8ab8b8" }}>
                    <span className="inline-block" style={{ animation: scrollTitle ? "tscroll 14s linear infinite" : "none" }}>
                      {dispTitle}
                    </span>
                  </div>
                  <div className="font-montserrat text-[15px] mb-[0.15rem]" style={{ color: hasArtist ? "#8ab8b8" : "rgba(138,184,184,0.6)" }}>
                    {dispArtist}
                  </div>
                  <div className="font-montserrat font-light text-[12px] italic" style={{ color: hasAlbumInfo ? "rgba(138,184,184,0.5)" : "#8ab8b8" }}>
                    {dispAlbum}
                  </div>
                  {featuredWeek && (
                    <div className="font-montserrat text-[9px] mt-[2px]" style={{ color: "#8ab8b8" }}>
                      Featured Week: {featuredWeek}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Progress ── */}
            <div style={{ padding: "1rem 1.75rem 0.75rem" }}>
              <div
                className="w-full relative cursor-pointer mb-2"
                style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}
                onClick={handleSeekClick}>
                
                <div
                  className="h-full pointer-events-none"
                  style={{
                    width: `${progress}%`, borderRadius: 2,
                    background: "linear-gradient(to right,#009B9B,#E8624A)",
                    transition: "width .25s linear"
                  }} />
                
              </div>
              <div className="flex justify-between text-[10px] tracking-[0.06em]" style={{ color: "#8ab8b8" }}>
                <span>{fmt(elapsed)}</span>
                <span>{duration > 0 ? fmt(duration) : "0:00"}</span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div className="flex items-center justify-center" style={{ padding: "0.75rem 1.75rem 1rem", gap: "1.25rem" }}>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: isShuffled ? "#009B9B" : "#8ab8b8", opacity: isPlayingCommercial ? 0.3 : 1, pointerEvents: isPlayingCommercial ? "none" : "auto" }} onClick={toggleShuffle} title="Shuffle">🔀</button>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: trackCount > 1 && !isPlayingCommercial ? "#8ab8b8" : "#8ab8b840", pointerEvents: isPlayingCommercial ? "none" : "auto" }} onClick={prevTrack} title="Previous track">⏮</button>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: "#8ab8b8" }} onClick={skipBack} title="Back 10s">⏪</button>
              <button
                className="border-none cursor-pointer flex items-center justify-center text-[1.5rem] transition-all"
                style={{
                  width: 58, height: 58, borderRadius: "50%",
                  background: isPlaying ? "#E8624A" : "#009B9B",
                  color: "#0a0a0a",
                  boxShadow: isPlaying ? "0 0 28px rgba(232,98,74,0.4)" : "0 0 28px rgba(0,155,155,0.4)"
                }}
                onClick={(e) => {e.stopPropagation();togglePlay();}}>
                
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: "#8ab8b8" }} onClick={skipFwd} title="Forward 10s">⏩</button>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: trackCount > 1 && !isPlayingCommercial ? "#8ab8b8" : "#8ab8b840", pointerEvents: isPlayingCommercial ? "none" : "auto" }} onClick={nextTrack} title="Next track">⏭</button>
              <button className="bg-transparent border-none cursor-pointer text-[1.1rem] p-[6px] transition-all hover:text-white hover:scale-[1.15]" style={{ color: isLooping ? "#009B9B" : "#8ab8b8", opacity: isPlayingCommercial ? 0.3 : 1, pointerEvents: isPlayingCommercial ? "none" : "auto" }} onClick={toggleLoop} title="Loop">🔁</button>
            </div>
            {/* Track counter */}
            {trackCount > 1 && (
              <div className="text-center" style={{ marginTop: "-0.5rem", paddingBottom: "0.5rem" }}>
                <span className="font-montserrat text-[9px] tracking-[0.15em] uppercase" style={{ color: "#5a9090" }}>
                  Track {trackIndex + 1} of {trackCount}
                </span>
              </div>
            )}

            {/* ── Volume ── */}
            <div className="flex items-center w-full" style={{ padding: "0 1.75rem 1.25rem", gap: "0.75rem" }}>
              <span className="text-[14px] cursor-pointer" style={{ color: "#8ab8b8" }} onClick={toggleMute}>
                {isMuted ? "🔇" : "🔈"}
              </span>
              <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <span className="text-[11px] min-w-[32px] text-right" style={{ color: "#8ab8b8", fontFamily: "'Share Tech Mono', monospace" }}>
                {volume}%
              </span>
            </div>

          </div>
        </div>

        {/* ===== RIGHT COLUMN — Info Panels ===== */}
        <div className="flex flex-col gap-3">
          <div className="font-montserrat text-[9px] tracking-[0.25em] uppercase" style={{ color: "#5a9090", paddingLeft: 2 }}>Artist info</div>

          {/* ── Artist Bio Card ── */}
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.2)", padding: "1rem 1.25rem" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ width: 56, height: 56, background: "linear-gradient(135deg, #1a2a2a, #0a1010)", border: "1px solid rgba(0,155,155,0.3)" }}>
                {artSrc ? <img src={artSrc} alt="Artist" className="w-full h-full object-cover" /> : <span className="text-[1.4rem] opacity-60">🎩</span>}
              </div>
              <div className="min-w-0">
                <div className="font-dancing font-bold text-[1.25rem] leading-tight mb-[2px]" style={{ color: hasArtist ? "#E8624A" : "#8ab8b8" }}>
                  {dispArtist}
                </div>
                <div className="mb-2" />
                <div className="flex flex-wrap gap-[5px]">
                  {["Jazz", "Gospel"].map((tag) =>
                  <span key={tag} className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase" style={{ padding: "2px 8px", border: "1px solid rgba(0,155,155,0.3)", background: "rgba(0,155,155,0.1)", color: "#009B9B" }}>{tag}</span>
                  )}
                  <span className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase" style={{ padding: "2px 8px", border: hasAlbumInfo ? "1px solid rgba(232,98,74,0.3)" : "1px solid rgba(138,184,184,0.2)", background: hasAlbumInfo ? "rgba(232,98,74,0.1)" : "rgba(138,184,184,0.08)", color: hasAlbumInfo ? "#E8624A" : "#8ab8b8" }}>{dispAlbum}</span>
                </div>
              </div>
            </div>
            <p className="font-montserrat font-light text-[12px] leading-[1.7] mb-3" style={{ color: "#8ab8b8" }}>
              A soulful guitarist bringing healing through music. Known for blending smooth jazz with gospel influences, his sound is a journey through faith and feeling.
            </p>
            <div className="flex items-center gap-2">
              {["Facebook", "Instagram"].map((label) =>
              <button key={label} className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all" style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#8ab8b8", padding: "4px 10px" }}>{label}</button>
              )}
              <button className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all" style={{ border: "1px solid rgba(232,98,74,0.35)", color: "#E8624A", padding: "4px 10px" }}>Book Artist</button>
            </div>
          </div>

          {/* ── About This Track ── */}
          <div className="font-montserrat font-bold text-[9px] tracking-[0.22em] uppercase" style={{ color: "#009B9B" }}>About this track</div>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.2)", padding: "0.85rem 1rem" }}>
            <p className="font-montserrat font-light text-[11px] leading-[1.65] mb-3" style={{ color: "#8ab8b8" }}>
              A powerful upcoming release blending smooth jazz guitar with gospel soul. This track carries a message of hope and healing — a perfect fit for the Voices &amp; Vibes community.
            </p>
            <div className="flex flex-wrap gap-[5px]">
              {["Smooth Jazz", "Gospel Soul", "Healing", "2025 Release"].map((tag) =>
              <span key={tag} className="font-montserrat text-[8px] tracking-[0.08em]" style={{ padding: "2px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#5a9090" }}>{tag}</span>
              )}
            </div>
          </div>


          {/* ── Track Details (read-only) ── */}
          <div className="font-montserrat font-bold text-[9px] tracking-[0.22em] uppercase" style={{ color: "#009B9B" }}>Track details</div>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.2)", padding: "0.85rem 1rem" }}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Track Title", value: metaTitle || "—" },
                { label: "Artist", value: metaArtist || "—" },
                { label: "Album", value: metaAlbum || "—" },
                { label: "Year", value: metaYear || "—" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-[0.3rem]" style={{ color: "#009B9B" }}>{f.label}</div>
                  <div className="font-montserrat text-[11px] text-white" style={{ padding: "7px 0" }}>{f.value}</div>
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
              style={{ background: "#009B9B", color: "#0a0a0a", padding: 9 }}>
              
              🎙️ Full Live Stream
            </a>
            <button
              className="flex-1 text-center font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase bg-transparent cursor-pointer transition-all"
              style={{ border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: 9 }}
              onClick={() => navigate("/home")}>
              
              ← Back to Site
            </button>
          </div>

          {/* ── Feature Pills ── */}
          <div className="flex flex-wrap gap-[5px] mt-1">
            {["Real Audio Visualizer", "Album Art", "MP3 · WAV · OGG", "voicesandvibesradio.com"].map((p) =>
            <span key={p} className="font-montserrat font-bold text-[8px] tracking-[0.12em] uppercase" style={{ padding: "3px 9px", border: "1px solid rgba(0,155,155,0.25)", color: "#8ab8b8" }}>{p}</span>
            )}
          </div>
        </div>
      </div>

      {/* Hidden inputs */}
      
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && loadImageFile(e.target.files[0])} />
      
    </div>);

};

export default ArtistPlayer;