import { useAudioPlayer } from "./AudioProvider";

const ListenLiveButton = ({ className = "" }: { className?: string }) => {
  const { isPlaying, togglePlay, hasTracks } = useAudioPlayer();

  return (
    <button
      onClick={togglePlay}
      disabled={!hasTracks}
      className={`bg-primary text-primary-foreground px-8 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase border-none cursor-pointer hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {isPlaying ? '⏸ Now Playing' : '🎵 Listen Now'}
    </button>
  );
};

export default ListenLiveButton;
