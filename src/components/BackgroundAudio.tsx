import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/components/AudioProvider";
import { motion, AnimatePresence } from "framer-motion";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import { useDayAudio } from "@/hooks/useDayAudio";

const BackgroundAudio = ({ daySlug }: { daySlug: string }) => {
  const { setDayOverride, currentTrack } = useAudioPlayer();
  const { tracks } = useDayAudio(daySlug);

  // Find current track's media_type for video overlay
  const videoTrack = currentTrack?.media_type === "video" ? currentTrack : null;

  // Override the AudioProvider's day slug while on this page
  useEffect(() => {
    setDayOverride(daySlug);
    return () => setDayOverride(null);
  }, [daySlug, setDayOverride]);

  return (
    <>
      <NowPlayingPanel currentTrack={currentTrack} />
      <AnimatePresence>
        {videoTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
          >
            <video
              src={videoTrack.audio_url}
              autoPlay
              playsInline
              className="max-w-[90vw] max-h-[80vh] rounded"
              onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).volume = 1; }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackgroundAudio;
