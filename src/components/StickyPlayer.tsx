import { useAudioPlayer } from "./AudioProvider";

const barHeights = [14, 20, 10, 18, 14];

const StickyPlayer = () => {
  const { isPlaying, togglePlay } = useAudioPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] bg-primary flex items-center justify-between px-[5vw] h-[58px]">
      <div className="flex items-center gap-4">
        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-secondary animate-blink' : 'bg-secondary/50'}`} />
        <div>
          <div className="text-[12px] font-bold text-primary-foreground tracking-[0.1em] uppercase">
            🎙️ Voices & Vibes Radio — {isPlaying ? 'Live' : 'Offline'}
          </div>
          <div className="text-[11px] text-primary-foreground/50 tracking-[0.05em]">
            voicesandvibesradio.com · Houston, TX
          </div>
        </div>
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-[22px]">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="w-[3px] bg-primary-foreground/30 rounded-sm animate-wave"
                style={{ height: `${h}px`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] font-bold text-primary-foreground/60 tracking-[0.08em] hidden sm:inline">
          voicesandvibes.fm
        </span>
        <button
          onClick={togglePlay}
          className="bg-primary-foreground text-primary px-5 py-2 text-[11px] font-bold tracking-[0.12em] uppercase cursor-pointer border-none hover:opacity-90 transition-opacity"
        >
          {isPlaying ? '⏸ Pause' : '🎵 Listen Now'}
        </button>
      </div>
    </div>
  );
};

export default StickyPlayer;
