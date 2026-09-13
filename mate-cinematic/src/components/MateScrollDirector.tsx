"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Estado mutable leído por R3F en useFrame — GSAP lo anima con scrub. */
export const mateScrollState = {
  position: { x: 0, y: 0.2, z: 0 },
  rotation: { x: 0.08, y: -0.4, z: 0 },
};

/**
 * Coreografía del mate a lo largo de reveal → craft → specs → ritual → acquire.
 */
export default function MateScrollDirector() {
  useLayoutEffect(() => {
    const reveal = document.getElementById("reveal");
    const acquire = document.getElementById("acquire");
    if (!reveal || !acquire) return;

    gsap.set(mateScrollState.rotation, { x: 0.08, y: -0.4, z: 0 });
    gsap.set(mateScrollState.position, { x: 0, y: 0.2, z: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: reveal,
          start: "top top",
          endTrigger: acquire,
          end: "center center",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      // Reveal → Craft (mate a la derecha; copy a la izquierda)
      tl.to(mateScrollState.rotation, { x: 0, y: 1.4, z: 0, duration: 1 }, 0).to(
        mateScrollState.position,
        { x: 0.6, y: 0.1, z: 0.4, duration: 1 },
        0,
      );

      // Craft → Specs
      tl.to(mateScrollState.rotation, {
        x: 0.05,
        y: 2.05,
        z: 0.02,
        duration: 1,
      }).to(
        mateScrollState.position,
        { x: 0.35, y: 0.05, z: 0.25, duration: 1 },
        "<",
      );

      // Specs → Ritual
      tl.to(mateScrollState.rotation, {
        x: -0.1,
        y: 2.8,
        z: 0.05,
        duration: 1,
      }).to(
        mateScrollState.position,
        { x: 0, y: -0.1, z: 0.2, duration: 1 },
        "<",
      );

      // Ritual → Acquire
      tl.to(mateScrollState.rotation, {
        x: -0.04,
        y: 3.15,
        z: 0,
        duration: 1,
      }).to(
        mateScrollState.position,
        { x: 0, y: -0.18, z: 0.05, duration: 1 },
        "<",
      );
    });

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
