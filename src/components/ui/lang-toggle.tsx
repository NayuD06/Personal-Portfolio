"use client";

import { motion } from "motion/react";
import { pick, type Lang } from "@/lib/i18n";
import { setLang, useLang } from "@/lib/use-lang";
import { ui } from "@/data/ui";

const options: Lang[] = ["en", "vi"];

/** Nút chuyển tiếng Anh / tiếng Việt. */
export function LangToggle({ layoutId = "lang-pill" }: { layoutId?: string }) {
  const lang = useLang();

  return (
    <div
      role="group"
      aria-label={pick(ui.nav.language, lang)}
      className="relative flex h-10 items-center rounded-full border border-border bg-input p-1 text-xs font-bold"
    >
      {options.map((option) => {
        const active = option === lang;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            lang={option}
            className={`relative z-10 h-full rounded-full px-3 uppercase transition-colors ${
              active ? "text-white" : "text-muted hover:text-fg"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="bg-brand absolute inset-0 -z-10 rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
