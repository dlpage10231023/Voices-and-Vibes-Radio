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
      const filePath = `${daySlug}/background.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("day-audio")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("day-audio")
        .getPublicUrl(filePath);

      // Upsert into day_audio table
      const { error: dbError } = await supabase
        .from("day_audio")
        .upsert(
          { day_slug: daySlug, audio_url: urlData.publicUrl, file_name: file.name },
          { onConflict: "day_slug" }
        );

      if (dbError) throw dbError;
      await refetch();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (daySlug: string) => {
    try {
      await supabase.from("day_audio").delete().eq("day_slug", daySlug);
      // Remove file from storage
      const { data: files } = await supabase.storage.from("day-audio").list(daySlug);
      if (files?.length) {
        await supabase.storage.from("day-audio").remove(files.map(f => `${daySlug}/${f.name}`));
      }
      await refetch();
    } catch (err: any) {
      alert("Remove failed: " + err.message);
    }
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
            Upload background music for each day's schedule page. Supported formats: MP3, WAV, OGG.
          </p>

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {DAYS.map((slug) => {
                const audio = audioMap[slug];
                const isUploading = uploading === slug;

                return (
                  <div key={slug} className="bg-card p-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-[11px] tracking-[0.18em] uppercase text-primary font-bold mb-1">
                        {DAY_LABELS[slug]}
                      </div>
                      {audio ? (
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-muted">{audio.file_name || "Audio uploaded"}</span>
                          <audio controls src={audio.audio_url} className="h-8 max-w-[200px]" />
                        </div>
                      ) : (
                        <span className="text-[12px] text-muted/50">No audio uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="bg-primary text-primary-foreground px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:brightness-110 transition-all">
                        {isUploading ? "Uploading..." : audio ? "Replace" : "Upload"}
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
                      {audio && (
                        <button
                          onClick={() => handleRemove(slug)}
                          className="border border-secondary/30 text-secondary px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-all bg-transparent"
                        >
                          Remove
                        </button>
                      )}
                    </div>
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
