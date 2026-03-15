import doreathaImg from "@/assets/doreatha-page.png";

const About = () => {
  return (
    <section id="about" className="py-16 px-[5vw] bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[5vw] max-w-[1100px] mx-auto items-start">
        {/* Left */}
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
            <span className="block w-5 h-0.5 bg-primary" />
            About the Station
          </div>
          <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
            Healing on the <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">Airwaves</span>
          </h2>

          <div className="bg-primary text-primary-foreground px-6 py-4 text-[12px] font-bold tracking-[0.1em] uppercase mb-6 flex items-center gap-3">
            <span className="w-[7px] h-[7px] rounded-full bg-secondary animate-blink" />
            Streaming 24/7 Worldwide · voicesandvibesradio.com
          </div>

          <div className="bg-card border-l-[3px] border-primary p-6 mb-4">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">Monday – Saturday</h3>
            <p className="text-sm text-muted leading-[1.8]">Therapy-inspired conversations meet smooth jazz — creating a space for reflection, growth, and calm. Every day carries its own healing theme.</p>
          </div>

          <div className="bg-card border-l-[3px] border-primary p-6 mb-4">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">Gospel Sunday</h3>
            <p className="text-sm text-muted leading-[1.8]">Uplifting gospel music, church spotlights, and faith-based healing. Featuring churches from around the world sharing their missions, ministries, and messages of hope.</p>
          </div>

          <div className="grid grid-cols-3 gap-px mt-px">
            <div className="bg-card p-6 text-center">
              <div className="text-[2rem] font-black text-primary font-montserrat leading-none">24/7</div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-muted mt-1">Live Stream</div>
            </div>
            <div className="bg-card p-6 text-center">
              <div className="text-[2rem] font-black text-primary font-montserrat leading-none">7</div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-muted mt-1">Daily Themes</div>
            </div>
            <div className="bg-card p-6 text-center">
              <div className="text-[2rem] font-black text-primary font-montserrat leading-none">∞</div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-muted mt-1">Worldwide</div>
            </div>
          </div>
        </div>

        {/* Right - Host Card */}
        <div className="flex flex-col gap-6">
          {/* Photo & Name */}
          <div className="bg-card border border-primary/20 overflow-hidden">
            <div className="w-full aspect-[4/5] overflow-hidden">
              <img
                src={doreathaImg}
                alt="Doreatha L. Page — Host of Voices & Vibes Radio"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="p-6 text-center">
              <div className="font-dancing text-[1.8rem] text-foreground mb-1">Doreatha L. Page</div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-primary">Radio Host · LPC, NCC · Houston, TX</div>
              <a
                href="https://doreatha.carrd.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-[12px] text-secondary no-underline border-b border-secondary/30 pb-0.5 tracking-[0.05em]"
              >
                doreatha.carrd.co ↗
              </a>
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-card border border-primary/20 p-6">
            <h3 className="text-[11px] tracking-[0.25em] uppercase text-primary mb-3 font-bold">Our Story</h3>
            <p className="text-sm text-muted leading-[1.8] mb-4">
              Voices & Vibes was born from a simple belief: healing happens in community. In a world where so many feel isolated, overwhelmed, and unheard, we wanted to create a space where people could find connection, hope, and peace — no matter where they are or what they're going through.
            </p>
            <p className="text-sm text-muted leading-[1.8]">
              We started with a microphone, a vision, and a deep conviction that music and conversation have the power to transform lives. Today, Voices & Vibes streams 24/7 to listeners around the world.
            </p>
          </div>

          {/* Why We Do It */}
          <div className="bg-card border border-primary/20 p-6">
            <h3 className="text-[11px] tracking-[0.25em] uppercase text-primary mb-3 font-bold">Why We Do It</h3>
            <ul className="space-y-2">
              {[
                "Every voice deserves to be heard",
                "Healing is possible for everyone",
                "Faith and community are forces",
                "Music has the power to restore the soul",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted leading-[1.6]">
                  <span className="w-[6px] h-[6px] rounded-full bg-secondary mt-[7px] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
