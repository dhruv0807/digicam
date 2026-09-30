import { useCallback, useRef, useState } from "react";

/** Tiny synthesized camera sounds. Muted by default — never autoplays. */
export function useShutterSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const shutter = useCallback(() => {
    if (!enabled) return;
    const ac = ctx();
    const now = ac.currentTime;
    const buffer = ac.createBuffer(1, ac.sampleRate * 0.08, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6);
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.25, now);
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(now);
  }, [ctx, enabled]);

  const beep = useCallback(() => {
    if (!enabled) return;
    const ac = ctx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1180, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [ctx, enabled]);

  return { enabled, setEnabled, shutter, beep };
}
