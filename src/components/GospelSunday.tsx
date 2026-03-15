const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";
const CHURCH_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe9fzcW5cJRshz47P-W0ZLdNeH1kZzxCeN-HshbEuJghrgIYQ/viewform?usp=dialog";

const slots = [
  { time: "8–9 AM", title: "Morning Praise", desc: "Traditional gospel hymns and Sunday morning worship" },
  { time: "9–10 AM", title: "Contemporary Gospel", desc: "Modern gospel hits and worship anthems" },
  { time: "10 AM–12 PM", title: "Church Spotlight Hour", desc: "Featuring local churches with ministry highlights" },
  { time: "12–2 PM", title: "Sunday Soul", desc: "Gospel jazz fusion and peaceful Sunday rest" },
];

const GospelSunday = () => {
  return (
    <section id="gospel" className="py-[100px] px-[5vw] relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, hsl(0 0% 10%) 0%, hsl(180 33% 4%) 100%)'
    }}>
      {/* Radial glow */}
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse, hsla(180, 100%, 30%, 0.1), transparent 70%)'
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
          <span className="block w-5 h-0.5 bg-primary" />
          Every Sunday
        </div>
        <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
          Gospel <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">Sunday</span>
        </h2>
        <p className="text-[15px] text-muted max-w-[600px] leading-[1.8] mb-12">
          Rooted in Growth, Guided by Hope — where faith, healing, and community meet through gospel music and church spotlights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Schedule */}
          <div>
            <div className="flex flex-col gap-0.5">
              {slots.map((slot) => (
                <div key={slot.time} className="flex gap-6 items-start bg-primary/5 border-l-[3px] border-primary py-5 px-6">
                  <div className="text-[11px] font-bold text-primary tracking-[0.1em] min-w-[70px] pt-0.5">
                    {slot.time}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">{slot.title}</div>
                    <div className="text-[12px] text-muted">{slot.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a
                href={LISTEN_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground px-6 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase no-underline hover:brightness-110 transition-all inline-block"
              >
                🎧 Listen Now
              </a>
            </div>
          </div>

          {/* Church CTA */}
          <div className="bg-primary/[0.08] border border-primary/25 p-10 text-center">
            <div className="inline-block bg-secondary text-secondary-foreground text-[10px] tracking-[0.2em] uppercase px-3 py-1 font-bold mb-4">
              100% Free
            </div>
            <h3 className="font-montserrat text-[1.1rem] font-black uppercase tracking-[0.1em] text-foreground mb-2">
              Feature Your Church on Gospel Sunday
            </h3>
            <p className="text-[13px] text-muted mb-6">
              Free global publicity for your congregation. Share your mission, ministries, and upcoming events with our worldwide audience.
            </p>
            <a
              href={CHURCH_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase no-underline hover:brightness-110 transition-all inline-block"
            >
              ⛪ Submit Church Info
            </a>
            <p className="text-muted text-[11px] mt-4">No cost. No strings attached. Partnership is completely free.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GospelSunday;
