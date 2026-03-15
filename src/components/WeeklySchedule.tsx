import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { scheduleData, getCurrentDaySlug } from "@/data/scheduleData";

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const WeeklySchedule = () => {
  const currentDay = getCurrentDaySlug();

  return (
    <section id="schedule" className="bg-background py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Weekly Healing Journey
          </h2>
          <p className="font-inter text-lg text-muted-foreground">
            Every day has a theme. Every theme has a purpose.
          </p>
          <div className="w-24 h-0.5 bg-primary mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((slug, i) => {
            const day = scheduleData[slug];
            const isCurrent = slug === currentDay;

            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/${slug}`}
                  className={`block rounded-lg bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 ${
                    isCurrent ? "border-2 border-primary ring-1 ring-primary/30" : "border border-card"
                  }`}
                >
                  {isCurrent && (
                    <span className="inline-block bg-primary text-primary-foreground text-xs font-inter font-semibold px-2 py-0.5 rounded mb-3">
                      TODAY
                    </span>
                  )}
                  <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">
                    {day.name}
                  </h3>
                  <p className="text-lg mb-2">
                    <span>{day.emoji}</span>{" "}
                    <span className="text-primary font-inter font-semibold">{day.theme}</span>
                  </p>
                  <p className="font-inter text-muted-foreground text-sm mb-4">
                    {day.description}
                  </p>
                  <span className="inline-block bg-primary text-primary-foreground font-inter font-semibold text-sm px-4 py-2 rounded transition-colors hover:bg-primary/90">
                    Explore {day.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeeklySchedule;
