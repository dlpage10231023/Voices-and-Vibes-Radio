import { Link, useLocation } from "react-router-dom";

const LISTEN_LIVE_URL = "https://hello.citrus3.com:2020/public/voicesandvibes";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Schedule", href: "#schedule" },
    { label: "Gospel Sunday", href: "#gospel" },
    { label: "Books", href: "#books" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-[5vw] h-[66px] bg-background/95 border-b border-primary/25 backdrop-blur-[10px]">
      {isHome ? (
        <a href="#hero" className="font-dancing text-[1.6rem] font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent no-underline">
          Voices & Vibes
        </a>
      ) : (
        <Link to="/" className="font-dancing text-[1.6rem] font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent no-underline">
          Voices & Vibes
        </Link>
      )}

      <ul className="hidden md:flex gap-7 list-none">
        {isHome ? (
          navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[11px] tracking-[0.14em] uppercase text-muted font-medium no-underline hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))
        ) : (
          <li>
            <Link
              to="/#schedule"
              className="text-[11px] tracking-[0.14em] uppercase text-muted font-medium no-underline hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </li>
        )}
      </ul>

      <a
        href={LISTEN_LIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-primary text-primary-foreground px-[18px] py-2 text-[11px] font-bold tracking-[0.1em] uppercase no-underline hover:brightness-110 transition-all"
      >
        <span className="w-[7px] h-[7px] rounded-full bg-secondary animate-blink" />
        Live
      </a>
    </nav>
  );
};

export default Navbar;
