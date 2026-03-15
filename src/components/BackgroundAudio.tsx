import { useEffect, useRef, useCallback, useState } from "react";
import { useDayAudio } from "@/hooks/useDayAudio";
import { motion, AnimatePresence } from "framer-motion";

const BackgroundAudio = ({ daySlug }: { daySlug: string }) => {
  const { tracks } = useDayAudio(daySlug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playTrack = useCallback((index: number) => {
    if (!tracks.length) return;
    const idx = index % tracks.length;
    indexRef.current = idx;
    const track = tracks[idx];

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (track.media_type === "video") {
      setVideoSrc(track.audio_url);
    } else {
      setVideoSrc(null);
      const audio = new Audio(track.audio_url);
      audio.volume = 0.15;
      audio.onended = () => playTrack(idx + 1);
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
  }, [tracks]);

  const handleVideoEnded = useCallback(() => {
    setVideoSrc(null);
    playTrack(indexRef.current + 1);
  }, [playTrack]);

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
      setVideoSrc(null);
    };
  }, [tracks, playTrack]);

  return (
    <AnimatePresence>
      {videoSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            className="max-w-[90vw] max-h-[80vh] rounded"
            style={{ volume: 1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackgroundAudio;
