"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { LuMoon, LuSun } from "react-icons/lu";
import { pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { ui } from "@/data/ui";

const subscribe = () => () => {};

/**
 * Đổi giao diện với hiệu ứng vòng tròn lan ra từ nút (View Transitions API).
 * Trình duyệt chưa hỗ trợ, hoặc người xem bật "giảm chuyển động", thì đổi ngay không hiệu ứng.
 */
function switchTheme(next: "light" | "dark", apply: (theme: string) => void, event: MouseEvent<HTMLButtonElement>) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    apply(next);
    return;
  }

  // tâm vòng tròn: chỗ bấm chuột, hoặc giữa nút khi bấm bằng bàn phím
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX || rect.left + rect.width / 2;
  const y = event.clientY || rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  root.classList.add("theme-transition");
  const transition = document.startViewTransition(() => {
    flushSync(() => apply(next));
    // đổi class ngay trong lúc chụp ảnh, không chờ next-themes
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
  });
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    )
    .catch(() => {});
  transition.finished.finally(() => root.classList.remove("theme-transition"));
}

/** Nút chuyển giao diện sáng / tối. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const lang = useLang();
  // Chỉ biết theme thật sau khi chạy trên trình duyệt
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={(event) => switchTheme(isDark ? "light" : "dark", setTheme, event)}
      aria-label={pick(isDark ? ui.nav.lightMode : ui.nav.darkMode, lang)}
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
          {isDark ? <LuMoon className="size-[18px]" /> : <LuSun className="size-[18px] text-brand-blue" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
