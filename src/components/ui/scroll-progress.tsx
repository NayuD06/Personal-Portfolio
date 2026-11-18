"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thanh tiến độ cuộn trang ở mép trên. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="bg-brand fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
    />
  );
}
