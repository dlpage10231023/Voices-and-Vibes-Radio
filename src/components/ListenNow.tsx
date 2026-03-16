import AudioPlayer from "./AudioPlayer";

const ListenNow = () => {
  return (
    <section
      id="listen"
      className="py-20 px-[5vw] relative"
      style={{ background: "#0a0a0a" }}
    >
      <div
        className="max-w-[1200px] mx-auto grid items-center gap-[5vw]"
        style={{ gridTemplateColumns: "1fr 480px" }}
      >
        {/* Left — text */}
        <div>
          <div
            className="font-montserrat mb-4"
            style={{
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#009B9B",
              fontWeight: 700,
            }}
          >
            Listen Now
          </div>
          <h2 className="font-montserrat text-foreground text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-[1.1] mb-4">
            The Sound of{" "}
            <span className="font-dancing italic normal-case" style={{ color: "#E8624A" }}>
              Healing
            </span>
          </h2>
          <p
            className="font-montserrat leading-[1.8] max-w-[520px]"
            style={{ fontSize: "15px", color: "#8ab8b8", fontWeight: 300 }}
          >
            Experience the Voices &amp; Vibes sound — smooth jazz meets
            afrobeats groove, therapy-inspired and restorative. Choose your
            mood and let it play while you explore the site.
          </p>
        </div>

        {/* Right — player */}
        <AudioPlayer />
      </div>

      {/* Mobile stack */}
      <style>{`
        @media (max-width: 860px) {
          #listen .max-w-\\[1200px\\] {
            grid-template-columns: 1fr !important;
          }
          #listen .max-w-\\[480px\\] {
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ListenNow;
