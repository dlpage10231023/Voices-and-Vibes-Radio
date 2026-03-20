import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import voicesLogo from "@/assets/voices-logo.jpg";

const t = (msg: string) =>
  toast(msg, {
    duration: 2500,
    style: {
      background: "rgba(17,17,17,0.95)",
      border: "1px solid rgba(0,155,155,0.3)",
      color: "#fff",
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 11,
    },
  });

const DEFAULT_LINES_TEMPLATE = (artistName: string, trackTitle: string, genres: string, location: string) => [
  { text: "You're listening to Voices and Vibes Radio —", type: "normal" },
  { text: "where healing meets music.", type: "normal" },
  { text: "", type: "pause" },
  { text: "We're excited to welcome a new artist", type: "normal" },
  { text: "to the platform —", type: "normal" },
  { text: "", type: "pause" },
  { text: `${artistName}.`, type: "station-name" },
  { text: "", type: "pause" },
  { text: `His track "${trackTitle}" is that smooth, soulful`, type: "normal" },
  { text: "energy that hits you right in the spirit.", type: "normal" },
  { text: `${genres.split(",").map(g => g.trim()).slice(0, 3).join(". ")}. ${location} vibes.`, type: "normal" },
  { text: "", type: "pause" },
  { text: `${artistName} — now featured on`, type: "normal" },
  { text: "Voices and Vibes Radio.", type: "station-name" },
  { text: "", type: "pause" },
  { text: "voicesandvibesradio.com", type: "url" },
  { text: "", type: "pause" },
  { text: "And that was...", type: "normal" },
  { text: `"${trackTitle}."`, type: "station-name" },
];

const imageSize = 220;

const NewArtist = () => {
  const [loading, setLoading] = useState(true);
  const [artistData, setArtistData] = useState<{
    artistName: string; trackTitle: string; trackSubtitle: string;
    genres: string; location: string; slug: string;
    imageUrl: string | null; audioUrl: string | null;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());
  const [announceDone, setAnnounceDone] = useState(false);
  const [eqHeights, setEqHeights] = useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const eqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const fetchArtist = async () => {
      const { data } = await supabase.from("new_artists").select("*").eq("is_active", true).maybeSingle();
      if (data) {
        setArtistData({
          artistName: data.artist_name,
          trackTitle: data.track_title,
          trackSubtitle: data.track_subtitle,
          genres: data.genres,
          location: data.location,
          slug: data.slug,
          imageUrl: data.image_url,
          audioUrl: data.audio_url,
        });
        document.title = `${data.artist_name} — New Artist · Voices & Vibes Radio`;
      } else {
        document.title = "New Artist · Voices & Vibes Radio";
      }
      setLoading(false);
    };
    fetchArtist();
  }, []);

  // Show all lines immediately (no audio-triggered animation for now)
  useEffect(() => {
    if (artistData) {
      const lines = DEFAULT_LINES_TEMPLATE(artistData.artistName, artistData.trackTitle, artistData.genres, artistData.location);
      setVisibleLines(new Set(lines.map((_, i) => i)));
    }
  }, [artistData]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const startEQ = useCallback(() => {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqIntervalRef.current = setInterval(() => {
      setEqHeights(Array.from({ length: 8 }, () => 3 + Math.random() * 18));
    }, 80);
  }, []);

  const stopEQ = useCallback(() => {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqIntervalRef.current = null;
    setEqHeights([4, 4, 4, 4, 4, 4, 4, 4]);
  }, []);

  const startAnnouncement = useCallback(() => {
    if (!artistData) return;
    const lines = DEFAULT_LINES_TEMPLATE(artistData.artistName, artistData.trackTitle, artistData.genres, artistData.location);
    lineTimeoutsRef.current.forEach((t) => clearTimeout(t));
    lineTimeoutsRef.current = [];
    setVisibleLines(new Set());
    let delay = 800;
    lines.forEach((line, i) => {
      const isPause = line.type === "pause";
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => new Set(prev).add(i));
      }, delay);
      lineTimeoutsRef.current.push(timeout);
      delay += isPause ? 600 : 1800;
    });
    setAnnounceDone(true);
  }, [artistData]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !artistData?.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopEQ();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startEQ();
      if (!announceDone) startAnnouncement();
    }
  }, [isPlaying, artistData, startEQ, stopEQ, announceDone, startAnnouncement]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { if (a.duration) { setProgress((a.currentTime / a.duration) * 100); setCurrentTime(fmt(a.currentTime)); } };
    const onMeta = () => setDuration(fmt(a.duration));
    const onEnd = () => { setIsPlaying(false); setProgress(0); setCurrentTime("0:00"); stopEQ(); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); };
  }, [artistData?.audioUrl, stopEQ]);

  useEffect(() => {
    return () => {
      if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
      lineTimeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c0c" }}>
        <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase" style={{ color: "#009B9B" }}>Loading...</div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c0c" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 700, background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" }}>
            Voices & Vibes Radio
          </div>
          <div className="font-montserrat text-[12px]" style={{ color: "#5a9090" }}>No artist currently featured. Check back soon!</div>
        </div>
      </div>
    );
  }

  const lines = DEFAULT_LINES_TEMPLATE(artistData.artistName, artistData.trackTitle, artistData.genres, artistData.location);
  const genreTags = artistData.genres.split(",").map((g) => g.trim()).filter(Boolean);
  const tagStyles = [
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
    { bg: "rgba(232,98,74,0.1)", border: "rgba(232,98,74,0.25)", color: "#E8624A" },
    { bg: "rgba(212,168,48,0.1)", border: "rgba(212,168,48,0.25)", color: "#D4A830" },
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
  ];
  const imgSrc = artistData.imageUrl || voicesLogo;

  return (
    <div className="min-h-screen" style={{ background: "#080c0c" }}>
      {/* SPINNING BG RECORD */}
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
        <img src={voicesLogo} alt="" style={{ width: "min(100vw,100vh)", height: "min(100vw,100vh)", borderRadius: "50%", opacity: 0.06, animation: isPlaying ? "promoSpin 20s linear infinite" : undefined }} />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(8,12,12,0.6) 0%, rgba(8,12,12,0.85) 60%, rgba(8,12,12,0.97) 100%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 min-h-screen">
        {artistData.audioUrl && <audio ref={audioRef} src={artistData.audioUrl} preload="auto" />}
        <div style={{ width: "100%", maxWidth: 680, fontFamily: "'Montserrat', sans-serif", color: "#e8f5f5", background: "#080c0c", padding: "2rem 0" }}>
          {/* STATION HEADER */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, padding: "4px 12px", marginBottom: "1rem" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8624A", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
              New Artist Announcement
            </div>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block", lineHeight: 1.1, marginBottom: "0.25rem" }}>
              Voices & Vibes Radio
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "#5a9090" }}>
              Houston, TX · Est. Jan 2026 · voicesandvibesradio.com
            </div>
          </div>

          {/* ANNOUNCEMENT CARD */}
          <div style={{ width: "100%", background: "rgba(19,30,30,0.92)", border: "1px solid rgba(0,155,155,0.25)", backdropFilter: "blur(10px)" }}>
            <div style={{ background: "linear-gradient(135deg,rgba(0,155,155,0.15),rgba(232,98,74,0.08))", borderBottom: "1px solid rgba(0,155,155,0.2)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, background: "#009B9B", color: "#080c0c", padding: "3px 10px", flexShrink: 0 }}>New Artist</div>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#5a9090" }}>Now joining the Voices & Vibes platform</div>
            </div>

            {/* ARTIST ROW */}
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div data-promo-vinyl="" style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#009B9B,#E8624A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(0,155,155,0.3)", overflow: "hidden", animation: isPlaying ? "promoSpin 3s linear infinite" : undefined }}>
                <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", fontWeight: 700, color: "#E8624A", lineHeight: 1, marginBottom: "0.2rem" }}>{artistData.artistName}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#009B9B", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: "0.3rem" }}>
                  Now Playing: "{artistData.trackTitle}" — {artistData.trackSubtitle}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                  {genreTags.map((g, i) => (
                    <span key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", background: tagStyles[i % tagStyles.length].bg, border: `1px solid ${tagStyles[i % tagStyles.length].border}`, color: tagStyles[i % tagStyles.length].color }}>
                      {g}
                    </span>
                  ))}
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", background: "rgba(0,155,155,0.1)", border: "1px solid rgba(0,155,155,0.25)", color: "#009B9B" }}>
                    {artistData.location}
                  </span>
                </div>
              </div>
            </div>

            {/* ANNOUNCEMENT BODY */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#009B9B", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                On Air Announcement
                <span style={{ flex: 1, height: 1, background: "rgba(0,155,155,0.15)" }} />
              </div>

              <div data-promo-float="" style={{ float: "right" as const, margin: "0 0 1.5rem 2rem", width: imageSize, border: "1px solid rgba(0,155,155,0.2)", background: "linear-gradient(180deg,rgba(0,155,155,0.08),rgba(8,12,12,0.6))", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ width: "100%", height: 4, background: "linear-gradient(to right,#009B9B,#E8624A,#009B9B)" }} />
                <div style={{ width: imageSize, aspectRatio: "1", background: "linear-gradient(135deg,#0d1a1a 0%,#1a1000 40%,#0a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" as const, overflow: "hidden", borderBottom: "1px solid rgba(0,155,155,0.15)" }}>
                  <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "0.6rem 0.75rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(0,155,155,0.15)" }}>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1rem", fontWeight: 700, color: "#E8624A", lineHeight: 1.1, marginBottom: 1 }}>{artistData.artistName}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#009B9B", letterSpacing: "0.1em", marginBottom: 5 }}>"{artistData.trackTitle}"</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#5a9090" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 5px #009B9B", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
                    Now on Platform
                  </div>
                </div>
              </div>
              <div style={{ display: "block" }}>
                {lines.map((line, i) => {
                  if (line.type === "pause") return <div key={i} style={{ height: "0.5rem", border: "none" }} />;
                  const visible = visibleLines.has(i);
                  return (
                    <div key={i} style={{
                      fontSize: line.type === "station-name" ? "1.1rem" : line.type === "url" ? 11 : 13,
                      lineHeight: 1.9,
                      color: line.type === "station-name" ? "#E8624A" : line.type === "url" ? "#009B9B" : "rgba(232,245,245,0.85)",
                      fontFamily: line.type === "station-name" ? "'Dancing Script', cursive" : line.type === "url" ? "'Share Tech Mono', monospace" : undefined,
                      letterSpacing: line.type === "url" ? "0.08em" : undefined,
                      padding: "4px 0",
                      borderBottom: line.type === "station-name" || line.type === "url" ? "none" : "1px solid rgba(0,155,155,0.05)",
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.5s ease, transform 0.5s ease",
                    }}>
                      {line.type === "url" ? (
                        <a href="https://voicesandvibesradio.com" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{line.text}</a>
                      ) : line.text}
                    </div>
                  );
                })}
                <div style={{ clear: "both" as const }} />
              </div>
            </div>

            {/* PROGRESS */}
            <div style={{ padding: "0 1.5rem 0.5rem" }}>
              <div data-promo-progress-track="" style={{ height: 2, background: "rgba(0,155,155,0.1)", position: "relative" as const, overflow: "hidden", marginBottom: "0.35rem", cursor: "pointer" }} onClick={(e) => {
                if (!audioRef.current || !audioRef.current.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pct * audioRef.current.duration;
              }}>
                <div style={{ height: "100%", background: "linear-gradient(to right,#009B9B,#E8624A)", width: `${progress}%`, transition: "width 0.2s linear" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#5a9090" }}>
                <span>{currentTime}</span>
                <span>{duration}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ padding: "1rem 1.5rem 1.25rem", borderTop: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" as const }}>
              <button onClick={togglePlay} style={{
                width: 48, height: 48, borderRadius: "50%",
                background: isPlaying ? "#E8624A" : "#009B9B",
                border: "none", cursor: artistData.audioUrl ? "pointer" : "default",
                fontSize: "1.1rem", color: "#080c0c",
                boxShadow: isPlaying ? "0 0 20px rgba(232,98,74,0.4)" : "0 0 20px rgba(0,155,155,0.4)",
                transition: "all 0.2s", flexShrink: 0,
                opacity: artistData.audioUrl ? 1 : 0.4,
              }}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#5a9090", marginBottom: 2 }}>
                  {isPlaying ? "● Now Playing" : artistData.audioUrl ? "Ready to play" : "No audio loaded"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8f5f5" }}>{artistData.trackTitle} — {artistData.artistName}</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24, marginLeft: "0.5rem" }}>
                {eqHeights.map((h, i) => (
                  <div key={i} style={{ width: 3, borderRadius: 1, background: i % 2 === 0 ? "#009B9B" : "#E8624A", height: h, transition: "height 0.08s" }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#5a9090" }}>🔈</span>
                <input type="range" min="0" max="1" step="0.05" defaultValue="0.8" onChange={(e) => { if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value); }} style={{ width: 80, height: 3, cursor: "pointer", accentColor: "#009B9B" }} />
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(0,155,155,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", flexWrap: "wrap" as const, gap: "0.5rem" }}>
              <a href="https://voicesandvibesradio.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#009B9B", letterSpacing: "0.08em", textDecoration: "none" }}>
                voicesandvibesradio.com
              </a>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText("https://voicesandvibesradio.com/new-artist").then(() => t("Link copied!")); }} className="cursor-pointer" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(0,155,155,0.12)", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", fontFamily: "'Montserrat', sans-serif" }}>
                  📋 Copy Link
                </button>
                <button onClick={() => window.open("https://hello.citrus3.com:2020/public/voicesandvibes", "_blank")} className="cursor-pointer" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", fontFamily: "'Montserrat', sans-serif" }}>
                  🎙️ Listen Live
                </button>
              </div>
            </div>

            <div style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, rgba(0,155,155,0.15), rgba(232,98,74,0.1))", borderTop: "1px solid rgba(0,155,155,0.15)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", background: "linear-gradient(135deg, #009B9B, #E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                🎧 Listen at voicesandvibesradio.com
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes promoSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes promoBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.1 } }
        @media (max-width: 520px) {
          [data-promo-float] {
            float: none !important;
            margin: 0 auto 1.5rem auto !important;
            width: 180px !important;
          }
          [data-promo-float] > div:nth-child(2) {
            width: 180px !important;
            height: 180px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NewArtist;
