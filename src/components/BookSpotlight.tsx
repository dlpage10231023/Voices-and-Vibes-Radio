const books = [
  {
    emoji: "📚",
    title: "Kaleidoscope Kids Books",
    url: "https://kaleidoscopekidsbooks.com",
  },
];

const BookSpotlight = () => {
  return (
    <section id="books" className="py-[100px] px-[5vw] bg-card">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
          <span className="block w-5 h-0.5 bg-primary" />
          Youth Book Spotlight
        </div>
        <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
          Healing Stories for <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">Young Hearts</span>
        </h2>
        <p className="text-[15px] text-muted max-w-[600px] leading-[1.8]">
          Therapeutic children's books by Doreatha Page — available on Amazon and Barnes & Noble.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {books.map((book) => (
            <a
              key={book.title}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-primary/10 flex gap-6 p-6 no-underline hover:border-primary hover:-translate-y-[3px] transition-all group"
            >
              <div className="w-[85px] shrink-0 aspect-[2/3] bg-gradient-to-br from-primary/80 to-[#003333] flex items-center justify-center text-[2.2rem] relative overflow-hidden">
                {book.emoji}
                <div className="absolute inset-0" style={{
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)'
                }} />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">By Doreatha Page</div>
                  <div className="font-dancing text-[1.4rem] text-foreground mb-2 leading-[1.2]">{book.title}</div>
                  <div className="text-[11px] text-muted tracking-[0.05em] mb-4">Available on Amazon & Barnes & Noble</div>
                </div>
                <div className="inline-block bg-secondary text-secondary-foreground px-[18px] py-2 text-[11px] font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all w-fit">
                  Shop on Amazon ↗
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookSpotlight;
