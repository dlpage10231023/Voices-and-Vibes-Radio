import { Link } from "react-router-dom";

const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";

type FooterLink = { label: string; href: string; external?: boolean };

const links: FooterLink[] = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Gospel Sunday", href: "#gospel" },
  { label: "Books", href: "#books" },
  { label: "Contact", href: "#contact" },
  { label: "New Artist", href: "/new-artist" },
  { label: "Artist Player", href: "/artist-player" },
  { label: "Studios", href: "/studios" },
  { label: "Listen Live", href: LISTEN_LIVE_URL, external: true },
];

const linkClass = "text-[11px] tracking-[0.12em] uppercase text-muted no-underline hover:text-primary transition-colors";

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
        {links.map((link) =>
          link.external ? (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {link.label}
            </a>
          ) : link.href.startsWith("#") ? (
            <a key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ) : (
            <Link key={link.label} to={link.href} className={linkClass}>
              {link.label}
            </Link>
          )
        )}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="text-[11px] text-muted/40 tracking-[0.05em]">
          © 2026 Voices and Vibes Radio · Houston, TX · All rights reserved
        </div>
        <Link to="/admin/spotlight" className="text-[8px] no-underline" style={{ color: "rgba(138,184,184,0.3)" }}>Admin</Link>
      </div>
    </footer>
  );
};

export default Footer;
