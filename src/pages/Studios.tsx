import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";

/* ─── Studio Data ─── */
const studios = [
  {
    badge: "Pro Version",
    badgeColor: "teal",
    screenKicker: "Production Studio",
    screenTitle: "Voices & Vibes Studio Pro",
    screenSub: "Full DAW · 4 Kits · Piano Roll · Effects",
    jacketKicker: "🎛️ Production Studio",
    jacketTitle: "Voices & Vibes Studio Pro",
    jacketCopy:
      "The full production DAW. Build beats, compose melodies, shape sound with professional effects, and record your session — all in the browser.",
    features: [
      "4 drum kits — Afrobeats Trap Hip-Hop Latin",
      "16-step sequencer · 8 rows",
      "Velocity control (4 levels)",
      "Swing knob 0–100%",
      "Piano roll · 5 instrument sounds",
      "Reverb delay EQ compressor",
      "VU meters · Oscilloscope",
      "6 quick-save slots",
      "Record session → WAV download",
      "16 preset patterns per kit",
      "Keyboard shortcuts",
      "BPM 88–140 per kit",
    ],
    tags: [
      { label: "Afrobeats", color: "teal" },
      { label: "Trap", color: "teal" },
      { label: "Hip-Hop", color: "teal" },
      { label: "Latin", color: "teal" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Studio Pro",
    launchTo: "/studio",
    ghostLabel: "← Back to Site",
    ghostTo: "/home",
  },
  {
    badge: "Enhanced v8",
    badgeColor: "coral",
    screenKicker: "Artist Spotlight",
    screenTitle: "Artist Player v8",
    screenSub: "Beat Engine · Animated Art · Cultural History",
    jacketKicker: "🎸 Artist Spotlight",
    jacketTitle: "Artist Player v8 — Enhanced",
    jacketCopy:
      "The full artist experience. Upload a track, load album art, play real drum beats from 4 cultural kits, and explore music history.",
    features: [
      "Upload MP3 WAV OGG tracks",
      "Animated album art glide effect",
      "Real frequency visualizer",
      "Spinning vinyl ring",
      "4 drum kits with real sounds",
      "16-step beat grid + pads",
      "Repeat shuffle mute",
      "Keyboard shortcuts",
      "Saves preferences",
      "Drag & drop files",
      "Cultural history cards",
      "African · Atlanta · Bronx · Caribbean",
    ],
    tags: [
      { label: "Artist", color: "coral" },
      { label: "Beat Engine", color: "teal" },
      { label: "Cultural", color: "teal" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Artist Player",
    launchTo: "/artist-player",
    ghostLabel: null,
    ghostTo: null,
  },
  {
    badge: "8 Moods",
    badgeColor: "teal",
    screenKicker: "Healing Radio",
    screenTitle: "Ambient Player — 8 Moods",
    screenSub: "Jazz · Gospel · Soul · Trap Jazz · Meditation",
    jacketKicker: "🎵 Healing Radio",
    jacketTitle: "Ambient Player — 8 Healing Moods",
    jacketCopy:
      "Browser-generated healing music across 8 mood channels. No audio files needed — all music created live using Web Audio API.",
    features: [
      "Healing Jazz · 88 BPM",
      "Gospel Groove · 96 BPM",
      "Afrobeats Jazz · 92 BPM (Signature)",
      "Soul Saturday · 76 BPM",
      "Gospel Sunday · 84 BPM",
      "Healing Meditation · 60 BPM",
      "Soul Saturday Deep · 70 BPM",
      "Trap Jazz Fusion · 108 BPM",
    ],
    tags: [
      { label: "Jazz", color: "teal" },
      { label: "Gospel", color: "teal" },
      { label: "Trap Jazz", color: "coral" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Ambient Player",
    launchTo: "/listen",
    ghostLabel: "🎙️ Live Stream",
    ghostTo: LISTEN_LIVE_URL,
    ghostExternal: true,
  },
  {
    badge: "Pro Edition",
    badgeColor: "coral",
    screenKicker: "Voice Recording",
    screenTitle: "Pro Mixer Edition",
    screenSub: "Voice Only · Live Mix · Clips Library",
    jacketKicker: "🎙️ Voice Recording Studio",
    jacketTitle: "Pro Mixer Edition",
    jacketCopy:
      "Record your voice over a beat in real time. Choose Voice Only or Live Mix mode. Each recording saved as a clip with its own waveform display.",
    features: [
      "Voice Only recording mode",
      "Live Mix — voice + beat together",
      "Real-time audio level meter",
      "Waveform display per clip",
      "Clips library management",
      "Beat sequencer built in",
      "Export Beat as WAV",
      "Export All Recordings",
      "Save & Load Project",
      "BPM control",
      "Quick preset patterns",
      "Play Edit Delete clips",
    ],
    tags: [
      { label: "Voice", color: "coral" },
      { label: "Beat", color: "teal" },
      { label: "Live Mix", color: "teal" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Pro Mixer",
    launchTo: "#",
    ghostLabel: null,
    ghostTo: null,
  },
  {
    badge: "Broadcast",
    badgeColor: "teal",
    screenKicker: "Radio Production",
    screenTitle: "Radio Promo Producer",
    screenSub: "Station IDs · Bumpers · Promos · WAV Export",
    jacketKicker: "📻 Radio Production",
    jacketTitle: "Radio Promo Producer",
    jacketCopy:
      "Purpose-built for creating radio station IDs, bumpers, and promotional content. Fast workflow, broadcast-ready output, instant WAV export.",
    features: [
      "Voice recording built in",
      "Beat sequencer for backing track",
      "6 broadcast-ready presets",
      "Premium percussion sounds",
      "Promo mixer timeline",
      "Quick workflow",
      "Instant WAV export",
      "Station ID templates",
      "Radio-optimized sound",
      "16-step sequencer",
      "Live sound pads",
      "Save & export all",
    ],
    tags: [
      { label: "Radio", color: "teal" },
      { label: "Promo", color: "teal" },
      { label: "Broadcast", color: "coral" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Promo Producer",
    launchTo: "#",
    ghostLabel: null,
    ghostTo: null,
  },
  {
    badge: "Professional",
    badgeColor: "teal",
    screenKicker: "Full Studio Suite",
    screenTitle: "Professional Promo Creator",
    screenSub: "Full Studio · Voice · 4 Kits · Export",
    jacketKicker: "🎚️ Full Production Suite",
    jacketTitle: "Professional Promo Creator",
    jacketCopy:
      "Complete professional studio combining all 4 drum kits with voice recording, swing control, velocity, and broadcast-quality WAV export.",
    features: [
      "All 4 drum kits",
      "Voice recording studio",
      "Swing control",
      "Velocity layers",
      "Piano melody recorder",
      "16-step sequencer",
      "Broadcast WAV export",
      "Save project state",
      "Load previous projects",
      "Professional sound design",
      "BPM control",
      "Real-time preview",
    ],
    tags: [
      { label: "All 4 Kits", color: "teal" },
      { label: "Voice", color: "coral" },
      { label: "Professional", color: "teal" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Pro Creator",
    launchTo: "#",
    ghostLabel: null,
    ghostTo: null,
  },
  {
    badge: "Utility",
    badgeColor: "teal",
    screenKicker: "Artist Tools",
    screenTitle: "Image Prep Tool",
    screenSub: "Crop · Scale · Position · Export Square",
    jacketKicker: "🖼️ Artist Tools",
    jacketTitle: "Image Prep Tool",
    jacketCopy:
      "Prepare artist photos perfectly for the player. Upload any photo, frame exactly right with sliders, download the ready-to-upload square version.",
    features: [
      "Upload any photo size",
      "Y position slider — show face/hat",
      "X position slider — center subject",
      "Zoom scale control",
      "Live player frame preview",
      "object-position comparison",
      "500×500 square export",
      "600×600 square export",
      "800×800 square export",
      "Original size download",
      "Now Playing badge overlay",
      "Quick presets — Show Face Center Fit",
    ],
    tags: [
      { label: "Image Tool", color: "teal" },
      { label: "Artist", color: "teal" },
      { label: "Free", color: "amber" },
    ],
    launchLabel: "▶ Launch Image Prep",
    launchTo: "#",
    ghostLabel: null,
    ghostTo: null,
  },
];

const whyCards = [
  { icon: "🌿", title: "Healing First", desc: "Every tool is designed around therapeutic creative expression — not just music production." },
  { icon: "🎙️", title: "Radio Integration", desc: "Make music here, get featured on Voices & Vibes Radio — streaming 24/7 worldwide from Houston." },
  { icon: "🥁", title: "Production Ready", desc: "Professional drum kits, effects rack, voice recording, and WAV export — all free in browser." },
  { icon: "🎤", title: "Voice + Beat", desc: "Record your voice over a live beat in real time. Voice Only or Live Mix. Clips saved with waveform." },
  { icon: "🕊️", title: "Faith & Gospel", desc: "Dedicated Gospel Sunday spotlights featuring churches and faith artists from around the world." },
  { icon: "🌍", title: "Cultural Roots", desc: "African, Atlanta, Bronx, and Caribbean musical heritage woven into every kit, beat, and lesson." },
  { icon: "🚀", title: "No Download Needed", desc: "Everything runs in Chrome. No app, no install, no account required to start creating music." },
  { icon: "📻", title: "7 Studio Tools", desc: "Studio Pro, Artist Player, Ambient Moods, Pro Mixer, Promo Producer, Pro Creator, Image Prep." },
];

const plans = [
  {
    icon: "🎛️",
    name: "Creator",
    price: "$0",
    priceColor: "#009B9B",
    tagline: "Make music, download beats, host 1 track free",
    features: [
      { text: "All 7 studio tools", included: true },
      { text: "All 4 drum kits", included: true },
      { text: "Record & download WAV", included: true },
      { text: "1 track hosted on your profile", included: true },
      { text: "Voice recording (locked)", included: false },
      { text: "Save/load project (locked)", included: false },
      { text: "Piano roll (locked)", included: false },
      { text: "Radio spotlight (locked)", included: false },
    ],
    btnLabel: "Start Creating Free",
    btnStyle: "ghost" as const,
    borderColor: "rgba(0,155,155,0.18)",
    featured: false,
  },
  {
    icon: "🎵",
    name: "Artist Pro",
    price: "$9",
    priceColor: "#009B9B",
    tagline: "Your profile page + 20 tracks hosted",
    features: [
      { text: "Everything in Creator", included: true },
      { text: "Voice recording ✦ Unlocked", included: true },
      { text: "Save & load project ✦ Unlocked", included: true },
      { text: "Artist profile page", included: true },
      { text: "Upload up to 20 tracks", included: true },
      { text: "Artist directory listing", included: true },
      { text: "Bio photo & genre tags", included: true },
      { text: "Piano roll (locked)", included: false },
      { text: "Spotlight eligible (locked)", included: false },
      { text: "Radio airplay (locked)", included: false },
    ],
    btnLabel: "Get Started",
    btnStyle: "solid" as const,
    borderColor: "rgba(0,155,155,0.18)",
    featured: true,
  },
  {
    icon: "🌟",
    name: "Spotlight",
    price: "$19",
    priceColor: "#8855CC",
    tagline: "Unlimited tracks + radio airplay",
    features: [
      { text: "Everything in Artist Pro", included: true },
      { text: "Piano roll ✦ Unlocked", included: true },
      { text: "Effects rack ✦ Unlocked", included: true },
      { text: "Unlimited tracks hosted", included: true },
      { text: "Homepage spotlight eligible", included: true },
      { text: "Healing Artist badge", included: true },
      { text: "Guaranteed radio airplay", included: true },
      { text: "Gospel Sunday feature eligible", included: true },
      { text: "All premium templates", included: true },
      { text: "Priority spotlight slot", included: true },
    ],
    btnLabel: "Go Spotlight",
    btnStyle: "purple" as const,
    borderColor: "rgba(136,85,204,0.35)",
    featured: false,
  },
];

const tickerItems = [
  "🎙️ Now Streaming 24/7",
  "Voices & Vibes Radio — Houston, TX",
  "Healing Conversations & Restorative Jazz",
  "🕊️ Gospel Sunday — Church Spotlights Worldwide",
  "Hosted by Doreatha Page · LPC, NCC",
  "voicesandvibesradio.com",
];

const docLinks = [
  "📖 Complete Guide",
  "🥁 Beats Guide",
  "🎵 Arranger Guide",
  "🎚️ Mixer Guide",
  "📻 Radio Promo Guide",
  "🚀 Deployment Guide",
  "🔧 Troubleshooting",
];

/* ─── Tag Color Helper ─── */
function tagStyle(color: string) {
  if (color === "teal")
    return { background: "rgba(0,155,155,0.12)", border: "1px solid rgba(0,155,155,0.25)", color: "#009B9B" };
  if (color === "coral")
    return { background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.25)", color: "#E8624A" };
  return { background: "rgba(212,168,48,0.12)", border: "1px solid rgba(212,168,48,0.25)", color: "#D4A830" };
}

/* ─── Studio Card ─── */
function StudioCard({
  studio,
  isOpen,
  onToggle,
}: {
  studio: (typeof studios)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: "#182020",
        border: `1px solid ${isOpen ? "#009B9B" : "rgba(0,155,155,0.18)"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.25s",
      }}
      onMouseEnter={(e) => {
        if (!isOpen) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,155,155,0.45)";
      }}
      onMouseLeave={(e) => {
        if (!isOpen) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,155,155,0.18)";
      }}
    >
      {/* Screen Zone */}
      <div
        onClick={onToggle}
        style={{ aspectRatio: "16/10", overflow: "hidden", position: "relative", background: "#0c1414" }}
      >
        {/* Badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 5,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 10px",
            background: studio.badgeColor === "teal" ? "rgba(0,155,155,0.85)" : "rgba(232,98,74,0.85)",
            color: "#000",
          }}
        >
          {studio.badge}
        </span>

        {/* Open Tab (right edge) */}
        {!isOpen && (
          <span
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              writingMode: "vertical-rl",
              background: "#009B9B",
              color: "#000",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "12px 6px",
              zIndex: 5,
            }}
          >
            Open Details
          </span>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,12,12,0.9) 0%, transparent 55%)",
            zIndex: 3,
          }}
        />

        {/* Screen footer */}
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "1rem", zIndex: 4 }}>
          <div
            style={{
              fontSize: 8,
              color: "#009B9B",
              fontFamily: '"Share Tech Mono", monospace',
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            {studio.screenKicker}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {studio.screenTitle}
          </div>
          <div style={{ fontSize: 10, color: "#5a9090" }}>{studio.screenSub}</div>
        </div>
      </div>

      {/* Jacket */}
      <div
        style={{
          maxHeight: isOpen ? 800 : 0,
          transition: "max-height 0.4s ease",
          overflow: "hidden",
          background: "#131e1e",
          borderTop: isOpen ? "1px solid rgba(0,155,155,0.18)" : "none",
        }}
      >
        {/* Jacket Head */}
        <div
          style={{
            padding: "1rem 1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 8,
                color: "#009B9B",
                fontFamily: '"Share Tech Mono", monospace',
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {studio.jacketKicker}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              {studio.jacketTitle}
            </div>
            <div style={{ fontSize: 11, color: "#5a9090", lineHeight: 1.7 }}>{studio.jacketCopy}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={{
              background: "rgba(232,98,74,0.12)",
              border: "1px solid rgba(232,98,74,0.3)",
              color: "#E8624A",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "5px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Close
          </button>
        </div>

        {/* Features */}
        <div style={{ padding: "0.85rem 1.2rem" }}>
          <div
            style={{
              fontSize: 8,
              color: "#009B9B",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Features
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
            }}
            className="studio-feat-grid"
          >
            {studio.features.map((f, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  padding: "4px 0 4px 16px",
                  position: "relative",
                  color: "#c8dede",
                  borderBottom: "1px solid rgba(0,155,155,0.05)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 4,
                    color: "#009B9B",
                    fontSize: 10,
                  }}
                >
                  ✓
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ padding: "0.65rem 1.2rem", display: "flex", flexWrap: "wrap", gap: 5 }}>
          {studio.tags.map((t, i) => (
            <span
              key={i}
              style={{
                ...tagStyle(t.color),
                fontSize: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "3px 9px",
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* Launch */}
        <div style={{ padding: "0.85rem 1.2rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {studio.launchTo?.startsWith("/") ? (
            <Link
              to={studio.launchTo}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#009B9B",
                color: "#000",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "9px 18px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {studio.launchLabel}
            </Link>
          ) : (
            <a
              href={studio.launchTo}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#009B9B",
                color: "#000",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "9px 18px",
                textDecoration: "none",
              }}
            >
              {studio.launchLabel}
            </a>
          )}
          {studio.ghostLabel && (
            studio.ghostExternal ? (
              <a
                href={studio.ghostTo!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,155,155,0.3)",
                  color: "#009B9B",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "9px 18px",
                  textDecoration: "none",
                }}
              >
                {studio.ghostLabel}
              </a>
            ) : (
              <Link
                to={studio.ghostTo!}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,155,155,0.3)",
                  color: "#009B9B",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "9px 18px",
                  textDecoration: "none",
                }}
              >
                {studio.ghostLabel}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Studios() {
  const [openCard, setOpenCard] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setOpenCard(null);
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div style={{ background: "#0a0a0a", color: "#f0f8f8", minHeight: "100vh" }}>
      {/* ─── 1. Sticky Nav ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          background: "rgba(8,12,12,0.97)",
          borderBottom: "1px solid rgba(0,155,155,0.18)",
          backdropFilter: "blur(12px)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5vw",
        }}
      >
        <Link
          to="/home"
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontWeight: 700,
            fontSize: "1.6rem",
            background: "linear-gradient(135deg, #009B9B, #E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          }}
        >
          Voices & Vibes
        </Link>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 20 }}>
          {[
            { label: "Home", to: "/home" },
            { label: "Studios", to: "/studios" },
            { label: "Artists", to: "/artists" },
            { label: "Listen", to: "/listen" },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.to}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: l.to === "/studios" ? "#009B9B" : "#5a9090",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/artists#plans"
            style={{
              background: "#009B9B",
              color: "#000",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "7px 16px",
              textDecoration: "none",
            }}
          >
            Join Platform
          </Link>
        </div>
      </nav>

      {/* ─── 2. Header Hero ─── */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "48px 5vw 36px",
          paddingTop: "calc(48px + 52px)",
        }}
      >
        {/* Live badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(232,98,74,0.12)",
            border: "1px solid rgba(232,98,74,0.3)",
            color: "#E8624A",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "5px 14px",
            marginBottom: "1.2rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#E8624A",
              animation: "blink 1.5s infinite",
            }}
          />
          Live · Houston, TX · Est. Jan 2026
        </div>

        <div
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontWeight: 700,
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            background: "linear-gradient(135deg, #009B9B, #E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "block",
            marginBottom: "0.3rem",
          }}
        >
          Voices & Vibes
        </div>

        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#5a9090",
            marginBottom: "0.5rem",
          }}
        >
          Radio · Studio · Platform
        </div>

        <div
          style={{
            fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
            color: "rgba(232,245,245,0.65)",
            marginBottom: "0.5rem",
          }}
        >
          Where Healing Meets Music
        </div>

        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#009B9B",
            marginBottom: "1.5rem",
          }}
        >
          Create · Record · Share · Heal
        </div>

        <div
          style={{
            width: 80,
            height: 2,
            background: "linear-gradient(90deg, #009B9B, #E8624A)",
            margin: "0 auto",
          }}
        />
      </header>

      {/* ─── 3. Ticker ─── */}
      <div
        style={{
          background: "#009B9B",
          color: "#000",
          padding: "9px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            animation: "ticker 28s linear infinite",
          }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ margin: "0 3rem" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── 4. Studio Grid ─── */}
      <section style={{ padding: "52px 5vw", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 18, height: 2, background: "#009B9B" }} />
          <span
            style={{
              fontSize: 9,
              color: "#009B9B",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Studio Suite
          </span>
        </div>
        <div
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            color: "#f0f8f8",
            marginBottom: 12,
          }}
        >
          Seven Powerful Tools
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#5a9090",
            maxWidth: 580,
            lineHeight: 1.8,
            marginBottom: 28,
          }}
        >
          Click any studio card to open the details jacket. Click Close to return to the clean view. All tools run in
          your browser — free, instant, no login needed.
        </p>

        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          {studios.map((s, i) => (
            <StudioCard
              key={i}
              studio={s}
              isOpen={openCard === i}
              onToggle={() => setOpenCard(openCard === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ─── 5. Why Voices & Vibes ─── */}
      <section style={{ padding: "0 5vw 4rem", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 18, height: 2, background: "#009B9B" }} />
          <span
            style={{
              fontSize: 9,
              color: "#009B9B",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Why Voices & Vibes
          </span>
        </div>
        <div
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            color: "#f0f8f8",
            marginBottom: 8,
          }}
        >
          Built Different
        </div>
        <p style={{ fontSize: 13, color: "#5a9090", maxWidth: 580, lineHeight: 1.8, marginBottom: 28 }}>
          The only platform that combines healing radio, music creation, voice recording, and artist community in one
          place.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          {whyCards.map((c, i) => (
            <div
              key={i}
              style={{
                background: "#182020",
                border: "1px solid rgba(0,155,155,0.18)",
                padding: "1.4rem",
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: "0.65rem" }}>{c.icon}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#009B9B",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.4rem",
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 11, color: "#5a9090", lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. Artist Plans ─── */}
      <section
        id="plans"
        style={{
          background: "#131e1e",
          borderTop: "1px solid rgba(0,155,155,0.18)",
          borderBottom: "1px solid rgba(0,155,155,0.18)",
          padding: "4rem 5vw",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          {/* Kicker with lines */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 8,
            }}
          >
            <div style={{ width: 30, height: 1, background: "rgba(0,155,155,0.3)" }} />
            <span
              style={{
                fontSize: 9,
                color: "#009B9B",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Artist Plans
            </span>
            <div style={{ width: 30, height: 1, background: "rgba(0,155,155,0.3)" }} />
          </div>

          <div
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
              color: "#f0f8f8",
              marginBottom: 8,
            }}
          >
            Share Your Music
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#5a9090",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Create for free forever. Choose a plan when you're ready to share your music with the world and get featured
            on the radio.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 2,
              marginTop: "2.5rem",
            }}
          >
            {plans.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "#182020",
                  border: `1px solid ${p.borderColor}`,
                  padding: "1.8rem 1.4rem",
                  textAlign: "left",
                  position: "relative",
                }}
              >
                {p.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      fontSize: 7,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      background: "rgba(0,155,155,0.15)",
                      border: "1px solid rgba(0,155,155,0.35)",
                      color: "#009B9B",
                      padding: "3px 8px",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f8f8", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: p.priceColor, marginBottom: 2 }}>
                  {p.price}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#5a9090" }}>/mo</span>
                </div>
                <div style={{ fontSize: 10, color: "#5a9090", marginBottom: 16 }}>{p.tagline}</div>
                <div style={{ marginBottom: 18 }}>
                  {p.features.map((f, fi) => (
                    <div
                      key={fi}
                      style={{
                        fontSize: 11,
                        color: f.included ? "#c8dede" : "#3a5555",
                        padding: "3px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: f.included ? "#009B9B" : "#3a5555", fontSize: 10 }}>
                        {f.included ? "✓" : "○"}
                      </span>
                      {f.text}
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    border:
                      p.btnStyle === "ghost"
                        ? "1px solid rgba(0,155,155,0.3)"
                        : p.btnStyle === "purple"
                        ? "1px solid rgba(136,85,204,0.5)"
                        : p.btnStyle === "coral"
                        ? "1px solid rgba(232,98,74,0.5)"
                        : "none",
                    background:
                      p.btnStyle === "solid"
                        ? "#009B9B"
                        : p.btnStyle === "purple"
                        ? "rgba(136,85,204,0.15)"
                        : p.btnStyle === "coral"
                        ? "rgba(232,98,74,0.15)"
                        : "transparent",
                    color:
                      p.btnStyle === "solid"
                        ? "#000"
                        : p.btnStyle === "purple"
                        ? "#8855CC"
                        : p.btnStyle === "coral"
                        ? "#E8624A"
                        : "#009B9B",
                  }}
                >
                  {p.btnLabel}
                </button>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "#5a9090", textAlign: "center", marginTop: "1.5rem" }}>
            All plans include access to all 7 studio tools.{" "}
            <Link to="/artists" style={{ color: "#009B9B", textDecoration: "none" }}>
              View the artist directory →
            </Link>
          </p>
        </div>
      </section>

      {/* ─── 7. Documentation ─── */}
      <section
        style={{
          background: "#182020",
          border: "1px solid rgba(0,155,155,0.18)",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 18, height: 2, background: "#009B9B" }} />
          <span
            style={{
              fontSize: 9,
              color: "#009B9B",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Documentation & Guides
          </span>
        </div>
        <div style={{ fontSize: 14, color: "#5a9090", marginBottom: "1.8rem" }}>
          Everything you need to get started and master the tools
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {docLinks.map((d, i) => (
            <button
              key={i}
              style={{
                background: "rgba(0,155,155,0.06)",
                border: "1px solid rgba(0,155,155,0.22)",
                padding: "9px 18px",
                color: "#009B9B",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "rgba(0,155,155,0.15)";
                (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "rgba(0,155,155,0.06)";
                (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div
          style={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: 10,
            color: "rgba(90,144,144,0.45)",
            marginTop: "1.5rem",
          }}
        >
          🎵 Voices & Vibes Studio Suite v3.0 · 2026 · All apps work offline after first load · No installation
          required · Mobile-friendly
        </div>
      </section>

      {/* ─── 8. Footer ─── */}
      <footer
        style={{
          background: "#060606",
          borderTop: "1px solid rgba(0,155,155,0.18)",
          padding: "2rem 5vw",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontWeight: 700,
            fontSize: "1.5rem",
            background: "linear-gradient(135deg, #009B9B, #E8624A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 6,
          }}
        >
          Voices & Vibes Radio
        </div>
        <div
          style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#5a9090",
            marginBottom: "1.2rem",
          }}
        >
          Where Healing Meets Music · Create · Share · Heal
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginBottom: "1.2rem",
          }}
          className="studio-footer-links"
        >
          {[
            { label: "Home", to: "/home" },
            { label: "Studio Pro", to: "/studio" },
            { label: "Artist Player", to: "/artist-player" },
            { label: "Ambient Player", to: "/listen" },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.to}
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5a9090",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={LISTEN_LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#5a9090",
              textDecoration: "none",
            }}
          >
            Listen Live
          </a>
        </div>
        <div style={{ fontSize: 9, color: "rgba(90,144,144,0.3)" }}>
          © 2026 Voices & Vibes Radio · Houston, TX · Hosted by Doreatha Page · LPC, NCC · voicesandvibesradio.com
        </div>
      </footer>

      {/* Mobile overrides */}
      <style>{`
        @media (max-width: 600px) {
          .studio-feat-grid { grid-template-columns: 1fr !important; }
          .studio-footer-links { gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
