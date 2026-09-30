import { useMemo } from "react";

/** Subtle floating dust / pixel specks — 24 of them, never a particle demo. */
export function Particles({ tone }: { tone: "light" | "dark" }) {
  const specks = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 16,
        square: i % 4 === 0,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {specks.map((s) => (
        <span
          key={s.id}
          className="dust"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: s.square ? 0 : 999,
            background: tone === "light" ? "rgba(255,255,255,0.55)" : "rgba(40,40,40,0.35)",
            animationDelay: `-${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
