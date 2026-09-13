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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function ProductLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 2, 3]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={3} color="#dbeafe" />
      <directionalLight position={[0, -2, 1.5]} intensity={1.2} color="#ffffff" />
    </>
  );
}

/** Ajusta distancia de cámara al cambiar entre mobile / desktop. */
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

  // En mobile atenuamos el desplazamiento lateral del scroll para no tapar copy
  const lateralFactor = isMobile ? 0.4 : 1;
  const parallaxMax = isMobile ? 0.025 : PARALLAX_MAX;

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      // Solo parallax con mouse fino; en touch no interferimos el gesto
      if (event.pointerType === "touch") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { position, rotation } = mateScrollState;

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

    group.position.set(
      position.x * lateralFactor,
      position.y,
      position.z,
    );
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
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: "high-performance",
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
          // El canvas nativo no debe capturar gestos de scroll
          gl.domElement.style.pointerEvents = "none";
          gl.domElement.style.touchAction = "pan-y";
          camera.lookAt(0, 0.15, 0);
        }}
      >
        <color attach="background" args={["#050505"]} />

        <ResponsiveCamera isMobile={isMobile} />
        <ProductLights />
        <Environment preset="city" environmentIntensity={0.4} />

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
