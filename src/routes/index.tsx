import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CameraStage, type StageBody } from "@/components/three/CameraStage";
import { CameraSpecs } from "@/components/CameraSpecs";
import { Navbar } from "@/components/Navbar";
import { Particles } from "@/components/Particles";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useShutterSound } from "@/components/useShutterSound";
import { CAMERAS, COLOR_VARIANTS } from "@/data/cameras";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "DIGICAM — The Golden Age of Digital Cameras" },
      {
        name: "description",
        content:
          "A cinematic 3D exhibition of 2000s compact digital cameras — Cyber-shot, Coolpix, FinePix, PowerShot and the photos they made.",
      },
      { property: "og:title", content: "DIGICAM — The Golden Age of Digital Cameras" },
      {
        property: "og:description",
        content: "Scroll through an interactive museum of 2000s compact digital cameras, rendered in real-time 3D.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DigicamPage,
});

type WorldView = {
  id: string;
  bg: string;
  tone: "light" | "dark";
  body: StageBody;
  cluster?: boolean;
  hideStage?: boolean;
};

const HERO_BODY: StageBody = {
  color: "#c9ced3",
  trim: "#6d7379",
  metalness: 0.95,
  roughness: 0.24,
  style: "compact",
  accent: "#3d6fa0",
  lcdScene: "beach",
  lcdTint: "#bfe3ff",
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function DigicamPage() {
  const reduced = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState("hero");
  const [flash, setFlash] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const sound = useShutterSound();

  const worlds = useMemo<Record<string, WorldView>>(() => {
    const map: Record<string, WorldView> = {
      hero: {
        id: "hero",
        bg: "radial-gradient(circle at 50% 42%, #f7f7f5 0%, #d6d8d6 42%, #1b1d1f 100%)",
        tone: "dark",
        body: HERO_BODY,
      },
    };
    for (const c of CAMERAS) {
      map[c.id] = {
        id: c.id,
        bg: c.bg,
        tone: c.tone,
        body: {
          color: c.body.color,
          trim: c.body.trim,
          metalness: c.body.metalness,
          roughness: c.body.roughness,
          style: c.body.style,
          accent: c.accent,
          lcdScene: c.lcd.scene,
          lcdTint: c.lcd.tint,
        },
      };
    }
    map["flash-era"] = {
      id: "flash-era",
      bg: "radial-gradient(circle at 50% 45%, #1b1b1e 0%, #0b0b0d 55%, #000000 100%)",
      tone: "light",
      body: { ...HERO_BODY, color: "#2a2d31", trim: "#9aa1a8", accent: "#ffd76a", lcdScene: "party", lcdTint: "#ffe6a8" },
    };
    map["pocket"] = {
      id: "pocket",
      bg: "radial-gradient(circle at 50% 45%, #eef1f4 0%, #b8c0c7 45%, #2a2f34 100%)",
      tone: "dark",
      cluster: true,
      body: HERO_BODY,
    };
    map["photos"] = {
      id: "photos",
      bg: "radial-gradient(circle at 50% 30%, #17181a 0%, #0c0d0f 60%, #000000 100%)",
      tone: "light",
      body: HERO_BODY,
      hideStage: true,
    };
    const v = COLOR_VARIANTS[variantIndex]!;
    map["colors"] = {
      id: "colors",
      bg: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${v.color} 45%, ${v.accent} 100%)`,
      tone: "dark",
      body: {
        color: v.color,
        trim: v.trim,
        metalness: v.metalness,
        roughness: v.roughness,
        style: "slim",
        accent: v.accent,
        lcdScene: "city",
        lcdTint: "#cfe6ff",
      },
    };
    map["final"] = {
      id: "final",
      bg: "radial-gradient(circle at 50% 45%, #f4f2ee 0%, #c3c0b8 45%, #201f1c 100%)",
      tone: "dark",
      cluster: true,
      body: HERO_BODY,
    };
    return map;
  }, [variantIndex]);

  const world = worlds[activeId] ?? worlds["hero"]!;

  const clusterBodies = useMemo<StageBody[]>(
    () =>
      COLOR_VARIANTS.slice(0, 6).map((v, i) => ({
        color: v.color,
        trim: v.trim,
        metalness: v.metalness,
        roughness: v.roughness,
        style: (["rounded", "chunky", "slim", "compact", "zoom", "slim"] as const)[i]!,
        accent: v.accent,
        lcdScene: ["beach", "party", "city", "sunset", "friends", "birthday"][i]!,
        lcdTint: "#cfe6ff",
      })),
    [],
  );

  // Section tracking
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("section[id]"));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { root, threshold: [0.35, 0.6] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Flash + shutter on world change
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduced) return;
    setFlash(1);
    sound.shutter();
    const t = setTimeout(() => setFlash(0), 130);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, reduced]);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = scrollerRef.current;
      if (!root) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;
      const ids = Array.from(root.querySelectorAll<HTMLElement>("section[id]")).map((s) => s.id);
      const i = ids.indexOf(activeId);
      const next = e.key === "ArrowDown" || e.key === "PageDown" ? i + 1 : i - 1;
      if (next >= 0 && next < ids.length) {
        e.preventDefault();
        jump(ids[next]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, jump]);

  const cameraIndex = CAMERAS.findIndex((c) => c.id === activeId);
  const counterLabel = cameraIndex >= 0 ? CAMERAS[cameraIndex]!.brand.toUpperCase() : "ARCHIVE";
  const counterNum = cameraIndex >= 0 ? String(cameraIndex + 1).padStart(2, "0") : "—";

  return (
    <div className={world.tone === "light" ? "world-light" : "world-dark"}>
      {/* background world */}
      <div className="fixed inset-0 -z-20">
        <AnimatePresence mode="sync">
          <motion.div
            key={world.id + world.bg}
            className="absolute inset-0"
            style={{ background: world.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* 3D stage */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        animate={{ opacity: world.hideStage ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <CameraStage body={world.body} cluster={!!world.cluster} clusterBodies={clusterBodies} flash={flash} reduced={reduced} />
      </motion.div>

      {/* flash overlay */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-40 bg-white"
        animate={{ opacity: flash * 0.5 }}
        transition={{ duration: 0.12 }}
      />

      <div className="grain pointer-events-none fixed inset-0 z-20" />

      <Navbar onJump={jump} />

      {/* counter */}
      <div className="text-world pointer-events-none fixed bottom-6 left-5 z-30 font-tech text-[0.65rem] tracking-[0.3em] uppercase md:left-10">
        <div>{counterLabel}</div>
        <div className="text-world-dim">
          {counterNum} / {String(CAMERAS.length).padStart(2, "0")}
        </div>
      </div>

      {/* sound toggle */}
      <button
        onClick={() => sound.setEnabled((s) => !s)}
        className="panel-world text-world fixed right-5 bottom-6 z-30 rounded-full px-4 py-2 font-tech text-[0.6rem] tracking-[0.3em] uppercase md:right-10"
      >
        Sound {sound.enabled ? "On" : "Off"}
      </button>

      <main ref={scrollerRef} className="snap-page relative">
        {/* ---------- HERO ---------- */}
        <section id="hero" className="relative flex flex-col items-center justify-between overflow-hidden px-6 py-24 text-center md:py-28">
          <Particles tone={world.tone} />
          <div className="relative z-10 mt-10">
            <p className="text-world-dim font-tech text-[0.6rem] tracking-[0.42em] uppercase">
              The golden age of digital cameras — 2000 to 2010
            </p>
            <h1 className="headline text-world mt-6 text-[clamp(3rem,13vw,10rem)]">
              DIGITAL
              <br />
              MEMORIES.
            </h1>
          </div>
          <div className="relative z-10 mb-4 max-w-md">
            <p className="text-world-dim text-sm leading-relaxed">
              Before the cloud. Before the iPhone. Before everything became AI.
            </p>
            <button
              onClick={() => jump("sony")}
              className="text-world mt-8 font-tech text-[0.6rem] tracking-[0.4em] uppercase"
            >
              Scroll to explore ↓
            </button>
          </div>
        </section>

        {/* ---------- CAMERA WORLDS ---------- */}
        {CAMERAS.map((c, i) => (
          <section key={c.id} id={c.id} className="relative flex flex-col justify-between overflow-hidden px-6 py-24 md:px-14">
            <Particles tone={c.tone} />
            <div className="pointer-events-none absolute inset-0 -z-[15] flex items-center justify-center">
              <span className="ghost-word">{c.word}</span>
            </div>

            <div className="relative z-10 flex items-start justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-world-dim font-tech text-[0.58rem] tracking-[0.4em] uppercase">
                  {String(i + 1).padStart(2, "0")} — {c.brand} {c.model} · {c.era}
                </p>
                <h2 className="headline text-world mt-5 text-[clamp(2.2rem,7.5vw,5.5rem)]">
                  {c.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </div>
              <div className="hidden w-56 shrink-0 lg:block">
                <CameraSpecs specs={c.specs} />
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
              <p className="text-world-dim max-w-sm text-sm leading-relaxed">{c.description}</p>
              <div className="text-world-dim font-tech flex gap-4 text-[0.55rem] tracking-[0.3em] uppercase">
                <span>● REC</span>
                <span>{c.specs[1]!.value}</span>
                <span>{c.specs[2]!.value}</span>
                <span>Drag to rotate</span>
              </div>
            </div>
            <div className="relative z-10 mt-6 lg:hidden">
              <CameraSpecs specs={c.specs} />
            </div>
          </section>
        ))}

        {/* ---------- FLASH ERA ---------- */}
        <section id="flash-era" className="relative flex flex-col items-center justify-center gap-10 overflow-hidden px-6 py-24 text-center">
          <Particles tone="light" />
          <div className="relative z-10">
            <p className="text-world-dim font-tech text-[0.58rem] tracking-[0.4em] uppercase">The flash era</p>
            <h2 className="headline text-world mt-5 text-[clamp(2.4rem,9vw,7rem)]">
              EVERY PHOTO
              <br />
              HAD A FLASH.
            </h2>
            <button
              onClick={() => {
                if (reduced) return;
                setFlash(1);
                sound.shutter();
                setTimeout(() => setFlash(0), 140);
              }}
              className="panel-world text-world mt-10 rounded-full px-6 py-3 font-tech text-[0.6rem] tracking-[0.34em] uppercase transition-transform hover:scale-105"
            >
              Fire the flash
            </button>
          </div>
        </section>

        {/* ---------- POCKET TECHNOLOGY ---------- */}
        <section id="pocket" className="relative flex flex-col justify-between overflow-hidden px-6 py-24 md:px-14">
          <Particles tone="dark" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-world-dim font-tech text-[0.58rem] tracking-[0.4em] uppercase">Pocket technology</p>
            <h2 className="headline text-world mt-5 text-[clamp(2.2rem,7.5vw,5.5rem)]">
              THE INTERNET
              <br />
              FIT IN YOUR POCKET.
            </h2>
          </div>
          <p className="text-world-dim relative z-10 max-w-sm text-sm">
            A whole generation of cameras, orbiting slowly — silver, black, pink, blue, champagne.
          </p>
        </section>

        {/* ---------- PHOTOS ---------- */}
        <section id="photos" className="relative flex flex-col justify-center gap-10 overflow-hidden py-24">
          <div className="px-6 md:px-14">
            <p className="text-world-dim font-tech text-[0.58rem] tracking-[0.4em] uppercase">The archive</p>
            <h2 className="headline text-world mt-5 text-[clamp(2.2rem,7vw,5rem)]">THE PHOTOS THEY MADE.</h2>
          </div>
          <PhotoGallery />
        </section>

        {/* ---------- COLOR COLLECTION ---------- */}
        <section id="colors" className="relative flex flex-col justify-between overflow-hidden px-6 py-24 md:px-14">
          <Particles tone="dark" />
          <div className="relative z-10 max-w-xl">
            <p className="text-world-dim font-tech text-[0.58rem] tracking-[0.4em] uppercase">Color collection</p>
            <h2 className="headline text-world mt-5 text-[clamp(2.2rem,7vw,5rem)]">
              PICK YOUR
              <br />
              FINISH.
            </h2>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            {COLOR_VARIANTS.map((v, i) => (
              <button
                key={v.name}
                onClick={() => {
                  setVariantIndex(i);
                  sound.beep();
                }}
                aria-pressed={variantIndex === i}
                className={`panel-world text-world flex items-center gap-2 rounded-full px-4 py-2 font-tech text-[0.55rem] tracking-[0.3em] uppercase transition-transform ${
                  variantIndex === i ? "scale-105" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: v.color }} />
                {v.name}
              </button>
            ))}
          </div>
        </section>

        {/* ---------- FINAL ---------- */}
        <section id="final" className="relative flex flex-col justify-between overflow-hidden px-6 py-24 text-center md:px-14">
          <Particles tone="dark" />
          <div className="relative z-10 mt-8">
            <h2 className="headline text-world text-[clamp(3rem,12vw,9rem)]">
              KEEP
              <br />
              SHOOTING.
            </h2>
          </div>
          <div className="relative z-10">
            <p className="text-world-dim mx-auto max-w-sm text-sm leading-relaxed">
              The cameras changed.
              <br />
              The memories didn&apos;t.
            </p>
            <p className="text-world-dim mt-8 font-tech text-[0.55rem] tracking-[0.34em] uppercase">
              An editorial tribute — not affiliated with any manufacturer
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
