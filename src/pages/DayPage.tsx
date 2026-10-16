import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { scheduleData, isValidDay } from "@/data/scheduleData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import ListenLiveButton from "@/components/ListenLiveButton";
import BackgroundAudio from "@/components/BackgroundAudio";
import GospelSundayStudio from "@/components/GospelSundayStudio";

const SHARE_STORY_URL = "YOUR_GOOGLE_FORM_URL";

const DayPage = () => {
  const { day } = useParams<{ day: string }>();

  if (!day || !isValidDay(day)) {
    return <Navigate to="/404" replace />;
  }

  const data = scheduleData[day];

  return (
    <div className="min-h-screen bg-background text-foreground pb-[76px] overflow-x-hidden">
      <Navbar />
      <BackgroundAudio daySlug={day} />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-[120px] pb-20 px-[5vw] text-center"
      >
        <div className="max-w-[860px] mx-auto">
          <p className="text-5xl mb-4">{data.emoji}</p>
          <h1 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-4 tracking-tight uppercase">
            {data.heroTitle}
          </h1>
          <p className="text-[15px] text-muted mb-8 leading-[1.8]">
            {data.tagline}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ListenLiveButton />
            <a
              href={SHARE_STORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-primary text-primary px-8 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase no-underline hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Share Your Story
            </a>
            {data.extraCTA && (
              <a
                href={data.extraCTA.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-secondary-foreground px-8 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase no-underline hover:brightness-110 transition-all"
              >
                {data.extraCTA.label}
              </a>
            )}
          </div>
        </div>
      </motion.section>

      {/* Time Blocks */}
      <section className="py-[80px] px-[5vw]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-montserrat text-[clamp(1.5rem,3vw,2rem)] font-black text-foreground text-center mb-10 tracking-tight uppercase">
            Today's Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
            {data.timeBlocks.map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border-l-[3px] border-primary p-6"
              >
                <p className="text-[11px] font-bold text-primary tracking-[0.15em] uppercase mb-1">
                  {block.label}
                </p>
                <p className="text-[12px] text-muted mb-2">
                  {block.time}
                </p>
                <p className="text-sm text-foreground leading-[1.7]">
                  {block.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section className="py-12 px-[5vw]">
        <div className="max-w-[860px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-primary/[0.08] border border-primary/25 border-l-[3px] border-l-primary p-8"
          >
            <p className="text-[10px] font-bold text-primary tracking-[0.35em] uppercase mb-2">
              Today's Focus
            </p>
            <p className="font-playfair text-[clamp(1.3rem,3vw,2rem)] font-normal text-foreground italic">
              "{data.todaysFocus}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      {data.resources.length > 0 && (
        <section className="py-[80px] px-[5vw]">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-montserrat text-[clamp(1.5rem,3vw,2rem)] font-black text-foreground text-center mb-10 tracking-tight uppercase">
              Resources & Support
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
              {data.resources.map((resource) => (
                <div
                  key={resource.name}
                  className="bg-card p-6 border-l-[3px] border-primary"
                >
                  <p className="font-montserrat font-semibold text-foreground mb-1 text-sm">
                    {resource.name}
                  </p>
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-primary no-underline hover:underline tracking-[0.05em]"
                    >
                      {resource.contact}
                    </a>
                  ) : (
                    <p className="text-[12px] text-muted tracking-[0.05em]">
                      {resource.contact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {day === "sunday" && <GospelSundayStudio />}

      <Footer />
      <StickyPlayer />
    </div>
  );
};

export default DayPage;
