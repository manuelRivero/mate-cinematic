"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import gsap from "gsap";
import { Model as MateModel } from "./MateModel";
import { mateScrollState } from "./MateScrollDirector";
import {
  useInspectionPart,
  type InspectionPart,
} from "../lib/inspectionStore";

const PARALLAX_MAX = 0.05;
const PARALLAX_DAMP = 3.5;
const MOBILE_BREAKPOINT_PX = 768;
const MOBILE_SCALE = 0.68;
const DESKTOP_SCALE = 1;
const MOBILE_CAMERA_Z = 3.75;
const DESKTOP_CAMERA_Z = 2.9;

const DPR_MOBILE: [number, number] = [1, 1];
const DPR_DESKTOP: [number, number] = [1, 1.5];

type Pose = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

const INSPECTION_POSES_DESKTOP: Record<Exclude<InspectionPart, null>, Pose> = {
  virola: {
    position: { x: 0.5, y: -0.4, z: 0.8 },
    rotation: { x: 0.1, y: 1.35, z: 0 },
  },
  cuero: {
    position: { x: 0.4, y: 0.1, z: 0.7 },
    rotation: { x: 0, y: 1.2, z: 0 },
  },
  base: {
    position: { x: 0.45, y: 0.6, z: 0.6 },
    rotation: { x: -0.35, y: -0.2, z: 0 },
  },
};

/** Poses móviles con deltas amplios entre tabs (zoom + giro + altura). */
const INSPECTION_POSES_MOBILE: Record<Exclude<InspectionPart, null>, Pose> = {
  virola: {
    // Baja el mate y acerca: la alpaca llena el frame superior
    position: { x: 0.04, y: -0.05, z: 1.05 },
    rotation: { x: 0.14, y: 0.75, z: 0.02 },
  },
  cuero: {
    // Altura media + yaw fuerte para exponer costura / grano lateral
    position: { x: -0.08, y: 0.38, z: 0.92 },
    rotation: { x: 0.04, y: 2.05, z: 0 },
  },
  base: {
    // Sube e inclina: pies de bronce en el centro óptico
    position: { x: 0.05, y: 0.72, z: 0.5 },
    rotation: { x: -0.48, y: 0.2, z: 0 },
  },
};

const MOBILE_SCROLL_Y_LIFT = 0.38;

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
  const [activePart] = useInspectionPart();

  const livePose = useRef<Pose>({
    position: { ...mateScrollState.position },
    rotation: { ...mateScrollState.rotation },
  });
  const inspectingRef = useRef(false);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  const responsiveScale = useMemo(
    () => (isMobile ? MOBILE_SCALE : DESKTOP_SCALE),
    [isMobile],
  );

  const lateralFactor = isMobile ? 0.15 : 1;
  const parallaxMax = isMobile ? 0.02 : PARALLAX_MAX;
  const yLift = isMobile ? MOBILE_SCROLL_Y_LIFT : 0;
  const poses = useMemo(
    () => (isMobile ? INSPECTION_POSES_MOBILE : INSPECTION_POSES_DESKTOP),
    [isMobile],
  );

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

  useEffect(() => {
    tweenRef.current?.kill();

    const pose = livePose.current;
    const scrollPos = mateScrollState.position;
    const scrollRot = mateScrollState.rotation;

    if (activePart) {
      inspectingRef.current = true;

      const group = groupRef.current;
      if (group) {
        pose.position.x = group.position.x;
        pose.position.y = group.position.y;
        pose.position.z = group.position.z;
        pose.rotation.x = group.rotation.x;
        pose.rotation.y = group.rotation.y;
        pose.rotation.z = group.rotation.z;
      } else {
        pose.position.x = scrollPos.x * lateralFactor;
        pose.position.y = scrollPos.y + yLift;
        pose.position.z = scrollPos.z;
        pose.rotation.x = scrollRot.x;
        pose.rotation.y = scrollRot.y;
        pose.rotation.z = scrollRot.z;
      }

      const target = poses[activePart];
      const targetPos = {
        x: target.position.x * (isMobile ? 1 : lateralFactor),
        y: target.position.y,
        z: target.position.z,
      };

      tweenRef.current = gsap
        .timeline({ defaults: { duration: 0.8, ease: "power3.out" } })
        .to(pose.position, { ...targetPos }, 0)
        .to(pose.rotation, { ...target.rotation }, 0);

      return () => {
        tweenRef.current?.kill();
      };
    }

    const returnPos = {
      x: scrollPos.x * lateralFactor,
      y: scrollPos.y + yLift,
      z: scrollPos.z,
    };
    const returnRot = {
      x: scrollRot.x,
      y: scrollRot.y,
      z: scrollRot.z,
    };

    tweenRef.current = gsap
      .timeline({
        defaults: { duration: 0.8, ease: "power3.out" },
        onComplete: () => {
          inspectingRef.current = false;
        },
      })
      .to(pose.position, { ...returnPos }, 0)
      .to(pose.rotation, { ...returnRot }, 0);

    return () => {
      tweenRef.current?.kill();
    };
  }, [activePart, lateralFactor, poses, isMobile, yLift]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (inspectingRef.current || activePart) {
      const { position, rotation } = livePose.current;
      group.position.set(position.x, position.y, position.z);
      group.rotation.set(rotation.x, rotation.y, rotation.z);
      return;
    }

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

    group.position.set(
      position.x * lateralFactor,
      position.y + yLift,
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
        dpr={isMobile ? DPR_MOBILE : DPR_DESKTOP}
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
