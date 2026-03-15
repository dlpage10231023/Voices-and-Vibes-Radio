import { motion, AnimatePresence } from "framer-motion";
import { Music, X } from "lucide-react";
import { DayAudio } from "@/hooks/useDayAudio";
import { useState } from "react";

interface NowPlayingPanelProps {
  currentTrack: DayAudio | null;
}

const NowPlayingPanel = ({ currentTrack }: NowPlayingPanelProps) => {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when track changes
  const trackId = currentTrack?.id;

  const show =
    currentTrack &&
    currentTrack.media_type === "audio" &&
    (currentTrack.artist_name || currentTrack.song_title || currentTrack.album_art_url) &&
    !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={trackId}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-[280px] bg-card border border-primary/20 rounded-sm shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-muted hover:text-foreground transition-colors bg-transparent border-none cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Album Art */}
          {currentTrack.album_art_url ? (
            <div className="w-full aspect-square bg-background/50 overflow-hidden">
              <img
                src={currentTrack.album_art_url}
                alt={`${currentTrack.album_name || currentTrack.song_title || "Album"} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-background/50 flex items-center justify-center">
              <Music className="w-16 h-16 text-primary/30" />
            </div>
          )}

          {/* Track Info */}
          <div className="p-4">
            <p className="text-[9px] font-bold text-primary tracking-[0.3em] uppercase mb-2">
              Now Playing
            </p>
            {currentTrack.song_title && (
              <p className="font-playfair text-base text-foreground font-semibold leading-tight mb-1 truncate">
                {currentTrack.song_title}
              </p>
            )}
            {currentTrack.artist_name && (
              <p className="text-[13px] text-muted truncate">
                {currentTrack.artist_name}
              </p>
            )}
            {currentTrack.album_name && (
              <p className="text-[11px] text-muted/60 truncate mt-0.5 italic">
                {currentTrack.album_name}
              </p>
            )}
          </div>

          {/* Animated bar */}
          <div className="flex items-end gap-[3px] px-4 pb-3 h-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-primary rounded-full"
                animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NowPlayingPanel;
