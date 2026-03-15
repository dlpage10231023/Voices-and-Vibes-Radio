const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";

const Footer = () => {
  return (
    <footer className="bg-[#060606] border-t border-primary/15 py-12 px-[5vw] text-center">
      <span className="font-dancing text-[2rem] font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent block mb-2">
        Voices & Vibes Radio
      </span>
      <div className="text-[12px] tracking-[0.15em] uppercase text-muted mb-8">
        Where Conversations Meet Jazz · Faith Meets Healing
      </div>
      <div className="flex gap-8 justify-center flex-wrap mb-8">
        {[
          { label: "About", href: "#about" },
          { label: "Schedule", href: "#schedule" },
          { label: "Gospel Sunday", href: "#gospel" },
          { label: "Books", href: "#books" },
          { label: "Contact", href: "#contact" },
          { label: "Listen Live", href: LISTEN_LIVE_URL, external: true },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="text-[11px] tracking-[0.12em] uppercase text-muted no-underline hover:text-primary transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="text-[11px] text-muted/40 tracking-[0.05em]">
        © 2026 Voices and Vibes Radio · Houston, TX · All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
