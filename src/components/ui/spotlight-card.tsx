"use client";

import { motion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Thẻ viền gradient, nổi lên khi rê chuột và có vệt sáng đi theo con trỏ. */
export function SpotlightCard({ children, className = "" }: Props) {
  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`card spotlight group rounded-2xl shadow-[0_10px_40px_-20px_var(--glow-blue)] transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_var(--glow-blue)] ${className}`}
    >
      {children}
    </motion.div>
  );
}
