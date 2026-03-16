import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";

export interface ArtistAudioState {
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffled: boolean;
  metaTitle: string;
  metaArtist: string;
  metaAlbum: string;
  metaYear: string;
  artSrc: string | null;
  hasSource: boolean;
}

export interface ArtistAudioActions {
  togglePlay: () => Promise<void>;
  stopPlay: () => void;
  skipBack: () => void;
  skipFwd: () => void;
  seekTo: (pct: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  loadAudioFile: (file: File) => void;
  loadImageFile: (file: File) => void;
  setArtSrc: (src: string | null) => void;
  setMetaTitle: (v: string) => void;
  setMetaArtist: (v: string) => void;
  setMetaAlbum: (v: string) => void;
  setMetaYear: (v: string) => void;
  /** Expose the audio element so the page can hook up a visualiser */
  audioElement: HTMLAudioElement | null;
}

type Ctx = ArtistAudioState & ArtistAudioActions;

const ArtistAudioCtx = createContext<Ctx | null>(null);

export const useArtistAudio = () => {
  const ctx = useContext(ArtistAudioCtx);
  if (!ctx) throw new Error("useArtistAudio must be inside ArtistAudioProvider");
  return ctx;
};

export const ArtistAudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaArtist, setMetaArtist] = useState("");
  const [metaAlbum, setMetaAlbum] = useState("");
  const [metaYear, setMetaYear] = useState("");
  const [artSrc, setArtSrc] = useState<string | null>(null);
  const [hasSource, setHasSource] = useState(false);

  // Create audio element once and keep it alive
  useEffect(() => {
    const a = new Audio();
    a.volume = 0.8;
    audioRef.current = a;

    const onTime = () => {
      if (!a.duration) return;
      setElapsed(a.currentTime);
      setProgress((a.currentTime / a.duration) * 100);
    };
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => {
      if (a.loop) {
        a.currentTime = 0;
        a.play();
      } else {
        a.pause();
        setIsPlaying(false);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.pause();
    };
  }, []);

  const stopPlay = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (isPlaying) {
      stopPlay();
    } else {
      await a.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, stopPlay]);

  const skipBack = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime - 10);
  }, []);

  const skipFwd = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 10);
  }, []);

  const seekTo = useCallback((pct: number) => {
    const a = audioRef.current;
    if (a && a.duration) a.currentTime = pct * a.duration;
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((v) => {
      if (audioRef.current) audioRef.current.loop = !v;
      return !v;
    });
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffled((v) => !v), []);

  const toggleMute = useCallback(() => {
    setIsMuted((v) => {
      if (audioRef.current) audioRef.current.muted = !v;
      return !v;
    });
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  }, []);

  const loadAudioFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const a = audioRef.current;
    if (a) {
      a.src = url;
      a.load();
      setHasSource(true);
      // Auto-set title from filename if empty
      const name = file.name.replace(/\.[^/.]+$/, "");
      setMetaTitle((prev) => prev || name);
    }
  }, []);

  const loadImageFile = useCallback((file: File) => {
    setArtSrc(URL.createObjectURL(file));
  }, []);

  const value: Ctx = {
    isPlaying, elapsed, duration, progress, volume, isMuted, isLooping, isShuffled,
    metaTitle, metaArtist, metaAlbum, metaYear, artSrc, hasSource,
    togglePlay, stopPlay, skipBack, skipFwd, seekTo,
    toggleLoop, toggleShuffle, toggleMute, setVolume,
    loadAudioFile, loadImageFile, setArtSrc,
    setMetaTitle, setMetaArtist, setMetaAlbum, setMetaYear,
    audioElement: audioRef.current,
  };

  return <ArtistAudioCtx.Provider value={value}>{children}</ArtistAudioCtx.Provider>;
};
