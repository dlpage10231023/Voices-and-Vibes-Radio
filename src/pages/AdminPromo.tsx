import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || "";

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

const PasswordGate = ({ onAuth }: { onAuth: () => void }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pw === ADMIN_PW) { sessionStorage.setItem("vv_admin", "1"); onAuth(); } else setErr(true);
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.3)", padding: "2rem", maxWidth: 360, width: "100%" }}>
        <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>🔒 Admin Access</div>
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Enter password" className="w-full font-montserrat text-[12px] text-white outline-none mb-3" style={{ background: "rgba(0,155,155,0.05)", border: `1px solid ${err ? "rgba(232,98,74,0.6)" : "rgba(0,155,155,0.2)"}`, padding: "10px 12px" }} />
        {err && <div className="font-montserrat text-[10px] mb-2" style={{ color: "#E8624A" }}>Wrong password</div>}
        <button onClick={submit} className="w-full font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "10px" }}>Enter</button>
      </div>
    </div>
  );
};

const DEFAULT_LINES = [
  "You're listening to Voices and Vibes Radio —",
  "where healing meets music.",
  "",
  "We're excited to welcome a new artist",
  "to the platform —",
  "",
  "{ARTIST_NAME}.",
  "",
  'His track "{TRACK}" is that smooth, soulful',
  "808 energy that hits you right in the spirit.",
  "Jazz roots. Healing heart. Houston vibes.",
  "",
  "{ARTIST_NAME} — now featured on",
  "Voices and Vibes Radio.",
  "",
  "voicesandvibesradio.com/artists/{SLUG}",
];

interface PromoData {
  artistName: string;
  trackTitle: string;
  genres: string;
  location: string;
  slug: string;
  announcementLines: string;
  artistEmoji: string;
}

const AdminPromo = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("vv_admin") === "1");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<PromoData>({
    artistName: "Tony Williams",
    trackTitle: "Soon",
    genres: "Jazz, Gospel, 808 Soul",
    location: "Houston, TX",
    slug: "tony-williams",
    announcementLines: DEFAULT_LINES.join("\n"),
    artistEmoji: "🎸",
  });

  const update = (key: keyof PromoData, val: string) => setData((p) => ({ ...p, [key]: val }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const processedLines = data.announcementLines
    .split("\n")
    .map((line) =>
      line
        .replace(/\{ARTIST_NAME\}/g, data.artistName)
        .replace(/\{TRACK\}/g, data.trackTitle)
        .replace(/\{SLUG\}/g, data.slug)
    );

  const genreTags = data.genres.split(",").map((g) => g.trim()).filter(Boolean);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#080c0c",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${data.slug || "promo"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      t("✅ Image downloaded!");
    } catch {
      t("❌ Download failed");
    }
    setDownloading(false);
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const label = "font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1";
  const inputStyle: React.CSSProperties = {
    background: "rgba(0,155,155,0.05)",
    border: "1px solid rgba(0,155,155,0.2)",
    padding: "8px 10px",
  };
  const tagColors = ["#009B9B", "#E8624A", "#D4A830", "#009B9B"];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", padding: "2rem 5vw" }}>
      <div className="font-dancing font-bold text-[1.6rem] mb-1" style={{ background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Voices & Vibes Radio
      </div>
      <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-6" style={{ color: "#009B9B" }}>Promo Card Generator</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ══════════ FORM ══════════ */}
        <div className="flex flex-col gap-4">
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.3)", padding: "1.5rem" }}>
            <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>Artist Details</div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Artist Name</label>
                <input type="text" value={data.artistName} onChange={(e) => update("artistName", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Track Title</label>
                <input type="text" value={data.trackTitle} onChange={(e) => update("trackTitle", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Genres (comma-separated)</label>
                <input type="text" value={data.genres} onChange={(e) => update("genres", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Location</label>
                <input type="text" value={data.location} onChange={(e) => update("location", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>URL Slug</label>
                <input type="text" value={data.slug} onChange={(e) => update("slug", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Avatar Emoji</label>
                <input type="text" value={data.artistEmoji} onChange={(e) => update("artistEmoji", e.target.value)} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
              </div>
            </div>

            {/* Image upload */}
            <div className="mb-3">
              <label className={`block ${label}`} style={{ color: "#009B9B" }}>Artist Photo</label>
              <button onClick={() => imgInputRef.current?.click()} className="flex items-center gap-2 cursor-pointer" style={{ background: "rgba(232,98,74,0.05)", border: `1px dashed ${imagePreview ? "#22c55e" : "rgba(232,98,74,0.25)"}`, padding: "0.75rem 1rem", width: "100%" }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ width: 40, height: 40, objectFit: "cover" }} />
                ) : (
                  <span className="text-[1.2rem]">🖼️</span>
                )}
                <span className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase" style={{ color: imagePreview ? "#22c55e" : "#E8624A" }}>
                  {imagePreview ? "✓ Photo Ready" : "Upload Artist Photo"}
                </span>
              </button>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            {/* Announcement text */}
            <div>
              <label className={`block ${label}`} style={{ color: "#009B9B" }}>Announcement Script</label>
              <div className="font-montserrat text-[9px] mb-1" style={{ color: "#5a9090" }}>
                Use {"{ARTIST_NAME}"}, {"{TRACK}"}, {"{SLUG}"} as placeholders. Empty lines = pauses.
              </div>
              <textarea
                value={data.announcementLines}
                onChange={(e) => update("announcementLines", e.target.value)}
                rows={12}
                className="w-full font-montserrat text-[11px] text-white outline-none resize-y"
                style={{ ...inputStyle, lineHeight: "1.8" }}
              />
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="font-montserrat font-bold text-[12px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#009B9B,#E8624A)", color: "#0a0a0a", border: "none", padding: "14px", width: "100%" }}
          >
            {downloading ? "⏳ Generating..." : "📥 Download Promo Card"}
          </button>
        </div>

        {/* ══════════ LIVE PREVIEW / DOWNLOADABLE CARD ══════════ */}
        <div>
          <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: "#009B9B" }}>Live Preview</div>

          <div
            ref={cardRef}
            style={{
              background: "#080c0c",
              padding: "2rem",
              maxWidth: 520,
              fontFamily: "'Montserrat', sans-serif",
              color: "#e8f5f5",
            }}
          >
            {/* Station header */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#009B9B", marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 6px #009B9B", display: "inline-block" }} />
                New Artist Announcement
              </div>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.3rem", fontWeight: 700, background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Voices & Vibes Radio
              </div>
              <div style={{ fontSize: 9, color: "#5a9090", letterSpacing: "0.08em" }}>
                Houston, TX · Est. Jan 2026 · voicesandvibesradio.com
              </div>
            </div>

            {/* Card */}
            <div style={{ background: "#131e1e", border: "1px solid rgba(0,155,155,0.2)", overflow: "hidden" }}>
              {/* Card header */}
              <div style={{ background: "linear-gradient(135deg,rgba(0,155,155,0.15),rgba(232,98,74,0.08))", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#080c0c", background: "#009B9B", padding: "3px 10px" }}>New Artist</span>
                <span style={{ fontSize: 10, color: "#5a9090" }}>Now joining the Voices & Vibes platform</span>
              </div>

              {/* Artist row */}
              <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid rgba(0,155,155,0.08)" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#009B9B,#E8624A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, boxShadow: "0 0 20px rgba(0,155,155,0.3)" }}>
                  {data.artistEmoji}
                </div>
                <div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", fontWeight: 700, color: "#E8624A", lineHeight: 1, marginBottom: 2 }}>{data.artistName}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#009B9B", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 4 }}>
                    Now Playing: "{data.trackTitle}"
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                    {genreTags.map((g, i) => (
                      <span key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", border: `1px solid ${tagColors[i % tagColors.length]}40`, background: `${tagColors[i % tagColors.length]}18`, color: tagColors[i % tagColors.length] }}>
                        {g}
                      </span>
                    ))}
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", border: "1px solid rgba(0,155,155,0.25)", background: "rgba(0,155,155,0.1)", color: "#009B9B" }}>
                      {data.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Announcement body with floating image */}
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#009B9B", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  On Air Announcement
                  <span style={{ flex: 1, height: 1, background: "rgba(0,155,155,0.15)" }} />
                </div>

                {/* Float image */}
                <div style={{ float: "right" as const, margin: "0 0 1rem 1.5rem", width: 160, border: "1px solid rgba(0,155,155,0.2)", background: "linear-gradient(180deg,rgba(0,155,155,0.08),rgba(8,12,12,0.6))", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: 4, background: "linear-gradient(to right,#009B9B,#E8624A,#009B9B)" }} />
                  <div style={{ width: 160, height: 160, background: "linear-gradient(135deg,#0d1a1a 0%,#1a1000 40%,#0a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" as const, overflow: "hidden", borderBottom: "1px solid rgba(0,155,155,0.15)" }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt={data.artistName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      data.artistEmoji
                    )}
                  </div>
                  <div style={{ padding: "0.6rem 0.75rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(0,155,155,0.15)" }}>
                    <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1rem", fontWeight: 700, color: "#E8624A", lineHeight: 1.1, marginBottom: 1 }}>{data.artistName}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#009B9B", letterSpacing: "0.1em", marginBottom: 5 }}>"{data.trackTitle}"</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#5a9090" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 5px #009B9B", display: "inline-block" }} />
                      Now on Platform
                    </div>
                  </div>
                </div>

                {/* Announcement lines */}
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
                  {processedLines.map((line, i) => {
                    if (line.trim() === "") return <div key={i} style={{ height: "0.5rem" }} />;
                    const isName = line === data.artistName + "." || line.includes("Voices and Vibes Radio.");
                    const isUrl = line.includes("voicesandvibesradio.com");
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: isName ? "1.1rem" : 13,
                          lineHeight: 1.9,
                          color: isName ? "#E8624A" : isUrl ? "#009B9B" : "rgba(232,245,245,0.85)",
                          fontFamily: isName ? "'Dancing Script', cursive" : isUrl ? "'Share Tech Mono', monospace" : undefined,
                          padding: "4px 0",
                          borderBottom: isName || isUrl ? "none" : "1px solid rgba(0,155,155,0.05)",
                          ...(isUrl ? { fontSize: 11, letterSpacing: "0.08em" } : {}),
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}
                  <div style={{ clear: "both" as const }} />
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(0,155,155,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", flexWrap: "wrap" as const, gap: "0.5rem" }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#009B9B", letterSpacing: "0.08em" }}>
                  voicesandvibesradio.com/artists/{data.slug}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(0,155,155,0.12)", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B" }}>
                    📋 Share
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A" }}>
                    🎙️ Listen Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromo;
