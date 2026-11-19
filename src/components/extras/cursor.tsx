"use client";

import { useEffect, useRef, useState } from "react";

// Con trỏ chuột riêng: một chấm nhỏ bám sát chuột và một vòng tròn trôi theo sau.
// Vòng phóng to khi rê lên nút / đường link, co lại khi bấm, ẩn đi ở ô nhập chữ (để hiện con trỏ gõ chữ bình thường).
// Chỉ bật trên máy có chuột, không bật trên điện thoại / máy tính bảng hoặc khi máy bật "giảm chuyển động".

const INTERACTIVE = "a, button, [role='button'], [role='option'], label, summary, select, [data-cursor='hover']";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  // bật / tắt theo loại thiết bị (cắm chuột vào máy tính bảng, bật giảm chuyển động... đều cập nhật ngay)
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduce.matches);
    const timer = window.setTimeout(update, 0);
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      window.clearTimeout(timer);
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const dotEl = dot.current;
    const ringEl = ring.current;
    const root = document.documentElement;

    const target = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let frame = 0;
    let visible = false;

    const draw = () => {
      // vòng ngoài đi theo chậm hơn một chút cho mềm
      trail.x += (target.x - trail.x) * 0.2;
      trail.y += (target.y - trail.y) * 0.2;
      dotEl.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      ringEl.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      frame = Math.abs(target.x - trail.x) + Math.abs(target.y - trail.y) > 0.3 ? requestAnimationFrame(draw) : 0;
    };
    const show = (value: boolean) => {
      if (visible === value) return;
      visible = value;
      root.classList.toggle("cursor-on", value);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return show(false);
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        trail.x = target.x;
        trail.y = target.y;
        show(true);
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onOver = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const state = element?.closest(TEXT) ? "text" : element?.closest(INTERACTIVE) ? "hover" : "";
      ringEl.dataset.state = state;
      dotEl.dataset.state = state;
    };
    const onDown = () => ringEl.classList.add("is-down");
    const onUp = () => ringEl.classList.remove("is-down");
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) show(false);
    };

    root.classList.add("custom-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("custom-cursor", "cursor-on");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} aria-hidden="true" className="cursor-ring">
        <span />
      </div>
      <div ref={dot} aria-hidden="true" className="cursor-dot">
        <span />
      </div>
    </>
  );
}
