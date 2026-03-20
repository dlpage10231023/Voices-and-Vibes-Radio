import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import voicesLogo from "@/assets/voices-logo.jpg";

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c0c" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.3)", padding: "2rem", maxWidth: 360, width: "100%" }}>
        <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>🔒 Admin Access</div>
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Enter password" className="w-full font-montserrat text-[12px] text-white outline-none mb-3" style={{ background: "rgba(0,155,155,0.05)", border: `1px solid ${err ? "rgba(232,98,74,0.6)" : "rgba(0,155,155,0.2)"}`, padding: "10px 12px" }} />
        {err && <div className="font-montserrat text-[10px] mb-2" style={{ color: "#E8624A" }}>Wrong password</div>}
        <button onClick={submit} className="w-full font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "#009B9B", color: "#080c0c", border: "none", padding: "10px" }}>Enter</button>
      </div>
    </div>
  );
};

interface ArtistRow {
  id: string;
  artist_name: string;
  track_title: string;
  track_subtitle: string;
  genres: string;
  location: string;
  slug: string;
  image_url: string | null;
  audio_url: string | null;
  is_active: boolean;
}

const emptyForm = {
  artist_name: "",
  track_title: "",
  track_subtitle: "",
  genres: "",
  location: "",
  slug: "",
};

const AdminNewArtist = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("vv_admin") === "1");
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const audRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("new_artists").select("*").order("created_at", { ascending: false });
    if (data) setArtists(data as ArtistRow[]);
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const update = (k: keyof typeof emptyForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const uploadFile = async (bucket: string, file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub.publicUrl;
  };

  const save = async () => {
    if (!form.artist_name.trim()) { t("❌ Artist name required"); return; }
    setSaving(true);
    try {
      let image_url: string | undefined;
      let audio_url: string | undefined;
      if (imageFile) image_url = await uploadFile("album-art", imageFile, "new-artists");
      if (audioFile) audio_url = await uploadFile("day-audio", audioFile, "new-artists");

      const payload: Record<string, unknown> = { ...form };
      if (image_url) payload.image_url = image_url;
      if (audio_url) payload.audio_url = audio_url;

      if (editId) {
        await supabase.from("new_artists").update(payload).eq("id", editId);
        t("✅ Artist updated!");
      } else {
        await supabase.from("new_artists").insert(payload);
        t("✅ Artist saved!");
      }
      setForm(emptyForm);
      setEditId(null);
      setImageFile(null);
      setImagePreview(null);
      setAudioFile(null);
      setAudioPreview(null);
      await load();
    } catch {
      t("❌ Save failed");
    }
    setSaving(false);
  };

  const startEdit = (a: ArtistRow) => {
    setEditId(a.id);
    setForm({ artist_name: a.artist_name, track_title: a.track_title, track_subtitle: a.track_subtitle, genres: a.genres, location: a.location, slug: a.slug });
    setImagePreview(a.image_url || null);
    setAudioPreview(a.audio_url || null);
    setImageFile(null);
    setAudioFile(null);
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!current) {
      // Deactivate all, then activate this one
      await supabase.from("new_artists").update({ is_active: false }).neq("id", "impossible");
      await supabase.from("new_artists").update({ is_active: true }).eq("id", id);
      t("✅ Set as active!");
    } else {
      await supabase.from("new_artists").update({ is_active: false }).eq("id", id);
      t("Deactivated");
    }
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("new_artists").delete().eq("id", id);
    t("Removed");
    if (editId === id) { setEditId(null); setForm(emptyForm); }
    await load();
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const label = "font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1";
  const inputStyle: React.CSSProperties = { background: "rgba(0,155,155,0.05)", border: "1px solid rgba(0,155,155,0.2)", padding: "8px 10px" };

  const genreTags = form.genres.split(",").map((g) => g.trim()).filter(Boolean);
  const tagStyles = [
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
    { bg: "rgba(232,98,74,0.1)", border: "rgba(232,98,74,0.25)", color: "#E8624A" },
    { bg: "rgba(212,168,48,0.1)", border: "rgba(212,168,48,0.25)", color: "#D4A830" },
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#080c0c" }}>
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:px-[5vw] lg:py-8 min-h-screen">
        {/* LEFT: FORM */}
        <div className="w-full lg:w-[340px] lg:flex-shrink-0">
          <div style={{ background: "#131e1e", border: "1px solid rgba(0,155,155,0.3)", padding: "1.5rem" }} className="lg:sticky lg:top-8">
            <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>
              {editId ? "✏️ Edit Artist" : "➕ New Artist"}
            </div>
            <div className="flex flex-col gap-3">
              {[
                { l: "Artist Name", k: "artist_name" as const, ph: "Tony Williams" },
                { l: "Track Title", k: "track_title" as const, ph: "Soon" },
                { l: "Track Subtitle", k: "track_subtitle" as const, ph: "808 Session" },
                { l: "Genres (comma)", k: "genres" as const, ph: "Jazz, Gospel, 808 Soul" },
                { l: "Location", k: "location" as const, ph: "Houston, TX" },
                { l: "URL Slug", k: "slug" as const, ph: "tony-williams" },
              ].map((f) => (
                <div key={f.l}>
                  <label className={`block ${label}`} style={{ color: "#009B9B" }}>{f.l}</label>
                  <input type="text" value={form[f.k]} onChange={(e) => update(f.k, e.target.value)} placeholder={f.ph} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
                </div>
              ))}

              {/* Image upload */}
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Artist Photo</label>
                <button onClick={() => imgRef.current?.click()} className="flex items-center gap-2 cursor-pointer w-full" style={{ background: "rgba(232,98,74,0.05)", border: `1px dashed ${imagePreview ? "#22c55e" : "rgba(232,98,74,0.25)"}`, padding: "0.6rem 0.75rem" }}>
                  {imagePreview ? <img src={imagePreview} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "50%" }} /> : <span className="text-[1rem]">🖼️</span>}
                  <span className="font-montserrat font-bold text-[9px] tracking-[0.12em] uppercase" style={{ color: imagePreview ? "#22c55e" : "#E8624A" }}>
                    {imagePreview ? "✓ Ready" : "Upload Photo"}
                  </span>
                </button>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>

              {/* Audio upload */}
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Audio Track</label>
                <button onClick={() => audRef.current?.click()} className="flex items-center gap-2 cursor-pointer w-full" style={{ background: "rgba(0,155,155,0.05)", border: `1px dashed ${audioPreview ? "#22c55e" : "rgba(0,155,155,0.25)"}`, padding: "0.6rem 0.75rem" }}>
                  <span className="text-[1rem]">🎵</span>
                  <span className="font-montserrat font-bold text-[9px] tracking-[0.12em] uppercase" style={{ color: audioPreview ? "#22c55e" : "#009B9B" }}>
                    {audioPreview ? "✓ Track Ready" : "Upload Track"}
                  </span>
                </button>
                <input ref={audRef} type="file" accept="audio/*" className="hidden" onChange={handleAudio} />
              </div>

              {/* Save */}
              <button onClick={save} disabled={saving} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40 mt-2" style={{ background: "linear-gradient(135deg,#009B9B,#E8624A)", color: "#080c0c", border: "none", padding: "12px", width: "100%" }}>
                {saving ? "⏳ Saving..." : editId ? "💾 Update Artist" : "💾 Save Artist"}
              </button>

              {editId && (
                <button onClick={() => { setEditId(null); setForm(emptyForm); setImagePreview(null); setAudioPreview(null); }} className="font-montserrat font-bold text-[9px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "rgba(0,155,155,0.1)", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "10px", width: "100%" }}>
                  Cancel Edit
                </button>
              )}
            </div>

            {/* ARTIST LIST */}
            <div className="mt-6">
              <div className="font-montserrat font-bold text-[9px] tracking-[0.18em] uppercase mb-3" style={{ color: "#5a9090" }}>Saved Artists</div>
              {artists.length === 0 && <div className="font-montserrat text-[10px]" style={{ color: "#5a9090" }}>No artists yet</div>}
              {artists.map((a) => (
                <div key={a.id} style={{ background: a.is_active ? "rgba(0,155,155,0.08)" : "rgba(0,0,0,0.2)", border: `1px solid ${a.is_active ? "rgba(0,155,155,0.3)" : "rgba(0,155,155,0.1)"}`, padding: "0.6rem 0.75rem", marginBottom: "0.4rem" }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-montserrat font-bold text-[11px]" style={{ color: "#e8f5f5" }}>{a.artist_name}</div>
                    {a.is_active && <span className="font-montserrat font-bold text-[7px] tracking-[0.15em] uppercase" style={{ background: "#009B9B", color: "#080c0c", padding: "2px 6px" }}>ACTIVE</span>}
                  </div>
                  <div className="font-montserrat text-[9px] mb-2" style={{ color: "#5a9090" }}>"{a.track_title}" — {a.track_subtitle}</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => toggleActive(a.id, a.is_active)} className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase cursor-pointer" style={{ padding: "3px 8px", background: a.is_active ? "rgba(232,98,74,0.1)" : "rgba(0,155,155,0.1)", border: `1px solid ${a.is_active ? "rgba(232,98,74,0.3)" : "rgba(0,155,155,0.3)"}`, color: a.is_active ? "#E8624A" : "#009B9B" }}>
                      {a.is_active ? "Deactivate" : "Set Active"}
                    </button>
                    <button onClick={() => startEdit(a)} className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase cursor-pointer" style={{ padding: "3px 8px", background: "rgba(212,168,48,0.1)", border: "1px solid rgba(212,168,48,0.3)", color: "#D4A830" }}>
                      Edit
                    </button>
                    <button onClick={() => remove(a.id)} className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase cursor-pointer" style={{ padding: "3px 8px", background: "rgba(232,98,74,0.1)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 680, fontFamily: "'Montserrat', sans-serif", color: "#e8f5f5", background: "#080c0c", padding: "2rem 0" }}>
            {/* STATION HEADER */}
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", padding: "4px 12px", marginBottom: "1rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8624A", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
                New Artist Announcement
              </div>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block", lineHeight: 1.1, marginBottom: "0.25rem" }}>
                Voices & Vibes Radio
              </div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#5a9090" }}>
                Houston, TX · Est. Jan 2026 · voicesandvibesradio.com
              </div>
            </div>

            {/* CARD */}
            <div style={{ width: "100%", background: "rgba(19,30,30,0.92)", border: "1px solid rgba(0,155,155,0.25)", backdropFilter: "blur(10px)" }}>
              <div style={{ background: "linear-gradient(135deg,rgba(0,155,155,0.15),rgba(232,98,74,0.08))", borderBottom: "1px solid rgba(0,155,155,0.2)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "#009B9B", color: "#080c0c", padding: "3px 10px", flexShrink: 0 }}>New Artist</div>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a9090" }}>Now joining the Voices & Vibes platform</div>
              </div>

              {/* ARTIST ROW */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#009B9B,#E8624A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(0,155,155,0.3)", overflow: "hidden" }}>
                  <img src={imagePreview || voicesLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", fontWeight: 700, color: "#E8624A", lineHeight: 1, marginBottom: "0.2rem" }}>{form.artist_name || "Artist Name"}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#009B9B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    Now Playing: "{form.track_title || "Track"}" — {form.track_subtitle || "Subtitle"}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {genreTags.map((g, i) => (
                      <span key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", background: tagStyles[i % tagStyles.length].bg, border: `1px solid ${tagStyles[i % tagStyles.length].border}`, color: tagStyles[i % tagStyles.length].color }}>
                        {g}
                      </span>
                    ))}
                    {form.location && (
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", background: "rgba(0,155,155,0.1)", border: "1px solid rgba(0,155,155,0.25)", color: "#009B9B" }}>
                        {form.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* IMAGE PREVIEW */}
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#009B9B", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  On Air Announcement
                  <span style={{ flex: 1, height: 1, background: "rgba(0,155,155,0.15)" }} />
                </div>
                <div style={{ float: "right", margin: "0 0 1.5rem 2rem", width: 220, border: "1px solid rgba(0,155,155,0.2)", background: "linear-gradient(180deg,rgba(0,155,155,0.08),rgba(8,12,12,0.6))", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: 4, background: "linear-gradient(to right,#009B9B,#E8624A,#009B9B)" }} />
                  <div style={{ width: 220, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: "1px solid rgba(0,155,155,0.15)" }}>
                    <img src={imagePreview || voicesLogo} alt="" style={{ width: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "0.6rem 0.75rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(0,155,155,0.15)" }}>
                    <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1rem", fontWeight: 700, color: "#E8624A", lineHeight: 1.1, marginBottom: 1 }}>{form.artist_name || "Artist Name"}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#009B9B", letterSpacing: "0.1em", marginBottom: 5 }}>"{form.track_title || "Track"}"</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5a9090" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 5px #009B9B", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
                      Now on Platform
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.9, color: "rgba(232,245,245,0.85)" }}>
                  <p>You're listening to Voices and Vibes Radio — where healing meets music.</p>
                  <p style={{ height: "0.5rem" }} />
                  <p>We're excited to welcome a new artist to the platform —</p>
                  <p style={{ height: "0.5rem" }} />
                  <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.1rem", color: "#E8624A" }}>{form.artist_name || "Artist Name"}.</p>
                </div>
                <div style={{ clear: "both" }} />
              </div>

              {/* FOOTER */}
              <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(0,155,155,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#009B9B", letterSpacing: "0.08em" }}>voicesandvibesradio.com</span>
              </div>
              <div style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, rgba(0,155,155,0.15), rgba(232,98,74,0.1))", borderTop: "1px solid rgba(0,155,155,0.15)", textAlign: "center" }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", background: "linear-gradient(135deg, #009B9B, #E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  🎧 Listen at voicesandvibesradio.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes promoBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.1 } }
      `}</style>
    </div>
  );
};

export default AdminNewArtist;
