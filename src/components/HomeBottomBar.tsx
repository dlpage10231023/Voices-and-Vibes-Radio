import { Link } from "react-router-dom";

const links = [
  { label: "🎙️ New Artist", to: "/new-artist" },
  { label: "🎵 Artist Player", to: "/artist-player" },
  { label: "🏠 Studios", to: "/studios" },
];

const HomeBottomBar = () => (
  <div className="fixed bottom-0 left-0 right-0 z-[300] bg-primary flex items-center justify-center gap-6 px-[5vw] h-[58px] border-t border-primary-foreground/10">
    {links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className="text-[11px] font-bold tracking-[0.12em] uppercase text-primary-foreground no-underline hover:text-secondary transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </div>
);

export default HomeBottomBar;
