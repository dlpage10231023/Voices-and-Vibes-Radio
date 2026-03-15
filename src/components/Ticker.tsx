const items = [
  "🎙️ Now Streaming 24/7",
  "Voices & Vibes Radio — Houston, TX",
  "Healing Conversations & Restorative Jazz",
  "🕊️ Gospel Sunday — Church Spotlights Worldwide",
  "Hosted by Doreatha Page",
  "voicesandvibes.fm",
];

const Ticker = () => {
  return (
    <div className="bg-primary text-primary-foreground py-3 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-ticker text-[12px] font-bold tracking-[0.15em] uppercase">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-12">{item}</span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
