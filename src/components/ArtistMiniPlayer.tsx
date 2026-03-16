import { useArtistAudio } from "./ArtistAudioProvider";
import { useNavigate, useLocation } from "react-router-dom";

const fmt = (s: number) => {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
};

const ArtistMiniPlayer = () => {
  const { isPlaying, togglePlay, metaTitle, metaArtist, artSrc, hasSource, elapsed, duration, progress } = useArtistAudio();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on the artist-player page itself (full player is there)
  if (location.pathname === "/artist-player") return null;
  // Don't show if nothing has been loaded
  if (!hasSource && !isPlaying) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[400] flex items-center justify-between px-4 h-[56px]"
      style={{
        background: "linear-gradient(135deg, #1a1a1a, #0d1a1a)",
        borderTop: "1px solid rgba(0,155,155,0.25)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Left: art + info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ width: 40, height: 40, background: "#0d0d0d", border: "1px solid rgba(0,155,155,0.3)" }}
          onClick={() => navigate("/artist-player")}
        >
          {artSrc ? (
            <img src={artSrc} alt="Art" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[1rem] opacity-50">🎙️</span>
          )}
        </div>
        <div className="min-w-0 cursor-pointer" onClick={() => navigate("/artist-player")}>
          <div className="font-montserrat font-bold text-[11px] text-white truncate">
            {metaTitle || "Artist Spotlight"}
          </div>
          <div className="font-montserrat text-[9px] truncate" style={{ color: "#8ab8b8" }}>
            {metaArtist || "Voices & Vibes Radio"} · {fmt(elapsed)} / {fmt(duration)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(to right, #009B9B, #E8624A)",
            transition: "width .25s linear",
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          className="border-none cursor-pointer flex items-center justify-center text-[1.2rem]"
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: isPlaying ? "#E8624A" : "#009B9B",
            color: "#0a0a0a",
          }}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          className="font-montserrat font-bold text-[9px] tracking-[0.1em] uppercase bg-transparent cursor-pointer"
          style={{ border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "6px 12px" }}
          onClick={() => navigate("/artist-player")}
        >
          Open Player
        </button>
      </div>
    </div>
  );
};

export default ArtistMiniPlayer;
