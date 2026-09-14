"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { PRELOAD_EVENT, type PreloadDetail } from "../lib/preloadGate";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: false,
    });

    // Arranca bloqueado hasta que el Preloader dispare unlock
    lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onPreload = (event: Event) => {
      const { locked } = (event as CustomEvent<PreloadDetail>).detail;
      if (locked) {
        lenis.stop();
      } else {
        lenis.start();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    };

    window.addEventListener(PRELOAD_EVENT, onPreload);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener(PRELOAD_EVENT, onPreload);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
