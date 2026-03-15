import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllDayAudio } from "@/hooks/useDayAudio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "🕊️ Gospel Sunday",
  monday: "🌿 Mindful Monday",
  tuesday: "🌿 Healing Tuesday",
  wednesday: "💞 Connection Wednesday",
  thursday: "🎯 Purpose Thursday",
  friday: "🕊️ Freedom Friday",
  saturday: "✨ Soul Saturday",
};

const AudioAdmin = () => {
  const { audioMap, loading, refetch } = useAllDayAudio();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (daySlug: string, file: File) => {
    setUploading(daySlug);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${daySlug}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("day-audio")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("day-audio")
        .getPublicUrl(filePath);

      const existingTracks = audioMap[daySlug] || [];
      const nextOrder = existingTracks.length;

      const { error: dbError } = await supabase
        .from("day_audio")
        .insert({ day_slug: daySlug, audio_url: urlData.publicUrl, file_name: file.name, sort_order: nextOrder });

      if (dbError) throw dbError;
      await refetch();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (id: string, daySlug: string) => {
    try {
      // Get the record to find storage path
      const track = (audioMap[daySlug] || []).find(t => t.id === id);
      await supabase.from("day_audio").delete().eq("id", id);
      
      if (track?.audio_url) {
        // Extract path from URL
        const urlParts = track.audio_url.split("/day-audio/");
        if (urlParts[1]) {
          await supabase.storage.from("day-audio").remove([decodeURIComponent(urlParts[1])]);
        }
      }
      await refetch();
    } catch (err: any) {
      alert("Remove failed: " + err.message);
    }
  };

  const handleMove = async (daySlug: string, index: number, direction: -1 | 1) => {
    const tracks = [...(audioMap[daySlug] || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tracks.length) return;

    // Swap sort_order values
    const a = tracks[index];
    const b = tracks[newIndex];

    await Promise.all([
      supabase.from("day_audio").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("day_audio").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await refetch();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-[76px] overflow-x-hidden">
      <Navbar />

      <div className="pt-[120px] pb-20 px-[5vw]">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-montserrat text-[clamp(1.5rem,3vw,2.5rem)] font-black text-foreground mb-2 tracking-tight uppercase">
            Audio Manager
          </h1>
          <p className="text-[15px] text-muted mb-10 leading-[1.8]">
            Upload background music for each day's schedule page. Multiple tracks per day play as a playlist. Supported formats: MP3, WAV, OGG.
          </p>

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <div className="flex flex-col gap-6">
              {DAYS.map((slug) => {
                const tracks = audioMap[slug] || [];
                const isUploading = uploading === slug;

                return (
                  <div key={slug} className="bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[11px] tracking-[0.18em] uppercase text-primary font-bold">
                        {DAY_LABELS[slug]}
                      </div>
                      <label className="bg-primary text-primary-foreground px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:brightness-110 transition-all">
                        {isUploading ? "Uploading..." : "Add Track"}
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(slug, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    {tracks.length === 0 ? (
                      <p className="text-[12px] text-muted/50">No tracks uploaded</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {tracks.map((track, i) => (
                          <div
                            key={track.id}
                            className="flex items-center gap-3 bg-background/50 px-4 py-3"
                          >
                            <span className="text-[11px] text-muted/60 font-mono w-5 shrink-0">
                              {i + 1}.
                            </span>
                            <span className="text-[12px] text-muted flex-1 min-w-0 truncate">
                              {track.file_name || "Audio track"}
                            </span>
                            <audio controls src={track.audio_url} className="h-8 max-w-[180px] shrink-0" />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleMove(slug, i, -1)}
                                disabled={i === 0}
                                className="text-muted hover:text-foreground disabled:opacity-20 text-[11px] px-1 bg-transparent border-none cursor-pointer"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMove(slug, i, 1)}
                                disabled={i === tracks.length - 1}
                                className="text-muted hover:text-foreground disabled:opacity-20 text-[11px] px-1 bg-transparent border-none cursor-pointer"
                              >
                                ▼
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(track.id, slug)}
                              className="border border-secondary/30 text-secondary px-3 py-1 text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-all bg-transparent shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <StickyPlayer />
    </div>
  );
};

export default AudioAdmin;
