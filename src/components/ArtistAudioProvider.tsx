import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { get, set } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayer } from "./AudioProvider";

interface SpotlightTrack {
  id: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  year: string | null;
  audio_url: string | null;
  image_url: string | null;
  sort_order: number;
}

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
  trackIndex: number;
  trackCount: number;
  isPlayingCommercial: boolean;
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
  nextTrack: () => void;
  prevTrack: () => void;
  loadAudioFile: (file: File) => void;
  loadImageFile: (file: File) => void;
  setArtSrc: (src: string | null) => void;
  setMetaTitle: (v: string) => void;
  setMetaArtist: (v: string) => void;
  setMetaAlbum: (v: string) => void;
  setMetaYear: (v: string) => void;
  audioElement: HTMLAudioElement | null;
  getAnalyser: () => AnalyserNode | null;
}

type Ctx = ArtistAudioState & ArtistAudioActions;

const ArtistAudioCtx = createContext<Ctx | null>(null);

export const useArtistAudio = () => {
  const ctx = useContext(ArtistAudioCtx);
  if (!ctx) throw new Error("useArtistAudio must be inside ArtistAudioProvider");
  return ctx;
};


export const ArtistAudioProvider = ({ children }: { children: ReactNode }) => {
  const dayAudio = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

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

  // Multi-track state
  const [tracks, setTracks] = useState<SpotlightTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const tracksRef = useRef<SpotlightTrack[]>([]);

  // Commercial state
  interface Commercial { id: string; title: string; audio_url: string | null; sort_order: number; }
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const commercialsRef = useRef<Commercial[]>([]);
  const [commercialIndex, setCommercialIndex] = useState(0);
  const commercialIdxRef = useRef(0);
  const [isPlayingCommercial, setIsPlayingCommercial] = useState(false);
  const isPlayingCommercialRef = useRef(false);

  // Create audio element once
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
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.pause();
    };
  }, []);

  // Load a specific track by index into the audio element
  const loadTrackByIndex = useCallback((idx: number, autoPlay = false) => {
    const t = tracksRef.current;
    if (!t.length) return;
    const i = idx % t.length;
    const track = t[i];
    setTrackIndex(i);
    setIsPlayingCommercial(false);
    isPlayingCommercialRef.current = false;

    if (track.title) setMetaTitle(track.title);
    if (track.artist) setMetaArtist(track.artist);
    setMetaAlbum(track.album || "");
    setMetaYear(track.year || "");
    setArtSrc(track.image_url || null);

    const a = audioRef.current;
    if (a && track.audio_url) {
      a.src = track.audio_url;
      a.load();
      setHasSource(true);
      if (autoPlay) {
        a.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setHasSource(!!track.audio_url);
    }
  }, []);

  // Helper to play a commercial by index
  const playCommercial = useCallback((idx: number) => {
    const c = commercialsRef.current;
    if (!c.length) return false;
    const i = idx % c.length;
    const comm = c[i];
    if (!comm.audio_url) return false;

    const a = audioRef.current;
    if (!a) return false;

    setIsPlayingCommercial(true);
    isPlayingCommercialRef.current = true;
    setCommercialIndex(i);
    commercialIdxRef.current = i;
    setMetaTitle(`🔊 ${comm.title}`);
    setMetaArtist("Commercial Break");
    setMetaAlbum("");
    setMetaYear("");
    setArtSrc(null);

    a.src = comm.audio_url;
    a.load();
    setHasSource(true);
    a.play().catch(() => {});
    setIsPlaying(true);
    return true;
  }, []);

  // Handle track end — play commercial between tracks or advance
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onEnd = () => {
      if (a.loop) {
        a.currentTime = 0;
        a.play();
        return;
      }

      if (isPlayingCommercialRef.current) {
        // Commercial just ended → advance to next spotlight track
        if (tracksRef.current.length > 0) {
          const next = (trackIndex + 1) % tracksRef.current.length;
          loadTrackByIndex(next, true);
        } else {
          setIsPlayingCommercial(false);
          isPlayingCommercialRef.current = false;
          a.pause();
          setIsPlaying(false);
        }
      } else if (tracksRef.current.length > 1) {
        // Spotlight track ended → try to play a commercial first
        const nextCommIdx = commercialIdxRef.current;
        if (!playCommercial(nextCommIdx)) {
          const next = (trackIndex + 1) % tracksRef.current.length;
          loadTrackByIndex(next, true);
        } else {
          commercialIdxRef.current = (nextCommIdx + 1) % (commercialsRef.current.length || 1);
          setCommercialIndex(commercialIdxRef.current);
        }
      } else {
        a.pause();
        setIsPlaying(false);
      }
    };
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex, playCommercial, loadTrackByIndex]);

  // Fetch all live tracks from cloud
  useEffect(() => {
    const restore = async () => {
      const { data } = await supabase
        .from("artist_spotlight")
        .select("*")
        .eq("status", "live")
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        const mapped: SpotlightTrack[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          artist: d.artist,
          album: d.album,
          year: d.year,
          audio_url: d.audio_url,
          image_url: d.image_url,
          sort_order: (d as any).sort_order ?? 0,
        }));
        setTracks(mapped);
        tracksRef.current = mapped;
        // Load first track (don't auto-play)
        loadTrackByIndex(0, false);
        return;
      }

      // Fall back to IndexedDB
      const [savedAudio, savedImage] = await Promise.all([
        get<File>("vv_last_audio").catch(() => undefined),
        get<File>("vv_last_image").catch(() => undefined),
      ]);
      if (savedAudio instanceof File) loadAudioFile(savedAudio);
      if (savedImage instanceof File) loadImageFile(savedImage);
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch live commercials
  useEffect(() => {
    const fetchCommercials = async () => {
      const { data } = await supabase
        .from("commercials")
        .select("*")
        .eq("status", "live")
        .order("sort_order", { ascending: true });
      if (data) {
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          audio_url: d.audio_url,
          sort_order: d.sort_order,
        }));
        setCommercials(mapped);
        commercialsRef.current = mapped;
      }
    };
    fetchCommercials();
  }, []);

  const stopPlay = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    dayAudio.registerOtherStop(stopPlay);
  }, [dayAudio, stopPlay]);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (isPlaying) {
      stopPlay();
    } else {
      dayAudio.stopPlay();
      // Ensure AudioContext is created and resumed before playing
      // so audio routes through Web Audio API properly
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      await a.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, stopPlay, dayAudio]);

  const nextTrack = useCallback(() => {
    if (tracksRef.current.length <= 1) return;
    const next = (trackIndex + 1) % tracksRef.current.length;
    loadTrackByIndex(next, isPlaying);
  }, [trackIndex, isPlaying, loadTrackByIndex]);

  const prevTrack = useCallback(() => {
    if (tracksRef.current.length <= 1) return;
    const prev = (trackIndex - 1 + tracksRef.current.length) % tracksRef.current.length;
    loadTrackByIndex(prev, isPlaying);
  }, [trackIndex, isPlaying, loadTrackByIndex]);

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
    if (a) { a.src = url; a.load(); setHasSource(true); }
    set("vv_last_audio", file).catch(() => {});
  }, []);

  const loadImageFile = useCallback((file: File) => {
    const localUrl = URL.createObjectURL(file);
    setArtSrc(localUrl);
    set("vv_last_image", file).catch(() => {});
  }, []);

  const getAnalyser = useCallback((): AnalyserNode | null => {
    const a = audioRef.current;
    if (!a) return null;
    if (!audioCtxRef.current) {
      const actx = new AudioContext();
      const an = actx.createAnalyser();
      an.fftSize = 128;
      an.smoothingTimeConstant = 0.82;
      const src = actx.createMediaElementSource(a);
      src.connect(an);
      an.connect(actx.destination);
      audioCtxRef.current = actx;
      analyserRef.current = an;
      sourceRef.current = src;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return analyserRef.current;
  }, []);

  const value: Ctx = {
    isPlaying, elapsed, duration, progress, volume, isMuted, isLooping, isShuffled,
    metaTitle, metaArtist, metaAlbum, metaYear, artSrc, hasSource,
    trackIndex, trackCount: tracks.length,
    isPlayingCommercial,
    togglePlay, stopPlay, skipBack, skipFwd, seekTo,
    nextTrack, prevTrack,
    toggleLoop, toggleShuffle, toggleMute, setVolume,
    loadAudioFile, loadImageFile, setArtSrc,
    setMetaTitle, setMetaArtist, setMetaAlbum, setMetaYear,
    audioElement: audioRef.current,
    getAnalyser,
  };

  return <ArtistAudioCtx.Provider value={value}>{children}</ArtistAudioCtx.Provider>;
};
