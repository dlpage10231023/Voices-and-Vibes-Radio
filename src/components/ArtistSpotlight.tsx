import { Music } from "lucide-react";
import { Link } from "react-router-dom";

const ArtistSpotlight = () => {
  return (
    <section id="artist-spotlight" className="py-[100px] px-[5vw] bg-background">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
          <span className="block w-5 h-0.5 bg-primary" />
          Artist Spotlight
        </div>
        <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
          Featured <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">Artist</span>
        </h2>
        <p className="text-[15px] text-muted max-w-[600px] leading-[1.8] mb-12">
          Healing music from voices in our community.{" "}
          New artist featured every week.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 items-center">
          {/* Left — Album Art */}
          <div
            className="w-full max-w-[320px] aspect-square relative overflow-hidden border border-primary/30 mx-auto md:mx-0"
            style={{ background: "linear-gradient(135deg, #007A7A, #0a1818)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="w-20 h-20 text-primary/40" strokeWidth={1} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-background/70 backdrop-blur-sm px-4 py-3">
              <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-primary font-bold">
                Now Featuring
              </span>
            </div>
          </div>

          {/* Right — Track Info */}
          <div className="flex flex-col gap-4">
            <span
              className="inline-flex items-center w-fit px-3 py-1 text-[10px] font-montserrat font-bold tracking-[0.18em] uppercase text-primary rounded-full"
              style={{
                background: "rgba(0,155,155,0.15)",
                border: "1px solid rgba(0,155,155,0.35)",
              }}
            >
              This Week
            </span>

            <h3 className="font-montserrat font-black text-[2rem] text-foreground leading-tight">
              Artist Name
            </h3>
            <p className="font-dancing font-bold text-[1.6rem] text-secondary leading-tight">
              Track Title
            </p>
            <p className="font-montserrat font-light text-[13px] text-muted">
              Album · Year
            </p>
            <p className="font-montserrat font-light text-[14px] text-muted leading-relaxed max-w-[480px] line-clamp-2">
              A healing journey through sound and rhythm.
            </p>

            <div className="flex gap-3 mt-2 flex-wrap">
              <Link
                to="/artist-player"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[12px] font-montserrat font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all no-underline"
              >
                ▶ Listen Now →
              </Link>
              <Link
                to="/artist-player"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-montserrat font-bold tracking-[0.1em] uppercase text-primary border border-primary hover:bg-primary/10 transition-all no-underline"
              >
                View All Artists
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtistSpotlight;
