import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { scheduleData, isValidDay } from "@/data/scheduleData";

const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";
const SHARE_STORY_URL = "YOUR_GOOGLE_FORM_URL";

const DayPage = () => {
  const { day } = useParams<{ day: string }>();

  if (!day || !isValidDay(day)) {
    return <Navigate to="/404" replace />;
  }

  const data = scheduleData[day];

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-primary/20">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link
            to="/#schedule"
            className="font-inter text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
          <span className="font-playfair text-lg font-bold text-foreground">
            Voices & Vibes Radio
          </span>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 text-center"
      >
        <div className="container mx-auto max-w-3xl">
          <p className="text-5xl mb-4">{data.emoji}</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            {data.heroTitle}
          </h1>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            {data.tagline}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={LISTEN_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-primary-foreground font-inter font-semibold px-6 py-3 rounded transition-colors hover:bg-primary/90"
            >
              🎵 Listen Live
            </a>
            <a
              href={SHARE_STORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-primary text-primary font-inter font-semibold px-6 py-3 rounded transition-colors hover:bg-primary/10"
            >
              Share Your Story
            </a>
            {data.extraCTA && (
              <a
                href={data.extraCTA.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary/20 text-primary font-inter font-semibold px-6 py-3 rounded border border-primary transition-colors hover:bg-primary/30"
              >
                {data.extraCTA.label}
              </a>
            )}
          </div>
        </div>
      </motion.section>

      {/* Time Blocks */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-playfair text-3xl font-bold text-foreground text-center mb-10">
            Today's Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.timeBlocks.map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-lg p-6 border border-primary/10"
              >
                <p className="font-inter text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {block.label}
                </p>
                <p className="font-inter text-sm text-muted-foreground mb-2">
                  {block.time}
                </p>
                <p className="font-inter text-foreground">
                  {block.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-8 border-l-4 border-primary"
          >
            <p className="font-inter text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              Today's Focus
            </p>
            <p className="font-playfair text-2xl md:text-3xl font-bold text-foreground italic">
              "{data.todaysFocus}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      {data.resources.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-playfair text-3xl font-bold text-foreground text-center mb-10">
              Resources & Support
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.resources.map((resource) => (
                <div
                  key={resource.name}
                  className="bg-card rounded-lg p-5 border border-primary/10"
                >
                  <p className="font-inter font-semibold text-foreground mb-1">
                    {resource.name}
                  </p>
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter text-sm text-primary hover:underline"
                    >
                      {resource.contact}
                    </a>
                  ) : (
                    <p className="font-inter text-sm text-muted-foreground">
                      {resource.contact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-primary/20">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="font-playfair text-lg font-bold text-foreground mb-1">
            Voices & Vibes Radio
          </p>
          <p className="font-inter text-sm text-muted-foreground">
            © {new Date().getFullYear()} Voices & Vibes Radio. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Sticky Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <p className="font-inter text-sm font-semibold text-primary-foreground">
            🎙️ Voices & Vibes Radio — LIVE
          </p>
          <a
            href={LISTEN_LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-sm font-bold bg-primary-foreground text-primary px-4 py-1.5 rounded hover:bg-primary-foreground/90 transition-colors"
          >
            Listen Live
          </a>
        </div>
      </div>
    </div>
  );
};

export default DayPage;
