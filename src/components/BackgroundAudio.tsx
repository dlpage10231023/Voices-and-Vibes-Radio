import { useEffect, useRef, useCallback } from "react";
import { useDayAudio } from "@/hooks/useDayAudio";

const BackgroundAudio = ({ daySlug }: { daySlug: string }) => {
  const { tracks } = useDayAudio(daySlug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);

  const playTrack = useCallback((index: number) => {
    if (!tracks.length) return;
    const idx = index % tracks.length;
    indexRef.current = idx;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(tracks[idx].audio_url);
    audio.volume = 0.15;
    audio.onended = () => playTrack(idx + 1);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [tracks]);

  useEffect(() => {
    if (tracks.length > 0) {
      playTrack(0);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [tracks, playTrack]);

  return null;
};

export default BackgroundAudio;
