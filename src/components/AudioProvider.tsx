import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioCtx = createContext<AudioContextType>({ isPlaying: false, togglePlay: () => {} });

export const useAudioPlayer = () => useContext(AudioCtx);

const STREAM_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
    }
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  return (
    <AudioCtx.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </AudioCtx.Provider>
  );
};
