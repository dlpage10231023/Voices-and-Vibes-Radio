import { useEffect, useRef } from "react";
import { useDayAudio } from "@/hooks/useDayAudio";

const BackgroundAudio = ({ daySlug }: { daySlug: string }) => {
  const { audioUrl } = useDayAudio(daySlug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    // Auto-play (may be blocked by browser until user interaction)
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  return null;
};

export default BackgroundAudio;
