import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { CameraModel, type CameraModelProps } from "./CameraModel";

export type StageBody = Omit<CameraModelProps, "lensExtend" | "flash">;

type StageProps = {
  body: StageBody;
  /** show an orbiting collection instead of a single hero camera */
  cluster?: boolean | undefined;
  clusterBodies?: StageBody[] | undefined;
  flash?: number | undefined;
  reduced?: boolean | undefined;
};

function usePointer(reduced: boolean) {
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0, ry: 0, rx: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (drag.current.active) {
        drag.current.vy = (e.clientX - drag.current.x) * 0.006;
        drag.current.vx = (e.clientY - drag.current.y) * 0.004;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
      }
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest("a,button,input,[data-no-drag]")) return;
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    };
    const onUp = () => {
      drag.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [reduced]);

  return { pointer, drag };
}

function HeroCamera({ body, flash = 0, reduced = false }: { body: StageBody; flash?: number; reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, drag } = usePointer(reduced);
  const [extend, setExtend] = useState(0);
  const key = `${body.color}-${body.style}-${body.lcdScene}`;

  useEffect(() => {
    setExtend(0);
    const t = setTimeout(() => setExtend(1), 240);
    return () => clearTimeout(t);
  }, [key]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    if (drag.current.active) {
      drag.current.ry += drag.current.vy;
      drag.current.rx = THREE.MathUtils.clamp(drag.current.rx + drag.current.vx, -0.5, 0.5);
      drag.current.vy *= 0.6;
      drag.current.vx *= 0.6;
    } else {
      // free 360° spin: keep angle, only damp velocity
      drag.current.ry += drag.current.vy;
      drag.current.vy *= Math.exp(-3 * dt);
      drag.current.rx *= Math.exp(-1.6 * dt);
    }

    const px = reduced ? 0 : pointer.current.x;
    const py = reduced ? 0 : pointer.current.y;
    const idle = reduced ? 0 : Math.sin(t * 0.32) * 0.18;

    const targetY = -0.52 + idle + px * 0.21 + drag.current.ry;
    const targetX = 0.1 + py * 0.14 + drag.current.rx;

    g.rotation.y += (targetY - g.rotation.y) * (1 - Math.exp(-4 * dt));
    g.rotation.x += (targetX - g.rotation.x) * (1 - Math.exp(-4 * dt));
    g.position.y = (reduced ? 0 : Math.sin(t * 0.6) * 0.06) - 0.45;

    const s = THREE.MathUtils.lerp(g.scale.x, 1, 1 - Math.exp(-5 * dt));
    g.scale.setScalar(s);
  });

  return (
    <group ref={group} scale={0.68} position={[0.95, -0.45, 0]}>
      <CameraModel {...body} lensExtend={extend} flash={flash} />
    </group>
  );
}

function ClusterCamera({ bodies, reduced }: { bodies: StageBody[]; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = usePointer(reduced);
  const shadowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grd.addColorStop(0, "rgba(0,0,0,0.8)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    if (!reduced) g.rotation.y += dt * 0.12;
    const tilt = pointer.current.y * 0.12;
    g.rotation.x += (tilt - g.rotation.x) * (1 - Math.exp(-3 * dt));
    g.children.forEach((child, i) => {
      child.position.y = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.22;
      child.rotation.y += dt * (0.18 + i * 0.04);
    });
  });

  return (
    <group ref={group} scale={0.4}>
      {bodies.map((b, i) => {
        const a = (i / bodies.length) * Math.PI * 2 + [0, 0.18, -0.12, 0.1, -0.2, 0.05][i % 6]!;
        const r = 4.6 + [0, 0.5, -0.4, 0.3, -0.2, 0.6][i % 6]!;
        const sc = [1, 1.08, 0.9, 0.96, 1.04, 0.92][i % 6]!;
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
            <group scale={sc}>
              <CameraModel {...b} lensExtend={1} variant={(i % 3) as 0 | 1 | 2} />
            </group>
            <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={sc}>
              <planeGeometry args={[4.2, 2.4]} />
              <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Rig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(1.4, 1.1, 9.6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export function CameraStage({ body, cluster, clusterBodies, flash = 0, reduced = false }: StageProps) {
  const bodies = useMemo(() => (clusterBodies && clusterBodies.length ? clusterBodies : [body]), [clusterBodies, body]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [1.4, 1.1, 9.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <Rig />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[4, 6, 6]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-6, 2, -4]} intensity={0.9} color="#a8c8ff" />
      <pointLight position={[0, -3, 3]} intensity={12} distance={12} color="#ffffff" />
      <directionalLight position={[1.5, 1.5, 9]} intensity={1.5} color="#ffffff" />

      <Environment resolution={256}>
        <Lightformer intensity={4.5} position={[0, 5, 2]} scale={[14, 7, 1]} />
        <Lightformer intensity={1.8} color="#bcd4ff" position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[16, 3, 1]} />
        <Lightformer intensity={1.4} color="#ffd9c0" position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[16, 3, 1]} />
        <Lightformer intensity={1} position={[0, -4, -3]} scale={[12, 6, 1]} />
      </Environment>

      {cluster ? (
        <ClusterCamera bodies={bodies} reduced={reduced} />
      ) : (
        <HeroCamera body={body} flash={flash} reduced={reduced} />
      )}

      <ContactShadows position={[0, -1.7, 0]} opacity={0.55} scale={14} blur={2.6} far={5} resolution={512} color="#000000" />
    </Canvas>
  );
}
