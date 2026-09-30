import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { CameraStyle } from "@/data/cameras";
import { createLcdTexture } from "./lcdTexture";

export type CameraModelProps = {
  color: string;
  trim: string;
  metalness: number;
  roughness: number;
  style: CameraStyle;
  accent: string;
  lcdScene: string;
  lcdTint: string;
  /** 0 = lens retracted, 1 = fully extended */
  lensExtend?: number;
  /** industrial-design variant: 0 classic, 1 chunky zoom, 2 slim */
  variant?: 0 | 1 | 2 | undefined;
  flash?: number;
};

const PROFILES: Record<CameraStyle, { w: number; h: number; d: number; lens: number; grip: boolean }> = {
  compact: { w: 3.3, h: 2.0, d: 0.78, lens: 0.62, grip: false },
  slim: { w: 3.3, h: 1.85, d: 0.55, lens: 0.5, grip: false },
  chunky: { w: 3.15, h: 2.15, d: 1.0, lens: 0.66, grip: true },
  zoom: { w: 3.45, h: 2.1, d: 0.95, lens: 0.78, grip: true },
  rounded: { w: 3.2, h: 1.95, d: 0.72, lens: 0.58, grip: false },
};

type Variant = {
  lens: number;
  lensX: number;
  flash: [number, number];
  flashSize: [number, number, number];
  viewfinder: boolean;
  screen: number;
  pad: number;
  padY: number;
  buttons: [number, number][];
};
const VARIANTS: Record<0 | 1 | 2, Variant> = {
  0: { lens: 0.86, lensX: 0.22, flash: [0.28, 0.28], flashSize: [0.42, 0.26, 0.05], viewfinder: true, screen: 1, pad: 1, padY: 0.05,
    buttons: [[0.18, 0.27], [0.34, 0.27], [0.18, -0.32], [0.34, -0.32]] },
  1: { lens: 1.14, lensX: 0.2, flash: [0.12, 0.3], flashSize: [0.52, 0.2, 0.05], viewfinder: false, screen: 0.95, pad: 1.1, padY: 0.12,
    buttons: [[0.4, 0.3], [0.4, 0.14], [0.4, -0.02], [0.4, -0.18]] },
  2: { lens: 0.92, lensX: 0.26, flash: [0.34, 0.3], flashSize: [0.3, 0.18, 0.04], viewfinder: false, screen: 0.84, pad: 0.85, padY: 0.02,
    buttons: [[0.2, -0.33], [0.3, -0.33], [0.4, -0.33]] },
};

function Screw({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
        <meshStandardMaterial color="#8d9299" metalness={1} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.011, 0]}>
        <boxGeometry args={[0.05, 0.006, 0.01]} />
        <meshStandardMaterial color="#3a3e43" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  );
}

function HoleGrid({
  position,
  rows = 2,
  cols = 5,
}: {
  position: [number, number, number];
  rows?: number;
  cols?: number;
}) {
  const holes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      holes.push(
        <mesh key={`${r}-${c}`} position={[c * 0.055, -r * 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 8]} />
          <meshStandardMaterial color="#17191c" metalness={0.4} roughness={0.9} />
        </mesh>,
      );
    }
  }
  return <group position={position}>{holes}</group>;
}

export function CameraModel({
  color,
  trim,
  metalness,
  roughness,
  style,
  accent,
  lcdScene,
  lcdTint,
  lensExtend = 1,
  variant = 0,
  flash = 0,
}: CameraModelProps) {
  const p = PROFILES[style];
  const barrelRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Group>(null);
  const coverL = useRef<THREE.Mesh>(null);
  const coverR = useRef<THREE.Mesh>(null);
  const V = VARIANTS[variant];
  const L = p.lens * 0.72 * V.lens;
  const flashRef = useRef<THREE.MeshStandardMaterial>(null);
  const lcdRef = useRef<THREE.MeshBasicMaterial>(null);

  const lcdMap = useMemo(() => createLcdTexture(lcdScene), [lcdScene]);
  const engraveMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.translate(256, 256);
    g.fillStyle = "rgba(210,214,218,0.75)";
    g.font = "600 9px 'IBM Plex Mono', monospace";
    const txt = "OPTICAL ZOOM 3x  \u00b7  f=5.8-17.4mm 1:2.8-4.9  \u00b7  AF LENS  \u00b7  ";
    const r = 250;
    const step = (Math.PI * 2) / txt.length;
    for (let i = 0; i < txt.length; i++) {
      g.save();
      g.rotate(i * step - Math.PI / 2);
      g.translate(0, -r);
      g.fillText(txt[i]!, -2.5, 3.5);
      g.restore();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-5 * dt);
    const open = THREE.MathUtils.clamp(lensExtend * 2, 0, 1);
    if (coverL.current && coverR.current) {
      const tx = L * 0.5 + open * L * 1.05;
      coverL.current.position.x += (-tx - coverL.current.position.x) * k;
      coverR.current.position.x += (tx - coverR.current.position.x) * k;
      const vis = open < 0.98;
      coverL.current.visible = vis && Math.abs(coverL.current.position.x) < L * 1.2;
      coverR.current.visible = coverL.current.visible;
    }
    if (barrelRef.current) {
      const ext = THREE.MathUtils.clamp(lensExtend * 2 - 0.6, 0, 1);
      const target = ext * 0.09;
      barrelRef.current.position.z += (target - barrelRef.current.position.z) * (1 - Math.exp(-4 * dt));
    }
    if (glassRef.current) {
      // focus hunt: overshoot forward, then settle back
      const bz = barrelRef.current ? barrelRef.current.position.z : 0;
      const hunting = lensExtend > 0.5 && bz > 0.06 && bz < 0.088;
      const target = 0.02 + (hunting ? 0.022 : lensExtend * 0.01);
      glassRef.current.position.z += (target - glassRef.current.position.z) * (1 - Math.exp(-3 * dt));
    }
    if (flashRef.current) {
      flashRef.current.emissiveIntensity +=
        (flash * 14 - flashRef.current.emissiveIntensity) * (1 - Math.exp(-12 * dt));
    }
    if (lcdRef.current) {
      const t = THREE.MathUtils.clamp(lensExtend * 1.4, 0, 1);
      lcdRef.current.opacity += (t - lcdRef.current.opacity) * (1 - Math.exp(-5 * dt));
    }
  });

  const front = p.d / 2;
  const back = -p.d / 2;
  const lensX = -p.w * V.lensX;
  const lensY = p.h * 0.02;

  return (
    <group>
      {/* ---------- MAIN BODY ---------- */}
      <RoundedBox args={[p.w, p.h, p.d]} radius={style === "rounded" ? 0.26 : 0.1} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          clearcoat={0.5}
          clearcoatRoughness={0.25}        />
      </RoundedBox>

      {/* front face plate with slight curvature */}
      <RoundedBox
        args={[p.w * 0.97, p.h * 0.9, 0.06]}
        radius={0.05}
        smoothness={5}
        position={[0, 0, front - 0.005]}
        castShadow
      >
        <meshPhysicalMaterial color={color} metalness={Math.min(0.38, metalness * 0.45)} roughness={Math.min(0.85, roughness + 0.22)} clearcoat={0.4} clearcoatRoughness={0.35} envMapIntensity={0.8} />
      </RoundedBox>
      {/* small self-timer indicator window */}
      <RoundedBox args={[0.12, 0.06, 0.02]} radius={0.012} smoothness={3} position={[p.w * 0.4, -p.h * 0.34, front + 0.01]}>
        <meshPhysicalMaterial color="#3a1a14" roughness={0.1} clearcoat={1} metalness={0.05} />
      </RoundedBox>

      {/* body seam */}
      <mesh position={[0, -p.h * 0.12, 0]}>
        <boxGeometry args={[p.w + 0.004, 0.012, p.d + 0.004]} />
        <meshStandardMaterial color="#26292c" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* optional textured grip */}
      {p.grip && (
        <RoundedBox args={[0.42, p.h * 0.78, p.d * 0.9]} radius={0.12} smoothness={5} position={[p.w / 2 - 0.16, 0, 0]} castShadow>
          <meshStandardMaterial color="#1c1e20" metalness={0.2} roughness={0.95} />
        </RoundedBox>
      )}

      {/* ---------- LENS ASSEMBLY (compact, recessed) ---------- */}
      <group position={[lensX, lensY, front + 0.025]}>
        {/* flush bezel integrated into the face plate */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[L + 0.07, L + 0.09, 0.03, 64]} />
          <meshStandardMaterial color="#2b2d30" metalness={0.35} roughness={0.55} />
        </mesh>
        {/* thin brushed-aluminium trim ring */}
        <mesh position={[0, 0, 0.016]}>
          <ringGeometry args={[L + 0.035, L + 0.07, 64]} />
          <meshStandardMaterial color="#b8bdc2" metalness={0.9} roughness={0.32} />
        </mesh>
        {/* seam line */}
        <mesh position={[0, 0, 0.017]}>
          <ringGeometry args={[L + 0.02, L + 0.035, 64]} />
          <meshStandardMaterial color="#0d0e10" roughness={0.9} />
        </mesh>
        {/* engraved markings on the bezel */}
        <mesh position={[0, 0, 0.0165]}>
          <ringGeometry args={[L + 0.07, L + 0.09, 96]} />
          <meshStandardMaterial map={engraveMap} transparent roughness={0.6} metalness={0.2} />
        </mesh>
        {/* ambient-occlusion shadow falling into the barrel well */}
        <mesh position={[0, 0, 0.005]}>
          <ringGeometry args={[L * 0.9, L + 0.02, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.55} />
        </mesh>


        {/* sliding lens cover halves */}
        <mesh ref={coverL} position={[-L * 0.5, 0, 0.02]}>
          <planeGeometry args={[L, L * 2]} />
          <meshStandardMaterial color="#1a1b1d" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh ref={coverR} position={[L * 0.5, 0, 0.02]}>
          <planeGeometry args={[L, L * 2]} />
          <meshStandardMaterial color="#1a1b1d" metalness={0.5} roughness={0.45} />
        </mesh>

        {/* telescoping barrel (shallow) */}
        <group ref={barrelRef} position={[0, 0, 0]}>
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[L, L, 0.08, 64]} />
            <meshStandardMaterial color="#1c1d20" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <ringGeometry args={[L * 0.86, L, 64]} />
            <meshStandardMaterial color="#232528" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.053]}>
            <ringGeometry args={[L * 0.84, L * 0.86, 64]} />
            <meshStandardMaterial color="#6d7278" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <ringGeometry args={[L * 0.7, L * 0.84, 64]} />
            <meshStandardMaterial color="#0e0f11" metalness={0.2} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <ringGeometry args={[L * 0.62, L * 0.7, 64]} />
            <meshStandardMaterial color="#060708" roughness={0.9} />
          </mesh>
          {/* convex front element */}
          <group ref={glassRef} position={[0, 0, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.28, 1]}>
              <sphereGeometry args={[L * 0.64, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial
                color="#05080c"
                metalness={0.1}
                roughness={0.04}
                clearcoat={1}
                clearcoatRoughness={0.03}
                iridescence={0.25}
                iridescenceIOR={1.3}
                iridescenceThicknessRange={[250, 400]}
                sheen={0.4}
                sheenColor="#2f6b5c"
                envMapIntensity={1.3}
              />
            </mesh>
          </group>
        </group>
      </group>


      {/* ---------- FRONT DETAILS ---------- */}
      {/* flash */}
      <RoundedBox args={V.flashSize} radius={0.04} smoothness={4} position={[p.w * V.flash[0], p.h * V.flash[1], front + 0.03]}>
        <meshStandardMaterial ref={flashRef} color="#f2f4f6" emissive="#ffffff" emissiveIntensity={0} roughness={0.15} metalness={0.1} />
      </RoundedBox>
      {/* AF assist lamp (unlit, tinted window) */}
      <mesh position={[p.w * 0.28, -p.h * 0.02, front + 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
        <meshPhysicalMaterial color="#5a2a1c" roughness={0.12} clearcoat={1} transmission={0} metalness={0.1} />
      </mesh>
      {/* optical viewfinder window */}
      {V.viewfinder && (
        <RoundedBox args={[0.24, 0.14, 0.04]} radius={0.03} smoothness={4} position={[p.w * 0.06, p.h * 0.3, front + 0.02]}>
          <meshPhysicalMaterial color="#0b1016" metalness={0.4} roughness={0.05} clearcoat={1} />
        </RoundedBox>
      )}
      {/* microphone hole */}
      <mesh position={[p.w * 0.13, p.h * 0.3, front + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.03, 10]} />
        <meshStandardMaterial color="#111315" roughness={0.9} />
      </mesh>
      {/* brand plate */}
      <RoundedBox args={[0.4, 0.055, 0.015]} radius={0.015} smoothness={3} position={[p.w * 0.12, -p.h * 0.28, front + 0.02]}>
        <meshStandardMaterial color="#b9c0c6" metalness={0.65} roughness={0.3} />
      </RoundedBox>

      {/* ---------- TOP CONTROLS ---------- */}
      {/* shutter button */}
      <group position={[p.w * 0.3, p.h / 2, 0]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.07, 28]} />
          <meshStandardMaterial color="#c5cad0" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.025, 28]} />
          <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
        </mesh>
      </group>
      {/* zoom rocker */}
      <RoundedBox args={[0.38, 0.05, 0.16]} radius={0.02} smoothness={4} position={[p.w * 0.07, p.h / 2 + 0.005, 0]}>
        <meshStandardMaterial color="#2c3034" metalness={0.6} roughness={0.5} />
      </RoundedBox>
      {/* power button */}
      <mesh position={[-p.w * 0.06, p.h / 2 + 0.005, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.04, 20]} />
        <meshStandardMaterial color="#3a3f44" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* mode dial */}
      <group position={[-p.w * 0.28, p.h / 2 - 0.01, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 32]} />
          <meshStandardMaterial color="#20242a" metalness={0.85} roughness={0.35} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.02, 0.085, 0.05]} />
              <meshStandardMaterial color="#9aa1a8" metalness={1} roughness={0.3} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.045, 0.1]}>
          <boxGeometry args={[0.05, 0.01, 0.07]} />
          <meshStandardMaterial color="#e8ebee" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      {/* speaker holes on top */}
      <HoleGrid position={[-p.w * 0.46, p.h / 2 + 0.01, -0.06]} rows={1} cols={4} />

      {/* ---------- BACK: LCD + CONTROLS ---------- */}
      {/* screen bezel */}
      <RoundedBox args={[p.w * 0.58 * V.screen, p.h * 0.66 * V.screen, 0.05]} radius={0.03} smoothness={4} position={[-p.w * 0.16, -0.02, back - 0.01]}>
        <meshStandardMaterial color="#17191c" metalness={0.5} roughness={0.55} />
      </RoundedBox>
      {/* LCD image */}
      <mesh position={[-p.w * 0.16, -0.02, back - 0.04]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[p.w * 0.52 * V.screen, p.h * 0.58 * V.screen]} />
        <meshBasicMaterial ref={lcdRef} map={lcdMap} transparent opacity={0} toneMapped={false} />
      </mesh>
      {/* LCD glass + glare */}
      <mesh position={[-p.w * 0.16, -0.02, back - 0.045]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[p.w * 0.54 * V.screen, p.h * 0.6 * V.screen]} />
        <meshPhysicalMaterial
          color={lcdTint}
          transparent
          opacity={0.16}
          roughness={0.03}
          metalness={0}
          clearcoat={1}
          envMapIntensity={2}
        />
      </mesh>
      {/* 4-way pad */}
      <group position={[p.w * 0.28, -p.h * V.padY, back - 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={V.pad}>
        <mesh>
          <torusGeometry args={[0.2, 0.06, 12, 36]} />
          <meshStandardMaterial color="#2a2e33" metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
          <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      {/* back buttons */}
      {V.buttons.map(([bx, by]) => [p.w * bx, p.h * by]).map(([bx, by]: number[], i) => (
        <RoundedBox key={i} args={[0.15, 0.09, 0.04]} radius={0.02} smoothness={3} position={[bx!, by!, back - 0.02]}>
          <meshStandardMaterial color="#33383d" metalness={0.6} roughness={0.5} />
        </RoundedBox>
      ))}
      {/* thumb grip dots */}
      <HoleGrid position={[p.w * 0.16, p.h * 0.13, back - 0.03]} rows={3} cols={3} />

      {/* ---------- SIDES / BOTTOM ---------- */}
      {/* USB / AV port door */}
      <RoundedBox args={[0.05, 0.4, 0.34]} radius={0.02} smoothness={3} position={[-p.w / 2 - 0.005, 0, -0.05]}>
        <meshStandardMaterial color={trim} metalness={metalness} roughness={roughness + 0.1} />
      </RoundedBox>
      {/* strap eyelet */}
      <mesh position={[p.w / 2 - 0.02, p.h * 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.022, 10, 20]} />
        <meshStandardMaterial color="#8e959b" metalness={1} roughness={0.3} />
      </mesh>
      {/* tripod mount */}
      <mesh position={[-p.w * 0.1, -p.h / 2 - 0.005, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color="#7f868c" metalness={1} roughness={0.4} />
      </mesh>
      {/* battery door */}
      <RoundedBox args={[0.9, 0.04, p.d * 0.7]} radius={0.015} smoothness={3} position={[p.w * 0.22, -p.h / 2 - 0.005, 0]}>
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness + 0.12} />
      </RoundedBox>
      <Screw position={[p.w * 0.22, -p.h / 2 - 0.02, p.d * 0.3]} />
    </group>
  );
}
