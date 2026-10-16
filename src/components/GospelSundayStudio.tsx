import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gospelVideo from "@/assets/gospel-sunday-video.mp4.asset.json";

const GospelSundayStudio = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-[80px] px-[5vw]">
      <div className="max-w-[1100px] mx-auto">
        {/* Video */}
        <div className="mb-12">
          <h2 className="font-montserrat text-[clamp(1.5rem,3vw,2rem)] font-black text-foreground text-center mb-8 tracking-tight uppercase">
            Watch & Worship
          </h2>
          <div className="bg-card border border-primary/25 p-2">
            <video
              src={gospelVideo.url}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          </div>
        </div>

        {/* Collapsible prompt generator */}
        <div className="bg-card border border-primary/25">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full flex items-center justify-between gap-4 p-6 text-left bg-transparent border-none cursor-pointer"
          >
            <div>
              <p className="text-[10px] font-bold text-primary tracking-[0.35em] uppercase mb-1">
                Create
              </p>
              <p className="font-montserrat text-lg font-black text-foreground uppercase tracking-tight">
                Radiant Joy — Cover & Asset Studio
              </p>
              <p className="text-[12px] text-muted mt-1">
                Open the studio to generate your own gospel cover art and assets.
              </p>
            </div>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="text-primary shrink-0"
            >
              <ChevronDown size={22} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="studio"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-primary/25">
                  <iframe
                    src="/radiant-joy-studio.html"
                    title="Radiant Joy — Cover & Asset Studio"
                    className="w-full border-0"
                    style={{ height: "85vh", minHeight: 600 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default GospelSundayStudio;
