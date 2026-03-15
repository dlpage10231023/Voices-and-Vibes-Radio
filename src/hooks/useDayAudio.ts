import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DayAudio {
  day_slug: string;
  audio_url: string;
  file_name: string | null;
}

export function useDayAudio(daySlug: string) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("day_audio")
        .select("audio_url")
        .eq("day_slug", daySlug)
        .maybeSingle();
      setAudioUrl(data?.audio_url ?? null);
      setLoading(false);
    };
    fetch();
  }, [daySlug]);

  return { audioUrl, loading };
}

export function useAllDayAudio() {
  const [audioMap, setAudioMap] = useState<Record<string, DayAudio>>({});
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("day_audio").select("*");
    const map: Record<string, DayAudio> = {};
    data?.forEach((row: any) => { map[row.day_slug] = row; });
    setAudioMap(map);
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);

  return { audioMap, loading, refetch };
}
