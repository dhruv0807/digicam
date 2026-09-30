type NavbarProps = {
  onJump: (id: string) => void;
};

const LINKS = [
  { label: "Cameras", target: "sony" },
  { label: "Archive", target: "flash-era" },
  { label: "Photos", target: "photos" },
  { label: "About", target: "final" },
];

export function Navbar({ onJump }: NavbarProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 md:px-10">
      <button
        onClick={() => onJump("hero")}
        className="pointer-events-auto font-tech text-world text-[0.7rem] tracking-[0.42em] uppercase"
      >
        Digicam
      </button>

      <nav className="pointer-events-auto hidden gap-8 md:flex" aria-label="Sections">
        {LINKS.map((l) => (
          <button
            key={l.label}
            onClick={() => onJump(l.target)}
            className="font-tech text-world-dim hover:text-world text-[0.65rem] tracking-[0.3em] uppercase transition-colors"
          >
            {l.label}
          </button>
        ))}
      </nav>

      <button
        onClick={() => onJump("sony")}
        className="panel-world pointer-events-auto font-tech text-world rounded-full px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase transition-transform hover:scale-105"
      >
        [ Explore ]
      </button>
    </header>
  );
}
