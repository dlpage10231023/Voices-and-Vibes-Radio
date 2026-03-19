import ListenLiveButton from "./ListenLiveButton";

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-[5vw] pt-[200px] pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" style={{
        background: `
          radial-gradient(ellipse 90% 70% at 50% 50%, hsla(180, 100%, 30%, 0.18) 0%, transparent 65%),
          radial-gradient(ellipse 40% 40% at 80% 20%, hsla(12, 72%, 60%, 0.12) 0%, transparent 60%),
          hsl(0 0% 4%)
        `
      }} />

      <div className="absolute bottom-0 left-0 right-0 h-[180px] flex items-end justify-center gap-1 opacity-[0.12] pointer-events-none">
        {[40,70,100,55,85,120,60,90,45,75,110,50,80,95,65,105,40,70,100,55].map((h, i) => (
          <div
            key={i}
            className={`w-2 rounded-t animate-wave ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}
            style={{ height: `${h}px`, animationDelay: `${(i % 5) * 0.2}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[860px]">
        <div className="text-[10px] tracking-[0.4em] uppercase text-primary mb-4 flex items-center justify-center gap-4">
          <span className="block w-[30px] h-px bg-primary opacity-50" />
          Est. Jan 2026 · Houston, TX · Streaming 24/7
          <span className="block w-[30px] h-px bg-primary opacity-50" />
        </div>
        <div className="font-montserrat text-[clamp(1rem,2.5vw,1.4rem)] font-black tracking-[0.35em] uppercase text-foreground mb-2">
          Voices And
        </div>
        <span className="font-dancing text-[clamp(5rem,14vw,11rem)] font-bold leading-[0.9] text-secondary block mb-1">
          Vibes <span className="text-primary">Radio</span>
        </span>
        <div className="font-playfair text-[clamp(1rem,2vw,1.3rem)] italic text-foreground/90 mb-2 tracking-[0.04em]">
          Healing Conversations & Restorative Jazz
        </div>
        <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-10">
          Where Conversations Meet Jazz · Faith Meets Healing
        </div>
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <ListenLiveButton />
          <a href="#about" className="border-2 border-primary text-primary px-8 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase no-underline hover:bg-primary hover:text-primary-foreground transition-all">
            Learn More
          </a>
        </div>
        <div className="text-sm text-muted tracking-[0.08em]">
          Streaming worldwide at <strong className="text-foreground">voicesandvibesradio.com</strong>
        </div>
      </div>
    </section>
  );
};

export default Hero;
