"use client";

import { useEffect, useRef } from "react";

// Nền hạt ở đầu trang: các chấm sáng trôi chậm, nối nhau bằng đường mờ khi ở gần.
// Rê chuột tới thì hạt dạt ra và nối dây tới con trỏ, bấm chuột thì hạt bắn tung ra.
// Chỉ chạy trên máy có chuột và không bật "giảm chuyển động"; bắt đầu sau khi trang tải xong và
// tạm dừng khi cuộn khỏi đầu trang hoặc chuyển tab, nên không làm chậm trang.

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const LINK = 120;
const MOUSE = 160;

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let onScreen = true;
    let started = false;
    const mouse = { x: 0, y: 0, active: false };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = section.clientWidth;
      height = section.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(28, Math.min(80, Math.round((width * height) / 17000)));
      while (particles.length < count) {
        const speed = 0.12 + Math.random() * 0.28;
        const angle = Math.random() * Math.PI * 2;
        particles.push({ x: Math.random() * width, y: Math.random() * height, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 0.8 + Math.random() * 1.4 });
      }
      particles = particles.slice(0, count);
    };

    const draw = () => {
      frame = 0;
      const dark = document.documentElement.classList.contains("dark");
      // xanh sáng trên nền tối, xanh đậm trên nền sáng
      const rgb = dark ? "125, 196, 255" : "37, 99, 235";
      const dotAlpha = dark ? 0.8 : 0.5;
      const lineAlpha = dark ? 0.24 : 0.16;
      context.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < MOUSE && distance > 0.1) {
            const push = (1 - distance / MOUSE) * 0.6;
            p.vx += (dx / distance) * push * 0.12;
            p.vy += (dy / distance) * push * 0.12;
          }
        }
        // giảm dần tốc độ sau khi bị đẩy, nhưng không đứng yên hẳn
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.45) {
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;
      }

      context.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK) continue;
          context.strokeStyle = `rgba(${rgb}, ${(1 - distance / LINK) * lineAlpha})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
        if (mouse.active) {
          const distance = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (distance < MOUSE * 1.3) {
            context.strokeStyle = `rgba(${rgb}, ${(1 - distance / (MOUSE * 1.3)) * lineAlpha * 2.6})`;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(mouse.x, mouse.y);
            context.stroke();
          }
        }
      }

      context.fillStyle = `rgba(${rgb}, ${dotAlpha})`;
      for (const p of particles) {
        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      }
      schedule();
    };

    const schedule = () => {
      if (!frame && started && onScreen && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = mouse.y >= 0 && mouse.y <= rect.height;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    // bấm chuột ở đầu trang: hạt quanh đó bắn ra như sóng xung kích
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance < 260 && distance > 0.1) {
          const force = (1 - distance / 260) * 5;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }
      }
    };
    const onVisibility = () => schedule();

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    });
    const resizer = new ResizeObserver(() => resize());

    // đợi trang tải xong và trình duyệt rảnh rồi mới bắt đầu vẽ
    const start = () => {
      started = true;
      resize();
      resizer.observe(section);
      observer.observe(section);
      canvas.classList.add("is-on");
      schedule();
    };
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const onLoad = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 2000 });
      else timeoutId = window.setTimeout(start, 300);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    window.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      resizer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-particles pointer-events-none absolute inset-0 -z-10 size-full" />;
}
