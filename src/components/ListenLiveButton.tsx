import { useAudioPlayer } from "./AudioProvider";

const ListenLiveButton = ({ className = "" }: { className?: string }) => {
  const { isPlaying, togglePlay } = useAudioPlayer();

  return (
    <button
      onClick={togglePlay}
      className={`bg-primary text-primary-foreground px-8 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase border-none cursor-pointer hover:brightness-110 hover:-translate-y-0.5 transition-all ${className}`}
    >
      {isPlaying ? '⏸ Now Playing' : '🎵 Listen Live'}
    </button>
  );
};

export default ListenLiveButton;
