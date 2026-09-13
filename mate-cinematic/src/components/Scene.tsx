"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import { Model as MateModel } from "./MateModel";
import { mateScrollState } from "./MateScrollDirector";

const PARALLAX_MAX = 0.05;
const PARALLAX_DAMP = 3.5;

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

function MateStage() {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const parallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
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
      pointer.current.y * PARALLAX_MAX,
      PARALLAX_DAMP,
      delta,
    );
    parallax.current.y = THREE.MathUtils.damp(
      parallax.current.y,
      pointer.current.x * PARALLAX_MAX,
      PARALLAX_DAMP,
      delta,
    );

    group.position.set(position.x, position.y, position.z);
    group.rotation.set(
      rotation.x + parallax.current.x,
      rotation.y + parallax.current.y,
      rotation.z,
    );
  });

  return (
    <group ref={groupRef}>
      <Center>
        <MateModel />
      </Center>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-screen w-full">
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, -0.35, 2.9],
          fov: 32,
          near: 0.1,
          far: 100,
        }}
        style={{ background: "#050505" }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setClearColor("#050505");
          camera.lookAt(0, 0.15, 0);
        }}
      >
        <color attach="background" args={["#050505"]} />

        <ProductLights />
        <Environment preset="city" environmentIntensity={0.4} />

        <Suspense fallback={null}>
          <MateStage />
        </Suspense>
      </Canvas>

      {/* Viñeta cinematográfica en CSS — evita EffectMaterial / postprocessing */}
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
