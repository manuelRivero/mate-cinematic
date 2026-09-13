"use client";

const NAV_LINKS = [
  { href: "#reveal", label: "Origen" },
  { href: "#craft", label: "Anatomía" },
  { href: "#specs", label: "Especificaciones" },
] as const;

export default function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16 md:px-10 lg:px-14">
        <a
          href="#reveal"
          className="pointer-events-auto font-[family-name:var(--font-label)] text-xs font-medium tracking-[0.25em] text-white/90 uppercase transition-colors hover:text-white"
        >
          Imperial
        </a>

        <nav
          aria-label="Principal"
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-label)] text-[0.7rem] tracking-[0.22em] text-white/45 uppercase transition-colors hover:text-white/85"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#acquire"
          className="pointer-events-auto inline-flex items-center rounded-full border border-white/25 px-4 py-2 font-[family-name:var(--font-label)] text-[0.65rem] tracking-[0.18em] text-white/80 uppercase transition-all duration-300 hover:border-white/70 hover:bg-white/5 hover:text-white"
        >
          Reservar Pieza
        </a>
      </div>
    </header>
  );
}
