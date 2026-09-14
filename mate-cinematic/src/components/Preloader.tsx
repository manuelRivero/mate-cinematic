"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { dispatchPreloadLock } from "../lib/preloadGate";

const MODEL_URL = "/models/mate-trabajado-transformed.glb";

function formatProgress(value: number): string {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return `${clamped.toString().padStart(2, "0")}%`;
}

export default function Preloader() {
  const { progress, active, loaded } = useProgress();
  const rootRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(true);
  const exitingRef = useRef(false);

  useEffect(() => {
    useGLTF.preload(MODEL_URL);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("is-preloading");
    document.body.style.overflow = "hidden";
    dispatchPreloadLock(true);

    return () => {
      document.documentElement.classList.remove("is-preloading");
      document.body.style.overflow = "";
      dispatchPreloadLock(false);
    };
  }, []);

  useEffect(() => {
    if (!barRef.current || exitingRef.current) return;
    gsap.to(barRef.current, {
      scaleX: Math.min(1, progress / 100),
      duration: 0.35,
      ease: "power2.out",
      transformOrigin: "left center",
    });
  }, [progress]);

  useEffect(() => {
    const ready = !active && progress >= 100 && loaded > 0;
    if (!ready || exitingRef.current) return;

    exitingRef.current = true;

    document.documentElement.classList.remove("is-preloading");
    document.body.style.overflow = "";
    dispatchPreloadLock(false);

    const content = [
      brandRef.current,
      counterRef.current,
      barRef.current?.parentElement ?? null,
      footRef.current,
    ].filter(Boolean);

    const tl = gsap.timeline({
      delay: 0.28,
      defaults: { ease: "power3.out" },
      onComplete: () => {
        setMounted(false);
      },
    });

    tl.to(content, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.06,
    });

    tl.to(
      rootRef.current,
      {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
      },
      "-=0.25",
    );

    return () => {
      tl.kill();
    };
  }, [active, progress, loaded]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#050505] p-8 md:p-16"
      aria-busy={active}
      aria-live="polite"
      role="status"
    >
      <p
        ref={brandRef}
        className="font-[family-name:var(--font-label)] text-xs tracking-[0.3em] text-white/40 uppercase"
      >
        Imperial — Edición Artesanal
      </p>

      <div className="flex flex-col items-start gap-8 md:items-center">
        <p
          ref={counterRef}
          className="font-[family-name:var(--font-mono)] text-5xl font-light tabular-nums tracking-tight text-white/90 md:text-7xl"
        >
          {formatProgress(progress)}
        </p>

        <div className="h-px w-48 overflow-hidden bg-white/10 md:w-64">
          <div
            ref={barRef}
            className="h-full w-full origin-left scale-x-0 bg-white"
          />
        </div>
      </div>

      <p
        ref={footRef}
        className="font-[family-name:var(--font-label)] text-[0.65rem] tracking-[0.35em] text-white/30 uppercase"
      >
        Cargando experiencia 3D
      </p>
    </div>
  );
}
