"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTION_IDS = ["reveal", "craft", "specs", "ritual", "acquire"] as const;

const ANATOMY = [
  {
    index: "01",
    title: "Alpaca Cincelada",
    body: "Guarda pampa tallada a mano en metal noble, pulida a espejo.",
  },
  {
    index: "02",
    title: "Cuero Vacuno",
    body: "Textura de grano profundo, curtido natural libre de químicos agresivos.",
  },
  {
    index: "03",
    title: "Base Tetrapodal",
    body: "Cuatro esferas de bronce macizo que aíslan la temperatura de la superficie.",
  },
] as const;

const SPECS = [
  { value: "420g", label: "Peso en mano equilibrado" },
  { value: "11.5 cm", label: "Altura promedio" },
  { value: "45 g", label: "Capacidad de yerba sugerida" },
  { value: "Alpaca & Bronce", label: "Metales nobles" },
] as const;

const TRUST = [
  "Envío asegurado",
  "Curado artesanal incluido",
  "Garantía perpetua en virola",
] as const;

export default function SectionNarrative() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      SECTION_IDS.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        const parts = section.querySelectorAll<HTMLElement>(".reveal-item");
        if (!parts.length) return;

        gsap.set(parts, { opacity: 0, y: 40 });

        gsap.to(parts, {
          opacity: 1,
          y: 0,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 40%",
            scrub: 1,
          },
        });

        // La CTA final permanece visible
        if (id === "acquire") return;

        gsap.to(parts, {
          opacity: 0,
          y: -40,
          ease: "none",
          stagger: 0.03,
          scrollTrigger: {
            trigger: section,
            start: "bottom 62%",
            end: "bottom 22%",
            scrub: 1,
          },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <div className="pointer-events-none relative z-10">
      {/* —— HERO / ORIGEN —— */}
      <section
        id="reveal"
        aria-label="Origen"
        className="relative flex min-h-screen flex-col justify-end px-6 pb-24 pt-28 md:px-12 lg:px-20"
      >
        <div className="section-copy max-w-3xl">
          <p className="reveal-item mb-5 font-[family-name:var(--font-label)] text-[0.65rem] font-medium tracking-[0.38em] text-white/40 uppercase">
            Pieza de Autor — Edición No. 04
          </p>
          <h1 className="reveal-item font-serif text-6xl leading-[0.92] tracking-tight text-white md:text-8xl">
            Mate Imperial
          </h1>
          <p className="reveal-item mt-6 max-w-md font-[family-name:var(--font-label)] text-sm leading-relaxed tracking-[0.03em] text-white/45 md:text-base">
            Negro absoluto. Cuero cincelado. Una pieza de ritual forjada para
            quienes entienden la pausa como privilegio.
          </p>
        </div>

        <div
          aria-hidden
          className="reveal-item absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="font-[family-name:var(--font-label)] text-[0.58rem] tracking-[0.35em] text-white/30 uppercase">
            Scroll
          </span>
          <span className="scroll-line h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* —— ANATOMÍA / CRAFT —— */}
      <section
        id="craft"
        aria-label="Anatomía"
        className="flex min-h-screen items-center px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="section-copy w-full max-w-md md:max-w-lg">
          <p className="reveal-item mb-4 font-[family-name:var(--font-label)] text-[0.65rem] font-medium tracking-[0.38em] text-white/35 uppercase">
            02 — Anatomía
          </p>
          <h2 className="reveal-item font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-tight text-white/95">
            The Craft
          </h2>
          <p className="reveal-item mt-4 max-w-sm font-[family-name:var(--font-label)] text-sm leading-relaxed text-white/40">
            Tres materias. Una sola pieza. El detalle define el carácter.
          </p>

          <ul className="mt-12 space-y-9">
            {ANATOMY.map((item) => (
              <li key={item.index} className="reveal-item">
                <p className="font-[family-name:var(--font-mono)] text-[0.7rem] tracking-[0.2em] text-white/30">
                  {item.index} /
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-label)] text-sm tracking-[0.12em] text-white/85 uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-sm font-[family-name:var(--font-label)] text-sm leading-relaxed text-white/40">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* —— ESPECIFICACIONES —— */}
      <section
        id="specs"
        aria-label="Especificaciones"
        className="flex min-h-screen items-center px-6 py-28 md:px-12 lg:px-20"
      >
        <div className="section-copy w-full max-w-5xl">
          <p className="reveal-item mb-4 font-[family-name:var(--font-label)] text-[0.65rem] font-medium tracking-[0.38em] text-white/35 uppercase">
            03 — Data Sheet
          </p>
          <h2 className="reveal-item font-serif text-[clamp(2.25rem,4vw,3.5rem)] tracking-tight text-white/95">
            Especificaciones
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {SPECS.map((spec) => (
              <article
                key={spec.value}
                className="reveal-item bg-[#050505] px-6 py-10 md:px-8 md:py-12"
              >
                <p className="font-[family-name:var(--font-mono)] text-[clamp(1.75rem,4vw,2.75rem)] tracking-tight text-white">
                  {spec.value}
                </p>
                <p className="mt-3 font-[family-name:var(--font-label)] text-[0.7rem] tracking-[0.18em] text-white/35 uppercase">
                  {spec.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* —— RITUAL —— */}
      <section
        id="ritual"
        aria-label="The Ritual"
        className="flex min-h-screen items-center justify-center px-6 py-28 md:px-12 lg:px-20"
      >
        <div className="section-copy max-w-2xl text-center">
          <p className="reveal-item mb-8 font-[family-name:var(--font-label)] text-[0.65rem] font-medium tracking-[0.38em] text-white/35 uppercase">
            04 — The Ritual
          </p>
          <blockquote className="reveal-item font-serif text-[clamp(1.65rem,4.2vw,3rem)] leading-[1.25] tracking-tight text-white/90">
            “El mate no se apura. Cada cebada es una pausa que desafía la
            inercia del día.”
          </blockquote>
        </div>
      </section>

      {/* —— ACQUIRE / CTA —— */}
      <section
        id="acquire"
        aria-label="Reservar"
        className="flex min-h-screen items-center justify-center px-6 py-28 md:px-12 lg:px-20"
      >
        <div className="section-copy w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center md:p-12">
          <p className="reveal-item font-[family-name:var(--font-label)] text-[0.65rem] tracking-[0.35em] text-white/35 uppercase">
            Edición Limitada
          </p>
          <h2 className="reveal-item mt-4 font-serif text-3xl tracking-tight text-white md:text-4xl">
            Adquirir la pieza
          </h2>
          <p className="reveal-item mt-6 font-[family-name:var(--font-mono)] text-2xl tracking-tight text-white md:text-3xl">
            $120.000 ARS
          </p>
          <p className="reveal-item mt-1 font-[family-name:var(--font-label)] text-sm text-white/35">
            o $140 USD
          </p>

          <a
            href="#acquire"
            className="reveal-item pointer-events-auto mt-10 inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 font-[family-name:var(--font-label)] text-[0.7rem] font-medium tracking-[0.22em] text-black uppercase transition-opacity hover:opacity-90 md:w-auto"
          >
            Reservar ahora
          </a>

          <ul className="reveal-item mt-10 space-y-3 border-t border-white/10 pt-8">
            {TRUST.map((item) => (
              <li
                key={item}
                className="font-[family-name:var(--font-label)] text-[0.7rem] tracking-[0.14em] text-white/40 uppercase"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
