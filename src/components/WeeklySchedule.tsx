import { Link } from "react-router-dom";
import { scheduleData, getCurrentDaySlug } from "@/data/scheduleData";

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const coralAccentDays = ["sunday", "friday"];

const WeeklySchedule = () => {
  const currentDay = getCurrentDaySlug();

  return (
    <section id="schedule" className="py-[100px] px-[5vw] bg-background">
      <div className="max-w-[1100px] mx-auto mb-12">
        <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
          <span className="block w-5 h-0.5 bg-primary" />
          Weekly Programming
        </div>
        <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
          Your Healing <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">Journey</span>
        </h2>
        <p className="text-[15px] text-muted max-w-[600px] leading-[1.8]">
          Every day has a theme. Every theme has a purpose. Click any day to explore the full schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-0.5 max-w-[1100px] mx-auto">
        {days.map((slug) => {
          const day = scheduleData[slug];
          const isCurrent = slug === currentDay;
          const isCoral = coralAccentDays.includes(slug);

          return (
            <Link
              key={slug}
              to={`/${slug}`}
              className={`block bg-card p-8 no-underline border-t-[3px] border-t-transparent transition-all duration-200 relative overflow-hidden group hover:bg-[#1e1e1e] hover:-translate-y-[3px] ${
                isCoral ? 'hover:border-t-secondary' : 'hover:border-t-primary'
              }`}
            >
              {/* Today badge */}
              {isCurrent && (
                <div className="absolute top-6 right-6 bg-secondary text-secondary-foreground text-[9px] tracking-[0.15em] uppercase px-2 py-[3px] font-bold">
                  Today
                </div>
              )}

              {/* Arrow on hover */}
              <span className={`absolute top-6 right-6 text-[1.2rem] opacity-0 group-hover:opacity-100 group-hover:translate-x-[3px] transition-all ${
                isCoral ? 'text-secondary' : 'text-primary'
              } ${isCurrent ? 'hidden' : ''}`}>→</span>

              <div className={`inline-block text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 mb-4 font-bold border ${
                isCoral
                  ? 'bg-secondary/15 border-secondary/30 text-secondary'
                  : 'bg-primary/15 border-primary/30 text-primary'
              }`}>
                {day.name}
              </div>

              <div className="font-dancing text-[2rem] font-bold text-foreground mb-1 leading-[1.1]">
                {day.theme}
              </div>

              <div className={`text-[11px] tracking-[0.12em] uppercase font-semibold mb-3 ${
                isCoral ? 'text-secondary' : 'text-primary'
              }`}>
                {day.emoji} {day.theme.split(' ').slice(0, -1).join(' ') || day.theme}
              </div>

              <div className="text-[13px] text-muted leading-[1.7]">
                {day.description}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default WeeklySchedule;
