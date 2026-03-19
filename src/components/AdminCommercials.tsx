import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Commercial {
  id: string;
  title: string;
  audio_url: string | null;
  sort_order: number;
  status: string | null;
  created_at: string;
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

const label = "font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase";
const inputStyle = {
  background: "rgba(0,155,155,0.05)",
  border: "1px solid rgba(0,155,155,0.2)",
  padding: "8px 10px",
};
const cardStyle = (opacity = 0.3) => ({
  background: "#1a1a1a",
  border: `1px solid rgba(0,155,155,${opacity})`,
  padding: "1.5rem",
});

const AdminCommercials = () => {
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("commercials")
      .select("*")
      .eq("status", "live")
      .order("sort_order", { ascending: true });
    setCommercials((data || []) as Commercial[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const uploadAudio = async (file: File) => {
    setUploading(true); setUploadPct(20);
    const ext = file.name.split(".").pop() || "mp3";
    const path = `commercials/ad-${Date.now()}.${ext}`;
    setUploadPct(50);
    const { error } = await supabase.storage.from("day-audio").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { t("❌ Upload failed"); setUploading(false); return; }
    setUploadPct(90);
    const { data } = supabase.storage.from("day-audio").getPublicUrl(path);
    setAudioUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploadPct(100);
    setTimeout(() => setUploading(false), 300);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const save = async () => {
    if (!title) { t("⚠️ Please enter a title"); return; }
    if (!audioUrl) { t("⚠️ Please upload an audio file"); return; }
    const nextOrder = commercials.length > 0 ? Math.max(...commercials.map(c => c.sort_order)) + 1 : 0;
    await supabase.from("commercials").insert({
      title,
      audio_url: audioUrl,
      sort_order: nextOrder,
      status: "live",
    });
    t("✅ Commercial added!");
    setTitle(""); setAudioUrl(null); setShowForm(false);
    fetchAll();
  };

  const deleteCommercial = async (id: string) => {
    await supabase.from("commercials").delete().eq("id", id);
    setDeleteId(null);
    t("Deleted.");
    fetchAll();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ══════════ COMMERCIALS LIST ══════════ */}
      <div style={cardStyle(0.3)}>
        <div className="flex items-center justify-between mb-4">
          <div className={label} style={{ color: "#E8624A" }}>📢 Commercials ({commercials.length})</div>
          <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: "#E8624A", animation: "pulse 1.5s ease-in-out infinite", boxShadow: "0 0 8px rgba(232,98,74,0.5)" }} />
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ background: "rgba(232,98,74,0.05)", height: 80, width: "100%" }} />
        ) : commercials.length === 0 ? (
          <div className="font-montserrat text-[12px]" style={{ color: "#8ab8b8" }}>No commercials yet. Add one below.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {commercials.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4" style={{ background: "#0f1a1a", border: "1px solid rgba(232,98,74,0.15)", padding: "0.75rem 1rem" }}>
                <div className="font-montserrat font-bold text-[14px] min-w-[24px] text-center" style={{ color: "#5a9090" }}>{i + 1}</div>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, background: "#0d1818" }}>
                  <span className="text-[1.2rem] opacity-60">📢</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-montserrat font-semibold text-[13px] text-white truncate">{c.title}</div>
                  <div className="font-montserrat font-light text-[10px]" style={{ color: "#8ab8b8" }}>Commercial</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {c.audio_url ? (
                    <span className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase" style={{ color: "#22c55e", padding: "2px 6px", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }}>Audio ✓</span>
                  ) : (
                    <span className="font-montserrat font-bold text-[8px] tracking-[0.1em] uppercase" style={{ color: "#E8624A", padding: "2px 6px", border: "1px solid rgba(232,98,74,0.3)", background: "rgba(232,98,74,0.1)" }}>No Audio</span>
                  )}
                  <button onClick={() => setDeleteId(c.id)} className="font-montserrat font-bold text-[9px] uppercase cursor-pointer ml-2" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "4px 8px" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════ ADD COMMERCIAL ══════════ */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", padding: "10px 20px" }}>
          + Add Commercial
        </button>
      ) : (
        <div style={cardStyle(0.2)}>
          <div className={label} style={{ color: "#E8624A", marginBottom: "1rem" }}>Add New Commercial</div>
          <div className="mb-4">
            <label className="block font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1" style={{ color: "#E8624A" }}>Title / Label</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spring Sale Promo" className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
          </div>

          <button onClick={() => audioRef.current?.click()} className="flex flex-col items-center gap-1 cursor-pointer w-full mb-4" style={{ background: "rgba(232,98,74,0.05)", border: `1px dashed ${audioUrl ? "#22c55e" : "rgba(232,98,74,0.25)"}`, padding: "1rem" }}>
            <div className="text-[1.4rem]">📢</div>
            <div className="font-montserrat font-bold text-[10px] tracking-[0.15em] uppercase" style={{ color: audioUrl ? "#22c55e" : "#E8624A" }}>{audioUrl ? "✓ Audio Ready" : "Upload Commercial Audio"}</div>
            <div className="text-[10px]" style={{ color: "#8ab8b8" }}>MP3, WAV, OGG</div>
          </button>

          {uploading && (
            <div className="mb-3" style={{ background: "rgba(232,98,74,0.1)", height: 6 }}>
              <div style={{ width: `${uploadPct}%`, height: "100%", background: "linear-gradient(to right,#E8624A,#009B9B)", transition: "width .3s" }} />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={save} disabled={uploading} className="flex-1 font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40" style={{ background: "#E8624A", color: "#0a0a0a", border: "none", padding: "12px" }}>
              📢 Add Commercial
            </button>
            <button onClick={() => { setShowForm(false); setTitle(""); setAudioUrl(null); }} className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "12px 20px" }}>
              Cancel
            </button>
          </div>

          <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])} />
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,98,74,0.3)", padding: "1.5rem", maxWidth: 340 }}>
            <div className="font-montserrat font-bold text-[12px] text-white mb-3">Delete this commercial?</div>
            <div className="font-montserrat text-[11px] mb-4" style={{ color: "#8ab8b8" }}>This cannot be undone.</div>
            <div className="flex gap-3">
              <button onClick={() => deleteCommercial(deleteId)} className="font-montserrat font-bold text-[10px] uppercase cursor-pointer" style={{ background: "#E8624A", color: "#0a0a0a", border: "none", padding: "8px 16px" }}>Delete</button>
              <button onClick={() => setDeleteId(null)} className="font-montserrat font-bold text-[10px] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", padding: "8px 16px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommercials;
