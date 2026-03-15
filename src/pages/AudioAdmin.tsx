import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllDayAudio } from "@/hooks/useDayAudio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import { Badge } from "@/components/ui/badge";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ artist_name: "", song_title: "", album_name: "" });

  const handleUpload = async (daySlug: string, file: File, mediaType: "audio" | "video") => {
    setUploading(daySlug);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${daySlug}/${Date.now()}.${ext}`;
      const bucket = mediaType === "video" ? "day-video" : "day-audio";

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const existingTracks = audioMap[daySlug] || [];
      const nextOrder = existingTracks.length;

      const { error: dbError } = await supabase.from("day_audio").insert({
        day_slug: daySlug,
        audio_url: urlData.publicUrl,
        file_name: file.name,
        sort_order: nextOrder,
        media_type: mediaType,
      });

      if (dbError) throw dbError;
      await refetch();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleAlbumArtUpload = async (trackId: string, file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${trackId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("album-art")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("album-art").getPublicUrl(filePath);

      await supabase.from("day_audio").update({ album_art_url: urlData.publicUrl }).eq("id", trackId);
      await refetch();
    } catch (err: any) {
      alert("Album art upload failed: " + err.message);
    }
  };

  const handleRemove = async (id: string, daySlug: string) => {
    try {
      const track = (audioMap[daySlug] || []).find((t) => t.id === id);
      await supabase.from("day_audio").delete().eq("id", id);

      if (track?.audio_url) {
        const bucket = track.media_type === "video" ? "day-video" : "day-audio";
        const urlParts = track.audio_url.split(`/${bucket}/`);
        if (urlParts[1]) {
          await supabase.storage.from(bucket).remove([decodeURIComponent(urlParts[1])]);
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

    const a = tracks[index];
    const b = tracks[newIndex];

    await Promise.all([
      supabase.from("day_audio").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("day_audio").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await refetch();
  };

  const startEdit = (track: any) => {
    setEditingId(track.id);
    setEditForm({
      artist_name: track.artist_name || "",
      song_title: track.song_title || "",
      album_name: track.album_name || "",
    });
  };

  const saveEdit = async (id: string) => {
    await supabase.from("day_audio").update({
      artist_name: editForm.artist_name || null,
      song_title: editForm.song_title || null,
      album_name: editForm.album_name || null,
    }).eq("id", id);
    setEditingId(null);
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
            Upload background music and video commercials for each day's schedule page. Add artist info and album art to showcase during playback.
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
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="text-[11px] tracking-[0.18em] uppercase text-primary font-bold">
                        {DAY_LABELS[slug]}
                      </div>
                      <div className="flex gap-2">
                        <label className="bg-primary text-primary-foreground px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:brightness-110 transition-all">
                          {isUploading ? "Uploading..." : "Add Track"}
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(slug, file, "audio");
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <label className="bg-secondary text-secondary-foreground px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:brightness-110 transition-all">
                          {isUploading ? "Uploading..." : "Add Commercial"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(slug, file, "video");
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {tracks.length === 0 ? (
                      <p className="text-[12px] text-muted/50">No tracks uploaded</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {tracks.map((track, i) => (
                          <div key={track.id} className="bg-background/50 px-4 py-3">
                            {/* Row 1: main controls */}
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-muted/60 font-mono w-5 shrink-0">
                                {i + 1}.
                              </span>
                              <Badge
                                variant={track.media_type === "video" ? "secondary" : "default"}
                                className="text-[9px] shrink-0"
                              >
                                {track.media_type === "video" ? "Video" : "Audio"}
                              </Badge>

                              {/* Album art thumbnail */}
                              {track.album_art_url && (
                                <img
                                  src={track.album_art_url}
                                  alt="Album art"
                                  className="w-10 h-10 object-cover rounded-sm shrink-0"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <span className="text-[12px] text-muted truncate block">
                                  {track.song_title || track.file_name || "Media track"}
                                </span>
                                {track.artist_name && (
                                  <span className="text-[10px] text-muted/60 truncate block">
                                    {track.artist_name}
                                    {track.album_name ? ` · ${track.album_name}` : ""}
                                  </span>
                                )}
                              </div>

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

                              {track.media_type === "audio" && (
                                <button
                                  onClick={() => editingId === track.id ? setEditingId(null) : startEdit(track)}
                                  className="border border-primary/30 text-primary px-3 py-1 text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all bg-transparent shrink-0"
                                >
                                  {editingId === track.id ? "Cancel" : "Info"}
                                </button>
                              )}

                              <button
                                onClick={() => handleRemove(track.id, slug)}
                                className="border border-secondary/30 text-secondary px-3 py-1 text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-all bg-transparent shrink-0"
                              >
                                Remove
                              </button>
                            </div>

                            {/* Row 2: edit form (when editing) */}
                            {editingId === track.id && (
                              <div className="mt-3 flex flex-col gap-2 border-t border-primary/10 pt-3">
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Artist name"
                                    value={editForm.artist_name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, artist_name: e.target.value }))}
                                    className="bg-background border border-primary/20 text-foreground text-[12px] px-3 py-2 outline-none focus:border-primary"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Song title"
                                    value={editForm.song_title}
                                    onChange={(e) => setEditForm((f) => ({ ...f, song_title: e.target.value }))}
                                    className="bg-background border border-primary/20 text-foreground text-[12px] px-3 py-2 outline-none focus:border-primary"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Album name"
                                    value={editForm.album_name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, album_name: e.target.value }))}
                                    className="bg-background border border-primary/20 text-foreground text-[12px] px-3 py-2 outline-none focus:border-primary"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="border border-primary/20 text-muted px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-primary/10 transition-all">
                                    Upload Album Art
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAlbumArtUpload(track.id, file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                  <button
                                    onClick={() => saveEdit(track.id)}
                                    className="bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:brightness-110 transition-all border-none"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}
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
