"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Đếm số từ 0 lên khi cuộn tới. Giữ nguyên phần chữ đi kèm, ví dụ "35+". */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/);
    // máy bật "giảm chuyển động": hiện luôn số cuối, không đếm
    if (!inView || !match || !ref.current || reduce) return;
    const target = Number(match[1]);
    const suffix = match[2];
    const node = ref.current;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref}>{value}</span>;
}
