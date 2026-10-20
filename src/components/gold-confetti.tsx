"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
  color: string;
  life: number;
};

const FOIL_TONES = ["#c8a45c", "#a5813a", "#e8d9ac", "#b08d3e"];

export function GoldConfetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    const particles: Particle[] = [];
    for (let i = 0; i < 130; i += 1) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.28,
        y: height * 0.34,
        vx: (Math.random() - 0.5) * 6.2,
        vy: -Math.random() * 7.5 - 2.2,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.22,
        size: 3.2 + Math.random() * 4.6,
        color: FOIL_TONES[Math.floor(Math.random() * FOIL_TONES.length)],
        life: 1,
      });
    }

    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 16.67, 3);
      previous = now;
      context.clearRect(0, 0, width, height);
      let alive = false;
      for (const particle of particles) {
        particle.vy += 0.16 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.vr * delta;
        particle.life -= 0.004 * delta;
        if (particle.life > 0 && particle.y < height + 12) {
          alive = true;
          context.save();
          context.globalAlpha = Math.max(particle.life, 0);
          context.translate(particle.x, particle.y);
          context.rotate(particle.rotation);
          context.fillStyle = particle.color;
          context.fillRect(
            -particle.size / 2,
            -particle.size / 4,
            particle.size,
            particle.size / 2,
          );
          context.restore();
        }
      }
      if (alive) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      aria-hidden="true"
    />
  );
}
