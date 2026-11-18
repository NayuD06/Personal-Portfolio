"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { LuArrowUp } from "react-icons/lu";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 700));

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="#home"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
          className="bg-brand fixed right-5 bottom-5 z-50 grid size-12 place-items-center rounded-full text-white shadow-[0_10px_30px_-8px_var(--glow-red)]"
        >
          <LuArrowUp className="size-5" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
