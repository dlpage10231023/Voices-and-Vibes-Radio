import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import voicesLogo from "@/assets/voices-logo.jpg";

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || "";

const t = (msg: string) =>
  toast(msg, {
    duration: 2500,
    style: {
      background: "rgba(17,17,17,0.95)",
      border: "1px solid rgba(0,155,155,0.3)",
      color: "#fff",
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 11,
    },
  });

const PasswordGate = ({ onAuth }: { onAuth: () => void }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pw === ADMIN_PW) { sessionStorage.setItem("vv_admin", "1"); onAuth(); } else setErr(true);
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c0c" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(0,155,155,0.3)", padding: "2rem", maxWidth: 360, width: "100%" }}>
        <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>🔒 Admin Access</div>
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Enter password" className="w-full font-montserrat text-[12px] text-white outline-none mb-3" style={{ background: "rgba(0,155,155,0.05)", border: `1px solid ${err ? "rgba(232,98,74,0.6)" : "rgba(0,155,155,0.2)"}`, padding: "10px 12px" }} />
        {err && <div className="font-montserrat text-[10px] mb-2" style={{ color: "#E8624A" }}>Wrong password</div>}
        <button onClick={submit} className="w-full font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer" style={{ background: "#009B9B", color: "#080c0c", border: "none", padding: "10px" }}>Enter</button>
      </div>
    </div>
  );
};

interface PromoData {
  artistName: string;
  trackTitle: string;
  trackSubtitle: string;
  genres: string;
  location: string;
  slug: string;
  announcementLines: string[];
}

const DEFAULT_LINES = [
  { text: "You're listening to Voices and Vibes Radio —", type: "normal" },
  { text: "where healing meets music.", type: "normal" },
  { text: "", type: "pause" },
  { text: "We're excited to welcome a new artist", type: "normal" },
  { text: "to the platform —", type: "normal" },
  { text: "", type: "pause" },
  { text: "Tony Williams.", type: "station-name" },
  { text: "", type: "pause" },
  { text: 'His track "Soon" is that smooth, soulful', type: "normal" },
  { text: "808 energy that hits you right in the spirit.", type: "normal" },
  { text: "Jazz roots. Healing heart. Houston vibes.", type: "normal" },
  { text: "", type: "pause" },
  { text: "Tony Williams — now featured on", type: "normal" },
  { text: "Voices and Vibes Radio.", type: "station-name" },
  { text: "", type: "pause" },
  { text: "voicesandvibesradio.com", type: "url" },
  { text: "", type: "pause" },
  { text: "And that was...", type: "normal" },
  { text: '"Soon."', type: "station-name" },
];

const AdminPromo = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("vv_admin") === "1");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set(DEFAULT_LINES.map((_, i) => i)));
  const [announceDone, setAnnounceDone] = useState(false);
  const [eqHeights, setEqHeights] = useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4]);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const eqIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [data, setData] = useState<PromoData>({
    artistName: "Tony Williams",
    trackTitle: "Soon",
    trackSubtitle: "808 Session",
    genres: "Jazz,Gospel,808 Soul",
    location: "Houston, TX",
    slug: "tony-williams",
    announcementLines: [],
  });

  const update = (key: keyof PromoData, val: string) => setData((p) => ({ ...p, [key]: val }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioSrc(URL.createObjectURL(file));
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const startEQ = useCallback(() => {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqIntervalRef.current = setInterval(() => {
      setEqHeights(Array.from({ length: 8 }, () => 3 + Math.random() * 18));
    }, 80);
  }, []);

  const stopEQ = useCallback(() => {
    if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
    eqIntervalRef.current = null;
    setEqHeights([4, 4, 4, 4, 4, 4, 4, 4]);
  }, []);

  const startAnnouncement = useCallback(() => {
    lineTimeoutsRef.current.forEach((t) => clearTimeout(t));
    lineTimeoutsRef.current = [];
    setVisibleLines(new Set());
    let delay = 800;
    DEFAULT_LINES.forEach((line, i) => {
      const isPause = line.type === "pause";
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => new Set(prev).add(i));
      }, delay);
      lineTimeoutsRef.current.push(timeout);
      delay += isPause ? 600 : 1800;
    });
    setAnnounceDone(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopEQ();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startEQ();
      if (!announceDone) startAnnouncement();
    }
  }, [isPlaying, audioSrc, startEQ, stopEQ, announceDone, startAnnouncement]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (a.duration) {
        setProgress((a.currentTime / a.duration) * 100);
        setCurrentTime(fmt(a.currentTime));
      }
    };
    const onMeta = () => setDuration(fmt(a.duration));
    const onEnd = () => { setIsPlaying(false); setProgress(0); setCurrentTime("0:00"); stopEQ(); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); };
  }, [audioSrc, stopEQ]);

  useEffect(() => {
    return () => {
      if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
      lineTimeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const imgToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  };

  const blobUrlToBase64 = (url: string): Promise<string> => {
    return fetch(url)
      .then((r) => r.blob())
      .then(
        (blob): Promise<string> =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(blob);
          })
      )
      .catch(() => "");
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Convert all images in the card to base64
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      const imgs = clone.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(async (img) => {
          if (img.src && !img.src.startsWith("data:")) {
            const b64 = await imgToBase64(img.src);
            img.src = b64;
          }
        })
      );

      // Convert audio to base64 for embedding
      let audioB64 = "";
      if (audioSrc) {
        audioB64 = await blobUrlToBase64(audioSrc);
      }

      const cardHtml = clone.outerHTML;
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.artistName} — New Artist Announcement · Voices & Vibes Radio</title>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@300;400;500;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;min-height:100vh;background:#080c0c;color:#e8f5f5;font-family:'Montserrat',sans-serif;display:flex;align-items:center;justify-content:center;padding:2rem}
@keyframes promoSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes promoBlink{0%,100%{opacity:1}50%{opacity:0.1}}
</style>
</head>
<body>
${cardHtml}
${audioB64 ? `<audio id="promo-audio" src="${audioB64}" preload="auto"></audio>` : ""}
<script>
(function(){
  var audio = document.getElementById('promo-audio');
  if (!audio) return;
  var playBtn = document.querySelector('[data-promo-play]');
  var progressBar = document.querySelector('[data-promo-progress]');
  var progressTrack = document.querySelector('[data-promo-progress-track]');
  var elapsedEl = document.querySelector('[data-promo-elapsed]');
  var durationEl = document.querySelector('[data-promo-duration]');
  var statusEl = document.querySelector('[data-promo-status]');
  var eqBars = document.querySelectorAll('[data-promo-eq]');
  var vinyl = document.querySelector('[data-promo-vinyl]');
  var playing = false;
  var eqInterval = null;
  function fmt(s){var m=Math.floor(s/60);var sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}
  function startEQ(){if(eqInterval)clearInterval(eqInterval);eqInterval=setInterval(function(){eqBars.forEach(function(b){b.style.height=(3+Math.random()*18)+'px';});},80);}
  function stopEQ(){if(eqInterval)clearInterval(eqInterval);eqInterval=null;eqBars.forEach(function(b){b.style.height='4px';});}
  function startSpin(){if(vinyl)vinyl.style.animation='promoSpin 3s linear infinite';}
  function stopSpin(){if(vinyl)vinyl.style.animation='none';}
  audio.addEventListener('loadedmetadata',function(){if(durationEl)durationEl.textContent=fmt(audio.duration);});
  audio.addEventListener('timeupdate',function(){if(!audio.duration)return;var pct=(audio.currentTime/audio.duration)*100;if(progressBar)progressBar.style.width=pct+'%';if(elapsedEl)elapsedEl.textContent=fmt(audio.currentTime);});
  audio.addEventListener('ended',function(){playing=false;if(playBtn){playBtn.textContent='▶';playBtn.style.background='#009B9B';playBtn.style.boxShadow='0 0 20px rgba(0,155,155,0.4)';}if(statusEl)statusEl.textContent='Ready to play';stopEQ();stopSpin();});
  if(playBtn)playBtn.addEventListener('click',function(){
    if(playing){audio.pause();playing=false;playBtn.textContent='▶';playBtn.style.background='#009B9B';playBtn.style.boxShadow='0 0 20px rgba(0,155,155,0.4)';if(statusEl)statusEl.textContent='Ready to play';stopEQ();stopSpin();}
    else{audio.play();playing=true;playBtn.textContent='⏸';playBtn.style.background='#E8624A';playBtn.style.boxShadow='0 0 20px rgba(232,98,74,0.4)';if(statusEl)statusEl.textContent='● Now Playing';startEQ();startSpin();}
  });
  if(progressTrack)progressTrack.addEventListener('click',function(e){if(!audio.duration)return;var rect=progressTrack.getBoundingClientRect();audio.currentTime=(e.clientX-rect.left)/rect.width*audio.duration;});
})();
</script>
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: "text/html" });
      const link = document.createElement("a");
      link.download = `${data.slug || "promo"}-card.html`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      t("✅ HTML downloaded!");
    } catch {
      t("❌ Download failed");
    }
    setDownloading(false);
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const label = "font-montserrat font-bold text-[8px] tracking-[0.18em] uppercase mb-1";
  const inputStyle: React.CSSProperties = {
    background: "rgba(0,155,155,0.05)",
    border: "1px solid rgba(0,155,155,0.2)",
    padding: "8px 10px",
  };

  const genreTags = data.genres.split(",").map((g) => g.trim()).filter(Boolean);
  const tagStyles = [
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
    { bg: "rgba(232,98,74,0.1)", border: "rgba(232,98,74,0.25)", color: "#E8624A" },
    { bg: "rgba(212,168,48,0.1)", border: "rgba(212,168,48,0.25)", color: "#D4A830" },
    { bg: "rgba(0,155,155,0.1)", border: "rgba(0,155,155,0.25)", color: "#009B9B" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#080c0c" }}>
      {/* ══════════ SPINNING BG RECORD ══════════ */}
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
        <img
          src={voicesLogo}
          alt=""
          style={{
            width: "min(100vw,100vh)",
            height: "min(100vw,100vh)",
            borderRadius: "50%",
            opacity: 0.06,
            animation: isPlaying ? "promoSpin 20s linear infinite" : undefined,
          }}
        />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(8,12,12,0.6) 0%, rgba(8,12,12,0.85) 60%, rgba(8,12,12,0.97) 100%)" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "2rem", padding: "2rem 5vw", minHeight: "100vh" }}>
        {/* ══════════ LEFT: FORM ══════════ */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div style={{ background: "#131e1e", border: "1px solid rgba(0,155,155,0.3)", padding: "1.5rem", position: "sticky", top: "2rem" }}>
            <div className="font-montserrat font-bold text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "#009B9B" }}>⚙️ Promo Editor</div>

            <div className="flex flex-col gap-3">
              {[
                { l: "Artist Name", k: "artistName" as const, ph: "Tony Williams" },
                { l: "Track Title", k: "trackTitle" as const, ph: "Soon" },
                { l: "Track Subtitle", k: "trackSubtitle" as const, ph: "808 Session" },
                { l: "Genres (comma)", k: "genres" as const, ph: "Jazz, Gospel, 808 Soul" },
                { l: "Location", k: "location" as const, ph: "Houston, TX" },
                { l: "URL Slug", k: "slug" as const, ph: "tony-williams" },
              ].map((f) => (
                <div key={f.l}>
                  <label className={`block ${label}`} style={{ color: "#009B9B" }}>{f.l}</label>
                  <input type="text" value={data[f.k] as string} onChange={(e) => update(f.k, e.target.value)} placeholder={f.ph} className="w-full font-montserrat text-[11px] text-white outline-none" style={inputStyle} />
                </div>
              ))}

              {/* Image upload */}
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Artist Photo</label>
                <button onClick={() => imgInputRef.current?.click()} className="flex items-center gap-2 cursor-pointer w-full" style={{ background: "rgba(232,98,74,0.05)", border: `1px dashed ${imagePreview ? "#22c55e" : "rgba(232,98,74,0.25)"}`, padding: "0.6rem 0.75rem" }}>
                  {imagePreview ? <img src={imagePreview} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "50%" }} /> : <span className="text-[1rem]">🖼️</span>}
                  <span className="font-montserrat font-bold text-[9px] tracking-[0.12em] uppercase" style={{ color: imagePreview ? "#22c55e" : "#E8624A" }}>
                    {imagePreview ? "✓ Ready" : "Upload Photo"}
                  </span>
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>

              {/* Audio upload */}
              <div>
                <label className={`block ${label}`} style={{ color: "#009B9B" }}>Audio Track</label>
                <button onClick={() => audioInputRef.current?.click()} className="flex items-center gap-2 cursor-pointer w-full" style={{ background: "rgba(0,155,155,0.05)", border: `1px dashed ${audioSrc ? "#22c55e" : "rgba(0,155,155,0.25)"}`, padding: "0.6rem 0.75rem" }}>
                  <span className="text-[1rem]">🎵</span>
                  <span className="font-montserrat font-bold text-[9px] tracking-[0.12em] uppercase" style={{ color: audioSrc ? "#22c55e" : "#009B9B" }}>
                    {audioSrc ? "✓ Track Ready" : "Upload Track"}
                  </span>
                </button>
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudio} />
              </div>

              {/* Download */}
              <button
                onClick={downloadImage}
                disabled={downloading}
                className="font-montserrat font-bold text-[11px] tracking-[0.15em] uppercase cursor-pointer disabled:opacity-40 mt-2"
                style={{ background: "linear-gradient(135deg,#009B9B,#E8624A)", color: "#080c0c", border: "none", padding: "12px", width: "100%" }}
              >
                {downloading ? "⏳ Generating..." : "📥 Download Card"}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: LIVE CARD (exact replica) ══════════ */}
          {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div
            ref={cardRef}
            style={{ width: "100%", maxWidth: 680, fontFamily: "'Montserrat', sans-serif", color: "#e8f5f5", background: "#080c0c", padding: "2rem 0" }}
          >
            {/* STATION HEADER */}
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, padding: "4px 12px", marginBottom: "1rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8624A", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
                New Artist Announcement
              </div>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, background: "linear-gradient(135deg,#009B9B,#E8624A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block", lineHeight: 1.1, marginBottom: "0.25rem" }}>
                Voices & Vibes Radio
              </div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "#5a9090" }}>
                Houston, TX · Est. Jan 2026 · voicesandvibesradio.com
              </div>
            </div>

            {/* ANNOUNCEMENT CARD */}
            <div style={{ width: "100%", background: "rgba(19,30,30,0.92)", border: "1px solid rgba(0,155,155,0.25)", backdropFilter: "blur(10px)" }}>

              {/* CARD HEADER */}
              <div style={{ background: "linear-gradient(135deg,rgba(0,155,155,0.15),rgba(232,98,74,0.08))", borderBottom: "1px solid rgba(0,155,155,0.2)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, background: "#009B9B", color: "#080c0c", padding: "3px 10px", flexShrink: 0 }}>New Artist</div>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#5a9090" }}>Now joining the Voices & Vibes platform</div>
              </div>

              {/* ARTIST ROW */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div data-promo-vinyl="" style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#009B9B,#E8624A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(0,155,155,0.3)", overflow: "hidden", animation: isPlaying ? "promoSpin 3s linear infinite" : undefined }}>
                  <img src={voicesLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", fontWeight: 700, color: "#E8624A", lineHeight: 1, marginBottom: "0.2rem" }}>{data.artistName}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#009B9B", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: "0.3rem" }}>
                    Now Playing: "{data.trackTitle}" — {data.trackSubtitle}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                    {genreTags.map((g, i) => (
                      <span key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", background: tagStyles[i % tagStyles.length].bg, border: `1px solid ${tagStyles[i % tagStyles.length].border}`, color: tagStyles[i % tagStyles.length].color }}>
                        {g}
                      </span>
                    ))}
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 8px", background: "rgba(0,155,155,0.1)", border: "1px solid rgba(0,155,155,0.25)", color: "#009B9B" }}>
                      {data.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* ANNOUNCEMENT BODY */}
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#009B9B", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  On Air Announcement
                  <span style={{ flex: 1, height: 1, background: "rgba(0,155,155,0.15)" }} />
                </div>

                {/* FLOAT ARTIST IMAGE */}
                <div style={{ float: "right" as const, margin: "0 0 1rem 1.5rem", width: 220, border: "1px solid rgba(0,155,155,0.2)", background: "linear-gradient(180deg,rgba(0,155,155,0.08),rgba(8,12,12,0.6))", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ width: "100%", height: 4, background: "linear-gradient(to right,#009B9B,#E8624A,#009B9B)" }} />
                  <div style={{ width: 220, height: 220, background: "linear-gradient(135deg,#0d1a1a 0%,#1a1000 40%,#0a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" as const, overflow: "hidden", borderBottom: "1px solid rgba(0,155,155,0.15)" }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt={data.artistName} style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }} />
                    ) : (
                      <img src={voicesLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ padding: "0.6rem 0.75rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(0,155,155,0.15)" }}>
                    <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1rem", fontWeight: 700, color: "#E8624A", lineHeight: 1.1, marginBottom: 1 }}>{data.artistName}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#009B9B", letterSpacing: "0.1em", marginBottom: 5 }}>"{data.trackTitle}"</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#5a9090" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#009B9B", boxShadow: "0 0 5px #009B9B", animation: "promoBlink 1.2s infinite", display: "inline-block" }} />
                      Now on Platform
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
                  {DEFAULT_LINES.map((line, i) => {
                    if (line.type === "pause") return <div key={i} data-promo-line={i} data-line-type="pause" style={{ height: "0.5rem", border: "none" }} />;
                    const visible = visibleLines.has(i);
                    return (
                      <div
                        key={i}
                        data-promo-line={i}
                        data-line-type={line.type}
                        style={{
                          fontSize: line.type === "station-name" ? "1.1rem" : line.type === "url" ? 11 : 13,
                          lineHeight: 1.9,
                          color: line.type === "station-name" ? "#E8624A" : line.type === "url" ? "#009B9B" : "rgba(232,245,245,0.85)",
                          fontFamily: line.type === "station-name" ? "'Dancing Script', cursive" : line.type === "url" ? "'Share Tech Mono', monospace" : undefined,
                          letterSpacing: line.type === "url" ? "0.08em" : undefined,
                          padding: "4px 0",
                          borderBottom: line.type === "station-name" || line.type === "url" ? "none" : "1px solid rgba(0,155,155,0.05)",
                          opacity: visible ? 1 : 0,
                          transform: visible ? "translateY(0)" : "translateY(8px)",
                          transition: "opacity 0.5s ease, transform 0.5s ease",
                        }}
                      >
                        {line.type === "url" ? (
                          <a href="https://voicesandvibesradio.com" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{line.text}</a>
                        ) : line.text}
                      </div>
                    );
                  })}
                  <div style={{ clear: "both" as const }} />
                </div>
              </div>

              {/* PROGRESS */}
              {/* audio moved outside card */}
              <div style={{ padding: "0 1.5rem 0.5rem" }}>
                <div
                  data-promo-progress-track=""
                  style={{ height: 2, background: "rgba(0,155,155,0.1)", position: "relative" as const, overflow: "hidden", marginBottom: "0.35rem", cursor: "pointer" }}
                  onClick={(e) => {
                    if (!audioRef.current || !audioRef.current.duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = pct * audioRef.current.duration;
                  }}
                >
                  <div data-promo-progress="" style={{ height: "100%", background: "linear-gradient(to right,#009B9B,#E8624A)", width: `${progress}%`, transition: "width 0.2s linear" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#5a9090" }}>
                  <span data-promo-elapsed="">{currentTime}</span>
                  <span data-promo-duration="">{duration}</span>
                </div>
              </div>

              {/* CONTROLS */}
              <div style={{ padding: "1rem 1.5rem 1.25rem", borderTop: "1px solid rgba(0,155,155,0.12)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  data-promo-play=""
                  onClick={togglePlay}
                  style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: isPlaying ? "#E8624A" : "#009B9B",
                    border: "none", cursor: audioSrc ? "pointer" : "default",
                    fontSize: "1.1rem", color: "#080c0c",
                    boxShadow: isPlaying ? "0 0 20px rgba(232,98,74,0.4)" : "0 0 20px rgba(0,155,155,0.4)",
                    transition: "all 0.2s", flexShrink: 0,
                    opacity: audioSrc ? 1 : 0.4,
                  }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <div style={{ flex: 1 }}>
                  <div data-promo-status="" style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#5a9090", marginBottom: 2 }}>
                    {isPlaying ? "● Now Playing" : audioSrc ? "Ready to play" : "No audio loaded"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e8f5f5" }}>{data.trackTitle} — {data.artistName}</div>
                </div>
                {/* EQ Bars */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24, marginLeft: "0.5rem" }}>
                  {eqHeights.map((h, i) => (
                    <div data-promo-eq="" key={i} style={{ width: 3, borderRadius: 1, background: i % 2 === 0 ? "#009B9B" : "#E8624A", height: h, transition: "height 0.08s" }} />
                  ))}
                </div>
                {/* Volume */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#5a9090" }}>🔈</span>
                  <input
                    type="range"
                    min="0" max="1" step="0.05" defaultValue="0.8"
                    onChange={(e) => { if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value); }}
                    style={{ width: 80, height: 3, cursor: "pointer", accentColor: "#009B9B" }}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(0,155,155,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", flexWrap: "wrap" as const, gap: "0.5rem" }}>
                <a href="https://voicesandvibesradio.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#009B9B", letterSpacing: "0.08em", textDecoration: "none" }}>
                  voicesandvibesradio.com
                </a>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://voicesandvibesradio.com/artists/${data.slug}`).then(() => t("Link copied!"));
                    }}
                    className="cursor-pointer"
                    style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(0,155,155,0.12)", border: "1px solid rgba(0,155,155,0.3)", color: "#009B9B", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => window.open("https://hello.citrus3.com:2020/public/voicesandvibes", "_blank")}
                    className="cursor-pointer"
                    style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "rgba(232,98,74,0.12)", border: "1px solid rgba(232,98,74,0.3)", color: "#E8624A", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    🎙️ Listen Live
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes promoSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes promoBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.1 } }
      `}</style>
    </div>
  );
};

export default AdminPromo;
