"use client";

import { useEffect, useRef } from "react";

// Nền hạt ở đầu trang: các chấm sáng trôi chậm, nối nhau bằng đường mờ khi ở gần.
// Rê chuột tới thì hạt dạt ra và nối dây tới con trỏ, bấm chuột thì hạt bắn tung ra.
// Chỉ chạy trên máy có chuột và không bật "giảm chuyển động"; bắt đầu sau khi trang tải xong và
// tạm dừng khi cuộn khỏi đầu trang hoặc chuyển tab, nên không làm chậm trang.
// Cho nhẹ: vẽ tối đa khoảng 60 hình/giây kể cả trên màn 120/144Hz (tốc độ hạt tính theo thời gian nên vẫn y như cũ),
// gom các đường nối cùng độ mờ vào một lần vẽ, và canvas không nét hơn 1.5x.

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const LINK = 120;
const MOUSE = 160;
/** Số mức độ mờ của đường nối: đường cùng mức được vẽ chung một lần (mắt không phân biệt được) */
const LEVELS = 16;
/** Khoảng cách tối thiểu giữa hai lần vẽ (ms): màn 60Hz vẫn vẽ mọi khung hình, màn 120/144Hz vẽ cách một khung */
const MIN_GAP = 13;

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
    let last = 0;
    let onScreen = true;
    let started = false;
    const mouse = { x: 0, y: 0, active: false };
    const paths: number[][] = Array.from({ length: LEVELS * 2 }, () => []);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
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

    const draw = (now: number) => {
      frame = 0;
      const gap = last ? now - last : 16.7;
      if (gap < MIN_GAP) {
        schedule();
        return;
      }
      last = now;
      // hạt di chuyển theo thời gian thật (k = 1 ở 60 hình/giây), tối đa 3 khung khi máy bị khựng
      const k = Math.min(gap / 16.7, 3);
      const root = document.documentElement;
      const dark = root.classList.contains("dark");
      // xanh sáng trên nền tối, xanh đậm trên nền sáng; chế độ hacker (lệnh matrix) thì xanh lá
      const rgb = root.hasAttribute("data-hacker") ? "74, 222, 128" : dark ? "125, 196, 255" : "37, 99, 235";
      const dotAlpha = dark ? 0.8 : 0.5;
      const lineAlpha = dark ? 0.24 : 0.16;
      context.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < MOUSE && distance > 0.1) {
            const push = (1 - distance / MOUSE) * 0.6 * k;
            p.vx += (dx / distance) * push * 0.12;
            p.vy += (dy / distance) * push * 0.12;
          }
        }
        // giảm dần tốc độ sau khi bị đẩy, nhưng không đứng yên hẳn
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.45) {
          const slow = 0.96 ** k;
          p.vx *= slow;
          p.vy *= slow;
        }
        p.x += p.vx * k;
        p.y += p.vy * k;
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;
      }

      // Gom đường nối theo độ mờ: mỗi mức một path, vẽ một lần (thay vì vài trăm lần stroke mỗi khung hình).
      // Mức 0..LEVELS-1 là đường giữa hai hạt, LEVELS..2*LEVELS-1 là đường tới con trỏ (đậm hơn).
      for (const path of paths) path.length = 0;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK) continue;
          const level = Math.min(LEVELS - 1, Math.floor((1 - distance / LINK) * LEVELS));
          paths[level].push(a.x, a.y, b.x, b.y);
        }
        if (mouse.active) {
          const distance = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (distance < MOUSE * 1.3) {
            const level = Math.min(LEVELS - 1, Math.floor((1 - distance / (MOUSE * 1.3)) * LEVELS));
            paths[LEVELS + level].push(a.x, a.y, mouse.x, mouse.y);
          }
        }
      }
      context.lineWidth = 1;
      for (let level = 0; level < paths.length; level++) {
        const points = paths[level];
        if (!points.length) continue;
        const mouseLine = level >= LEVELS;
        // độ mờ ở giữa mức, giống công thức cũ: (1 - khoảng cách / tầm) * độ mờ đường (x2.6 với đường tới con trỏ)
        const strength = ((level % LEVELS) + 0.5) / LEVELS;
        context.strokeStyle = `rgba(${rgb}, ${strength * lineAlpha * (mouseLine ? 2.6 : 1)})`;
        context.beginPath();
        for (let n = 0; n < points.length; n += 4) {
          context.moveTo(points[n], points[n + 1]);
          context.lineTo(points[n + 2], points[n + 3]);
        }
        context.stroke();
      }

      context.fillStyle = `rgba(${rgb}, ${dotAlpha})`;
      context.beginPath();
      for (const p of particles) {
        context.moveTo(p.x + p.r, p.y);
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      context.fill();
      schedule();
    };

    const root = document.documentElement;
    const schedule = () => {
      if (frame) return;
      // data-overlay: đang mở bảng lệnh / Terminal có nền mờ phủ kín (lib/overlay.ts)
      if (started && onScreen && !document.hidden && !root.hasAttribute("data-overlay")) frame = requestAnimationFrame(draw);
      // đang dừng: lần vẽ tiếp theo coi như khung đầu, không để hạt nhảy một đoạn dài
      else last = 0;
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
    // đóng lớp phủ thì chạy tiếp
    const overlayWatcher = new MutationObserver(() => schedule());
    overlayWatcher.observe(root, { attributes: true, attributeFilter: ["data-overlay"] });

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
      overlayWatcher.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-particles pointer-events-none absolute inset-0 -z-10 size-full" />;
}
