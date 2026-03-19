import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminCommercials from "@/components/AdminCommercials";
import { toast } from "sonner";

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || "";

interface Spotlight {
  id: string;
  status: string | null;
  title: string | null;
  artist: string | null;
  album: string | null;
  year: string | null;
  audio_url: string | null;
  image_url: string | null;
  featured_week: string | null;
  artist_slug: string | null;
  updated_at: string | null;
  sort_order: number;
}

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

const Skel = () => (
  <div className="animate-pulse" style={{ background: "rgba(0,155,155,0.05)", height: 120, width: "100%" }} />
);

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

const AdminSpotlight = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("vv_admin") === "1");
  const [tracks, setTracks] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [fArtist, setFArtist] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fAlbum, setFAlbum] = useState("");
  const [fYear, setFYear] = useState("");
  const [fWeek, setFWeek] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const audioRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from("artist_spotlight")
      .select("*")
      .eq("status", "live")
      .order("sort_order", { ascending: true });
    if (err) { setError(true); setLoading(false); return; }
    setTracks((data || []) as Spotlight[]);
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  const deleteSpotlight = async (id: string) => {
    await supabase.from("artist_spotlight").delete().eq("id", id);
    setDeleteId(null);
    t("Deleted.");
    fetchAll();
  };

  const uploadAudio = async (file: File) => {
    setUploading(true); setUploadPct(20);
    const ext = file.name.split(".").pop() || "mp3";
    const path = `artist-spotlight/track-${Date.now()}.${ext}`;
    setUploadPct(50);
    const { error: err } = await supabase.storage.from("day-audio").upload(path, file, { upsert: true, contentType: file.type });
    if (err) { t("❌ Upload failed"); setUploading(false); return; }
    setUploadPct(90);
    const { data } = supabase.storage.from("day-audio").getPublicUrl(path);
    setAudioUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploadPct(100);
    setTimeout(() => setUploading(false), 300);
    if (!fTitle) setFTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const uploadImage = async (file: File) => {
    setUploading(true); setUploadPct(20);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `artist-spotlight/cover-${Date.now()}.${ext}`;
    setUploadPct(50);
    const { error: err } = await supabase.storage.from("album-art").upload(path, file, { upsert: true, contentType: file.type });
    if (err) { t("❌ Upload failed"); setUploading(false); return; }
    setUploadPct(90);
    const { data } = supabase.storage.from("album-art").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setImageUrl(url);
    setImgPreview(URL.createObjectURL(file));
    setUploadPct(100);
    setTimeout(() => setUploading(false), 300);
  };

  const saveTrack = async () => {
    if (!fArtist || !fTitle) { t("⚠️ Please fill in artist name and track title"); return; }
    const nextOrder = tracks.length > 0 ? Math.max(...tracks.map(t => t.sort_order)) + 1 : 0;
    await supabase.from("artist_spotlight").insert({
      status: "live",
      artist: fArtist,
      title: fTitle,
      album: fAlbum || null,
      year: fYear || null,
      featured_week: fWeek || null,
      audio_url: audioUrl,
      image_url: imageUrl,
      sort_order: nextOrder,
    });
    t("✅ Track added to rotation!");
    setFArtist(""); setFTitle(""); setFAlbum(""); setFYear(""); setFWeek("");
    setAudioUrl(null); setImageUrl(null); setImgPreview(null); setShowForm(false);
    fetchAll();
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const cardStyle = (opacity = 0.3) => ({
    background: "#1a1a1a",
    border: `1px solid rgba(0,155,155,${opacity})`,
    padding: "1.5rem",
  });
  const label = "font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase";
  const inputStyle = {
    background: "rgba(0,155,155,0.05)",
    border: "1px solid rgba(0,155,155,0.2)",
    padding: "8px 10px",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", padding: "2rem 5vw" }}>
      <div className="font-dancing font-bold text-[1.6rem] mb-1" style={{ background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Voices & Vibes Radio
      </div>
      <div className={label} style={{ color: "#009B9B", marginBottom: "2rem" }}>Artist Spotlight Admin</div>

      {loading && <Skel />}
      {error && (
        <div style={{ ...cardStyle(0.2), borderColor: "rgba(232,98,74,0.3)" }}>
          <p className="font-montserrat text-[12px]" style={{ color: "#E8624A" }}>Could not load data.</p>
          <button onClick={fetchAll} className={`${label} cursor-pointer mt-2`} style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "8px 16px" }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {/* ══════════ LIVE ROTATION TRACKS ══════════ */}
          <div style={cardStyle(0.3)}>
            <div className="flex items-center justify-between mb-4">
              <div className={label} style={{ color: "#009B9B" }}>🎵 Live Rotation ({tracks.length} tracks)</div>
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: "#22c55e", animation: "pulse 1.5s ease-in-out infinite", boxShadow: "0 0 8px rgba(34,197,94,0.5)" }} />
            </div>

            {tracks.length === 0 ? (
              <div className="font-montserrat text-[12px]" style={{ color: "#8ab8b8" }}>No tracks in rotation. Add one below.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {tracks.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4" style={{ background: "#0f1a1a", border: "1px solid rgba(0,155,155,0.15)", padding: "0.75rem 1rem" }}>
                    <div className="font-montserrat font-bold text-[14px] min-w-[24px] text-center" style={{ color: "#5a9090" }}>{i + 1}</div>
                    {s.image_url ? (
                      <img src={s.image_url} alt="" style={{ width: 48, height: 48, objectFit: "cover", border: "1px solid rgba(0,155,155,0.2)", flexShrink: 0 }} />
                    ) : (
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, background: "#0d1818" }}><span className="text-[1.2rem] opacity-40">🎵</span></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-montserrat font-semibold text-[13px] text-white truncate">{s.title || "Untitled"}</div>
                      <div className="font-dancing font-bold text-[1rem] truncate" style={{ color: "#E8624A" }}>{s.artist || "Unknown"}</div>
                      <div className="font-montserrat font-light text-[11px] truncate" style={{ color: "#8ab8b8" }}>
                        {[s.album, s.year].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.audio_url ? (
                        <span className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase" style={{ color: "#22c55e", padding: "2px 6px", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }}>Audio ✓</span>
                      ) : (
                        <span className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase" style={{ color: "#E8624A", padding: "2px 6px", border: "1px solid rgba(232,98,74,0.3)", background: "rgba(232,98,74,0.1)" }}>No Audio</span>
                      )}
                      <button onClick={() => setDeleteId(s.id)} className="font-montserrat font-bold text-[9px] uppercase cursor-pointer ml-2" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "4px 8px" }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════ ADD TRACK ══════════ */}
          <div>
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "10px 20px" }}>
                + Add Track to Rotation
              </button>
            ) : (
              <div style={cardStyle(0.2)}>
                <div className={label} style={{ color: "#009B9B", marginBottom: "1rem" }}>Add New Track</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { l: "Artist Name", v: fArtist, s: setFArtist, ph: "Artist name" },
                    { l: "Track Title", v: fTitle, s: setFTitle, ph: "Song title" },
                    { l: "Album", v: fAlbum, s: setFAlbum, ph: "Album title" },
                    { l: "Year", v: fYear, s: setFYear, ph: "2025" },
                  ].map((f) => (
                    <div key={f.l}>
                      <label className="block font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1" style={{ color: "#009B9B" }}>{f.l}</label>
                      <input type="text" value={f.v} onChange={(e) => f.s(e.target.value)} placeholder={f.ph} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1" style={{ color: "#009B9B" }}>Featured Week</label>
                    <input type="text" value={fWeek} onChange={(e) => setFWeek(e.target.value)} placeholder="Week of March 17" className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => audioRef.current?.click()} className="flex flex-col items-center gap-1 cursor-pointer" style={{ background: "rgba(0,155,155,0.05)", border: `1px dashed ${audioUrl ? "#009B9B" : "rgba(0,155,155,0.25)"}`, padding: "1rem" }}>
                    <div className="text-[1.4rem]">🎵</div>
                    <div className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase" style={{ color: audioUrl ? "#22c55e" : "#009B9B" }}>{audioUrl ? "✓ Track Ready" : "Upload Track"}</div>
                    <div className="text-[10px]" style={{ color: "#8ab8b8" }}>MP3, WAV, OGG</div>
                  </button>
                  <button onClick={() => imgRef.current?.click()} className="flex flex-col items-center gap-1 cursor-pointer" style={{ background: "rgba(232,98,74,0.05)", border: `1px dashed ${imageUrl ? "#E8624A" : "rgba(232,98,74,0.25)"}`, padding: "1rem" }}>
                    {imgPreview ? <img src={imgPreview} alt="" style={{ width: 40, height: 40, objectFit: "cover" }} /> : <div className="text-[1.4rem]">🖼️</div>}
                    <div className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase" style={{ color: imageUrl ? "#22c55e" : "#E8624A" }}>{imageUrl ? "✓ Art Ready" : "Album Art"}</div>
                    <div className="text-[10px]" style={{ color: "#8ab8b8" }}>JPG, PNG, WebP</div>
                  </button>
                </div>

                {uploading && (
                  <div className="mb-3" style={{ background: "rgba(0,155,155,0.1)", height: 6 }}>
                    <div style={{ width: `${uploadPct}%`, height: "100%", background: "linear-gradient(to right,#009B9B,#E8624A)", transition: "width .3s" }} />
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={saveTrack} disabled={uploading} className="flex-1 font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40" style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "12px" }}>
                    💾 Add to Rotation
                  </button>
                  <button onClick={() => { setShowForm(false); setFArtist(""); setFTitle(""); setFAlbum(""); setFYear(""); setFWeek(""); setAudioUrl(null); setImageUrl(null); setImgPreview(null); }} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "12px 20px" }}>
                    Cancel
                  </button>
                </div>

                <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])} />
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Preview link */}
          <a href="/artist-player" target="_blank" rel="noopener noreferrer" className="font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase no-underline text-center" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "10px" }}>
            👁 Preview Player
          </a>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,98,74,0.3)", padding: "1.5rem", maxWidth: 340 }}>
            <div className="font-montserrat font-bold text-[12px] text-white mb-3">Delete this track?</div>
            <div className="font-montserrat text-[11px] mb-4" style={{ color: "#8ab8b8" }}>This cannot be undone.</div>
            <div className="flex gap-3">
              <button onClick={() => deleteSpotlight(deleteId)} className="font-montserrat font-bold text-[10px] uppercase cursor-pointer" style={{ background: "#E8624A", color: "#0a0a0a", border: "none", padding: "8px 16px" }}>Delete</button>
              <button onClick={() => setDeleteId(null)} className="font-montserrat font-bold text-[10px] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "8px 16px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

export default AdminSpotlight;
