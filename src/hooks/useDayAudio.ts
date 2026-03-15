import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DayAudio {
  id: string;
  day_slug: string;
  audio_url: string;
  file_name: string | null;
  sort_order: number;
}

export function useDayAudio(daySlug: string) {
  const [tracks, setTracks] = useState<DayAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("day_audio")
        .select("*")
        .eq("day_slug", daySlug)
        .order("sort_order", { ascending: true });
      setTracks((data as DayAudio[]) ?? []);
      setLoading(false);
    };
    fetchTracks();
  }, [daySlug]);

  return { tracks, loading };
}

export function useAllDayAudio() {
  const [audioMap, setAudioMap] = useState<Record<string, DayAudio[]>>({});
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("day_audio")
      .select("*")
      .order("sort_order", { ascending: true });
    const map: Record<string, DayAudio[]> = {};
    (data as DayAudio[] | null)?.forEach((row) => {
      if (!map[row.day_slug]) map[row.day_slug] = [];
      map[row.day_slug].push(row);
    });
    setAudioMap(map);
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);

  return { audioMap, loading, refetch };
}
