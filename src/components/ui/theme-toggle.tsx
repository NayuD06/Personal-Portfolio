"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

const subscribe = () => () => {};

/** Nút chuyển giao diện sáng / tối. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Chỉ biết theme thật sau khi chạy trên trình duyệt
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-input text-fg transition-colors hover:border-brand-blue"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid place-items-center"
        >
          {isDark ? <LuMoon className="size-[18px]" /> : <LuSun className="size-[18px] text-amber-500" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
