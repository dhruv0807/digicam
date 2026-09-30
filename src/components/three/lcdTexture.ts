import * as THREE from "three";

const SCENES: Record<string, string[]> = {
  beach: ["#7fd0e8", "#ffe9b8", "#f0c07a"],
  party: ["#2a1a3a", "#a4459b", "#ffd36e"],
  school: ["#bcd8a0", "#e8e0c0", "#8fa06a"],
  city: ["#243a5a", "#7fa8d8", "#ffd9a0"],
  holiday: ["#ffd0a0", "#f08a6a", "#7a3a3a"],
  roadtrip: ["#8fc3d3", "#e6e2c8", "#5a6a4a"],
  sunset: ["#ff9a5a", "#ff5f7a", "#3a2350"],
  friends: ["#ffc0d8", "#fff0e0", "#a06a90"],
  birthday: ["#ffe58a", "#ff9a6a", "#6a3a2a"],
};

/** Draws a low-res, flash-lit, CCD-flavoured LCD playback frame. */
export function createLcdTexture(scene: string, date = "05/18/2006"): THREE.CanvasTexture {
  const w = 256;
  const h = 192;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const palette: string[] = SCENES[scene] ?? SCENES["beach"]!;

  // Base sky / scene gradient
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, palette[0]!);
  g.addColorStop(0.55, palette[1]!);
  g.addColorStop(1, palette[2]!);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Blown-out flash hotspot
  const flash = ctx.createRadialGradient(w * 0.42, h * 0.55, 4, w * 0.42, h * 0.55, h * 0.8);
  flash.addColorStop(0, "rgba(255,255,255,0.85)");
  flash.addColorStop(0.35, "rgba(255,255,255,0.18)");
  flash.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = flash;
  ctx.fillRect(0, 0, w, h);

  // Blocky "subjects" — silhouettes, deliberately low fidelity
  ctx.fillStyle = "rgba(20,18,26,0.55)";
  ctx.fillRect(w * 0.18, h * 0.55, w * 0.18, h * 0.45);
  ctx.beginPath();
  ctx.arc(w * 0.27, h * 0.52, h * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(30,26,36,0.45)";
  ctx.fillRect(w * 0.55, h * 0.6, w * 0.16, h * 0.4);
  ctx.beginPath();
  ctx.arc(w * 0.63, h * 0.575, h * 0.085, 0, Math.PI * 2);
  ctx.fill();

  // CCD noise
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    img.data[i] = Math.min(255, Math.max(0, img.data[i]! + n + 4));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1]! + n));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2]! + n + 8));
  }
  ctx.putImageData(img, 0, 0);

  // Camera UI overlay
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("12MP", 8, 18);
  ctx.fillText("ISO 200", 8, 32);
  ctx.fillText("1/250", 8, 46);
  ctx.fillStyle = "#ff4d4d";
  ctx.beginPath();
  ctx.arc(w - 46, 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("REC", w - 36, 18);
  ctx.fillStyle = "#ffb43a";
  ctx.font = "bold 13px monospace";
  ctx.fillText(date, w - 104, h - 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.anisotropy = 4;
  return tex;
}
