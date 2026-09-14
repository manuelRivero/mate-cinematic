"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import { Model as MateModel } from "./MateModel";
import { mateScrollState } from "./MateScrollDirector";

const PARALLAX_MAX = 0.05;
const PARALLAX_DAMP = 3.5;
const MOBILE_BREAKPOINT_PX = 768;
const MOBILE_SCALE = 0.68;
const DESKTOP_SCALE = 1;
const MOBILE_CAMERA_Z = 3.75;
const DESKTOP_CAMERA_Z = 2.9;

/** DPR hard-cap: nunca 2×/3× en Retina móvil. */
const DPR_MOBILE: [number, number] = [1, 1];
const DPR_DESKTOP: [number, number] = [1, 1.5];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`,
    );
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function ProductLights({ isMobile }: { isMobile: boolean }) {
  // Mobile: menos luces = menos fragment shader passes / fill-rate
  if (isMobile) {
    return (
      <>
        <ambientLight intensity={0.42} />
        <directionalLight
          position={[2, 2.4, 3]}
          intensity={2.2}
          color="#ffffff"
        />
        <directionalLight
          position={[-2.5, 1.5, -2]}
          intensity={1.6}
          color="#dbeafe"
        />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 2, 3]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={3} color="#dbeafe" />
      <directionalLight
        position={[0, -2, 1.5]}
        intensity={1.2}
        color="#ffffff"
      />
    </>
  );
}

function ResponsiveCamera({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    const z = isMobile ? MOBILE_CAMERA_Z : DESKTOP_CAMERA_Z;
    camera.position.set(0, isMobile ? -0.28 : -0.35, z);
    camera.lookAt(0, 0.15, 0);
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

  return null;
}

function MateStage({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const parallax = useRef({ x: 0, y: 0 });

  const responsiveScale = useMemo(
    () => (isMobile ? MOBILE_SCALE : DESKTOP_SCALE),
    [isMobile],
  );

  const lateralFactor = isMobile ? 0.4 : 1;
  const parallaxMax = isMobile ? 0.02 : PARALLAX_MAX;

  useEffect(() => {
    if (isMobile) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isMobile]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { position, rotation } = mateScrollState;

    if (!isMobile) {
      parallax.current.x = THREE.MathUtils.damp(
        parallax.current.x,
        pointer.current.y * parallaxMax,
        PARALLAX_DAMP,
        delta,
      );
      parallax.current.y = THREE.MathUtils.damp(
        parallax.current.y,
        pointer.current.x * parallaxMax,
        PARALLAX_DAMP,
        delta,
      );
    } else {
      parallax.current.x = 0;
      parallax.current.y = 0;
    }

    group.position.set(position.x * lateralFactor, position.y, position.z);
    group.rotation.set(
      rotation.x + parallax.current.x,
      rotation.y + parallax.current.y,
      rotation.z,
    );
  });

  return (
    <group ref={groupRef} scale={responsiveScale}>
      <Center>
        <MateModel />
      </Center>
    </group>
  );
}

export default function Scene() {
  const isMobile = useIsMobile();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-screen w-full">
      <Canvas
        className="pointer-events-none h-full w-full"
        shadows={!isMobile}
        // Cap estricto de pixel ratio (mobile 1×, desktop ≤1.5×)
        dpr={isMobile ? DPR_MOBILE : DPR_DESKTOP}
        // Sin EffectComposer / multisampling — ya retirado (fill-rate móvil)
        gl={{
          antialias: !isMobile,
          alpha: false,
          depth: true,
          stencil: false,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{
          position: [0, -0.35, isMobile ? MOBILE_CAMERA_Z : DESKTOP_CAMERA_Z],
          fov: isMobile ? 34 : 32,
          near: 0.1,
          far: 100,
        }}
        style={{
          background: "#050505",
          pointerEvents: "none",
          touchAction: "pan-y",
        }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setClearColor("#050505");
          // Doble seguro: nunca superar el techo de DPR
          gl.setPixelRatio(
            Math.min(
              window.devicePixelRatio,
              isMobile ? DPR_MOBILE[1] : DPR_DESKTOP[1],
            ),
          );
          gl.domElement.style.pointerEvents = "none";
          gl.domElement.style.touchAction = "pan-y";
          camera.lookAt(0, 0.15, 0);
        }}
      >
        <color attach="background" args={["#050505"]} />

        <ResponsiveCamera isMobile={isMobile} />
        <ProductLights isMobile={isMobile} />

        {/* Environment liviano: menos resolución PMREM en mobile, sin blur */}
        <Environment
          preset="city"
          environmentIntensity={isMobile ? 0.28 : 0.4}
          resolution={isMobile ? 128 : 256}
        />

        <Suspense fallback={null}>
          <MateStage isMobile={isMobile} />
        </Suspense>
      </Canvas>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 35%, rgba(5,5,5,0.45) 72%, rgba(5,5,5,0.92) 100%)",
        }}
      />
    </div>
  );
}
