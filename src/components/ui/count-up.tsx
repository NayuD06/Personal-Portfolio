"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Đếm số từ 0 lên khi cuộn tới. Giữ nguyên phần chữ đi kèm, ví dụ "35+". */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/);
    if (!inView || !match || !ref.current) return;
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
  }, [inView, value]);

  return <span ref={ref}>{value}</span>;
}
