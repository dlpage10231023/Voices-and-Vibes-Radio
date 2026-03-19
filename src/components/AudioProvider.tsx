import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DayAudio } from "@/hooks/useDayAudio";

const DAY_SLUGS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getTodaySlug() {
  return DAY_SLUGS[new Date().getDay()];
}

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  stopPlay: () => void;
  currentTrack: DayAudio | null;
  hasTracks: boolean;
  setDayOverride: (slug: string | null) => void;
  /** Called by ArtistAudioProvider to register its stop function */
  registerOtherStop: (fn: () => void) => void;
}

const AudioCtx = createContext<AudioContextType>({
  isPlaying: false,
  togglePlay: () => {},
  stopPlay: () => {},
  currentTrack: null,
  hasTracks: false,
  setDayOverride: () => {},
  registerOtherStop: () => {},
});

export const useAudioPlayer = () => useContext(AudioCtx);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const otherStopRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<DayAudio | null>(null);
  const [tracks, setTracks] = useState<DayAudio[]>([]);
  const [dayOverride, setDayOverride] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const tracksRef = useRef<DayAudio[]>([]);

  const activeSlug = dayOverride || getTodaySlug();

  // Fetch tracks when active slug changes
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      const { data } = await supabase
        .from("day_audio")
        .select("*")
        .eq("day_slug", activeSlug)
        .order("sort_order", { ascending: true });
      if (!cancelled) {
        const t = (data as DayAudio[]) ?? [];
        setTracks(t);
        tracksRef.current = t;
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [activeSlug]);

  // Stop playback when tracks change
  useEffect(() => {
    stopAudio();
    setCurrentTrack(null);
    indexRef.current = 0;
  }, [tracks]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const playTrackAtIndex = useCallback((idx: number) => {
    const t = tracksRef.current;
    if (!t.length) return;
    const i = idx % t.length;
    indexRef.current = i;
    const track = t[i];
    setCurrentTrack(track);

    stopAudio();

    const audio = new Audio(track.audio_url);
    audio.volume = 0.25;
    audio.onended = () => playTrackAtIndex(i + 1);
    audioRef.current = audio;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [stopAudio]);

  const externalStop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
  }, [stopAudio]);

  const registerOtherStop = useCallback((fn: () => void) => {
    otherStopRef.current = fn;
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      // Stop artist audio before starting day audio
      otherStopRef.current?.();
      playTrackAtIndex(indexRef.current);
    }
  }, [isPlaying, playTrackAtIndex, stopAudio]);

  return (
    <AudioCtx.Provider value={{
      isPlaying,
      togglePlay,
      stopPlay: externalStop,
      currentTrack,
      hasTracks: tracks.length > 0,
      setDayOverride,
    }}>
      {children}
    </AudioCtx.Provider>
  );
};
