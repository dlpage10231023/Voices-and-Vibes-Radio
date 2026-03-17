import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || "";

/* ── Types ── */
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
}

/* ── Toast helper ── */
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

/* ── Skeleton ── */
const Skel = () => (
  <div
    className="animate-pulse"
    style={{ background: "rgba(0,155,155,0.05)", height: 120, width: "100%" }}
  />
);

/* ── Password Gate ── */
const PasswordGate = ({ onAuth }: { onAuth: () => void }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pw === ADMIN_PW) {
      sessionStorage.setItem("vv_admin", "1");
      onAuth();
    } else {
      setErr(true);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.3)", padding: "2rem", maxWidth: 360, width: "100%" }}>
        <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>
          🔒 Admin Access
        </div>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter password"
          className="w-full font-montserrat text-[12px] text-white outline-none mb-3"
          style={{ background: "rgba(0,155,155,0.05)", border: `1px solid ${err ? "rgba(232,98,74,0.6)" : "rgba(0,155,155,0.2)"}`, padding: "10px 12px" }}
        />
        {err && <div className="font-montserrat text-[10px] mb-2" style={{ color: "#E8624A" }}>Wrong password</div>}
        <button
          onClick={submit}
          className="w-full font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer"
          style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "10px" }}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════ */
const AdminSpotlight = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("vv_admin") === "1");
  const [live, setLive] = useState<Spotlight | null>(null);
  const [next, setNext] = useState<Spotlight | null>(null);
  const [archived, setArchived] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ── Next-up form state ── */
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
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const audioRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from("artist_spotlight")
      .select("*")
      .order("updated_at", { ascending: false });
    if (err) { setError(true); setLoading(false); return; }
    const rows = (data || []) as Spotlight[];
    setLive(rows.find((r) => r.status === "live") || null);
    setNext(rows.find((r) => r.status === "next") || null);
    setArchived(rows.filter((r) => r.status === "archived"));
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  /* ── Actions ── */
  const archiveLive = async () => {
    if (!live) return;
    await supabase.from("artist_spotlight").update({ status: "archived" }).eq("id", live.id);
    if (next) {
      await supabase.from("artist_spotlight").update({ status: "live" }).eq("id", next.id);
      t("📦 Artist archived to past spotlights");
    } else {
      t("📦 Artist archived. No next track queued.");
    }
    fetchAll();
  };

  const goLiveNow = async () => {
    if (!next) return;
    if (live) await supabase.from("artist_spotlight").update({ status: "archived" }).eq("id", live.id);
    await supabase.from("artist_spotlight").update({ status: "live" }).eq("id", next.id);
    t("🎙️ New artist is now live for all visitors!");
    fetchAll();
  };

  const removeNext = async () => {
    if (!next) return;
    await supabase.from("artist_spotlight").delete().eq("id", next.id);
    t("Removed queued track.");
    fetchAll();
  };

  const restoreAsNext = async (id: string) => {
    // If there's already a next, archive it first
    if (next) await supabase.from("artist_spotlight").update({ status: "archived" }).eq("id", next.id);
    await supabase.from("artist_spotlight").update({ status: "next" }).eq("id", id);
    t("🔄 Artist restored to next up queue");
    fetchAll();
  };

  const deleteSpotlight = async (id: string) => {
    await supabase.from("artist_spotlight").delete().eq("id", id);
    setDeleteId(null);
    t("Deleted.");
    fetchAll();
  };

  /* ── File uploads ── */
  const uploadAudio = async (file: File) => {
    setUploading(true);
    setUploadPct(20);
    const ext = file.name.split(".").pop() || "mp3";
    const path = `artist-spotlight/next-track-${Date.now()}.${ext}`;
    setUploadPct(50);
    const { error: err } = await supabase.storage.from("day-audio").upload(path, file, { upsert: true, contentType: file.type });
    if (err) { t("❌ Upload failed — please try again"); setUploading(false); return; }
    setUploadPct(90);
    const { data } = supabase.storage.from("day-audio").getPublicUrl(path);
    setAudioUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploadPct(100);
    setTimeout(() => setUploading(false), 300);
    if (!fTitle) setFTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadPct(20);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `artist-spotlight/next-cover-${Date.now()}.${ext}`;
    setUploadPct(50);
    const { error: err } = await supabase.storage.from("album-art").upload(path, file, { upsert: true, contentType: file.type });
    if (err) { t("❌ Upload failed — please try again"); setUploading(false); return; }
    setUploadPct(90);
    const { data } = supabase.storage.from("album-art").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setImageUrl(url);
    setImgPreview(URL.createObjectURL(file));
    setUploadPct(100);
    setTimeout(() => setUploading(false), 300);
  };

  const saveNext = async () => {
    if (!fArtist || !fTitle) { t("⚠️ Please fill in artist name and track title"); return; }
    if (!audioUrl || !imageUrl) { t("⚠️ Please upload both audio and album art"); return; }
    // Remove existing next if any
    if (next) await supabase.from("artist_spotlight").delete().eq("id", next.id);
    await supabase.from("artist_spotlight").insert({
      status: "next",
      artist: fArtist,
      title: fTitle,
      album: fAlbum,
      year: fYear,
      featured_week: fWeek,
      audio_url: audioUrl,
      image_url: imageUrl,
    });
    t("✅ Next artist queued and ready!");
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
          <p className="font-montserrat text-[12px]" style={{ color: "#E8624A" }}>Could not load spotlight data. Check your connection and try again.</p>
          <button onClick={fetchAll} className={`${label} cursor-pointer mt-2`} style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "8px 16px" }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {/* ══════════ SECTION 1 — NOW LIVE ══════════ */}
          <div style={cardStyle(0.3)}>
            <div className="flex items-center justify-between mb-4">
              <div className={label} style={{ color: "#009B9B" }}>🟢 NOW LIVE</div>
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: "#22c55e", animation: "pulse 1.5s ease-in-out infinite", boxShadow: "0 0 8px rgba(34,197,94,0.5)" }} />
            </div>
            {live ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  {live.image_url ? (
                    <img src={live.image_url} alt="" style={{ width: 80, height: 80, objectFit: "cover", objectPosition: "top", border: "1px solid rgba(0,155,155,0.2)" }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ width: 80, height: 80, background: "#0d1a1a" }}><span className="text-[2rem] opacity-40">🎙️</span></div>
                  )}
                  <div>
                    <div className="font-dancing font-bold text-[1.4rem]" style={{ color: live.artist ? "#E8624A" : "#8ab8b8" }}>{live.artist || "Not provided"}</div>
                    <div className="font-montserrat font-semibold text-[1rem]" style={{ color: live.title ? "#fff" : "#8ab8b8" }}>{live.title || "Not provided"}</div>
                    <div className="font-montserrat font-light text-[12px]" style={{ color: "#8ab8b8" }}>{(live.album || "Not provided")}{live.year ? ` · ${live.year}` : ""}</div>
                    {live.featured_week && <div className="font-montserrat text-[9px] mt-1" style={{ color: "#8ab8b8" }}>{live.featured_week}</div>}
                    <div className="font-montserrat text-[10px] mt-1" style={{ color: "#009B9B" }}>Playing for all visitors</div>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={archiveLive} className="font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase cursor-pointer" style={{ background: "rgba(232,98,74,0.15)", border: "1px solid #E8624A", color: "#E8624A", padding: "8px 16px" }}>
                    ⏹ Archive This Artist
                  </button>
                  <a href="/artist-player" target="_blank" rel="noopener noreferrer" className="font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase no-underline cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "8px 16px" }}>
                    👁 Preview Player
                  </a>
                </div>
              </>
            ) : (
              <div className="font-montserrat text-[12px]" style={{ color: "#8ab8b8" }}>No artist is currently live. Queue one below and go live.</div>
            )}
          </div>

          {/* ══════════ SECTION 2 — NEXT UP ══════════ */}
          <div style={cardStyle(0.2)}>
            <div className={label} style={{ color: "#009B9B", marginBottom: "1rem" }}>⏭ NEXT UP</div>
            {next ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  {next.image_url ? (
                    <img src={next.image_url} alt="" style={{ width: 80, height: 80, objectFit: "cover", objectPosition: "top", border: "1px solid rgba(0,155,155,0.2)" }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ width: 80, height: 80, background: "#0d1a1a" }}><span className="text-[2rem] opacity-40">🎵</span></div>
                  )}
                  <div>
                    <div className="font-dancing font-bold text-[1.4rem]" style={{ color: "#E8624A" }}>{next.artist}</div>
                    <div className="font-montserrat font-semibold text-[1rem] text-white">{next.title}</div>
                    <div className="font-montserrat font-light text-[12px]" style={{ color: "#8ab8b8" }}>{next.album}{next.year ? ` · ${next.year}` : ""}</div>
                    {next.featured_week && <div className="font-montserrat text-[9px] mt-1" style={{ color: "#8ab8b8" }}>{next.featured_week}</div>}
                  </div>
                </div>
                <button onClick={goLiveNow} className="w-full font-montserrat font-black text-[12px] tracking-[0.15em] uppercase cursor-pointer mb-2" style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "12px" }}>
                  🚀 Go Live Now
                </button>
                <button onClick={removeNext} className="font-montserrat font-bold text-[10px] tracking-[0.1em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "6px 14px" }}>
                  ✕ Remove
                </button>
              </>
            ) : (
              <div style={{ border: "1px dashed rgba(0,155,155,0.3)", padding: "2rem", textAlign: "center" }}>
                <div className="font-montserrat font-bold text-[12px] mb-1" style={{ color: "#009B9B" }}>Queue your next artist spotlight</div>
                <div className="font-montserrat text-[11px]" style={{ color: "#8ab8b8" }}>Upload while current artist plays — swap with one click when ready</div>
              </div>
            )}
          </div>

          {/* ── Next track upload form ── */}
          {!next && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "10px 20px" }}>
                  + Prepare Next Artist
                </button>
              ) : (
                <div style={cardStyle(0.2)}>
                  <div className={label} style={{ color: "#009B9B", marginBottom: "1rem" }}>Prepare Next Artist Spotlight</div>
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

                  {/* Upload buttons */}
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

                  {/* Progress bar */}
                  {uploading && (
                    <div className="mb-3" style={{ background: "rgba(0,155,155,0.1)", height: 6 }}>
                      <div style={{ width: `${uploadPct}%`, height: "100%", background: "linear-gradient(to right,#009B9B,#E8624A)", transition: "width .3s" }} />
                    </div>
                  )}

                  <button
                    onClick={saveNext}
                    disabled={uploading}
                    className="w-full font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40"
                    style={{ background: "#009B9B", color: "#0a0a0a", border: "none", padding: "12px" }}
                  >
                    💾 Save as Next Up
                  </button>

                  <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])} />
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                </div>
              )}
            </div>
          )}

          {/* ══════════ SECTION 3 — PAST SPOTLIGHTS ══════════ */}
          <div style={cardStyle(0.1)}>
            <div className={label} style={{ color: "#009B9B", marginBottom: "1rem" }}>📚 Past Spotlights</div>
            {archived.length === 0 ? (
              <div className="font-montserrat text-[12px]" style={{ color: "#8ab8b8" }}>Past spotlights will appear here after you archive them.</div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {archived.map((s) => (
                  <div key={s.id} style={{ background: "#0f1a1a", border: "1px solid rgba(0,155,155,0.15)", overflow: "hidden" }}>
                    {s.image_url ? (
                      <img src={s.image_url} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <div className="flex items-center justify-center" style={{ width: "100%", aspectRatio: "1/1", background: "#0d1818" }}><span className="text-[2rem] opacity-30">🎵</span></div>
                    )}
                    <div style={{ padding: "8px 10px" }}>
                      <div className="font-dancing font-bold text-[1rem]" style={{ color: "#E8624A" }}>{s.artist}</div>
                      <div className="font-montserrat font-semibold text-[12px] text-white truncate">{s.title}</div>
                      {s.featured_week && <div className="font-montserrat font-light text-[10px]" style={{ color: "#8ab8b8" }}>{s.featured_week}</div>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => restoreAsNext(s.id)} className="font-montserrat font-bold text-[9px] tracking-[0.08em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "4px 8px" }}>
                          🔄 Restore
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="font-montserrat font-bold text-[9px] tracking-[0.08em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "4px 8px" }}>
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirmation dialog ── */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,98,74,0.3)", padding: "1.5rem", maxWidth: 340 }}>
            <div className="font-montserrat font-bold text-[12px] text-white mb-3">Delete this spotlight?</div>
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
