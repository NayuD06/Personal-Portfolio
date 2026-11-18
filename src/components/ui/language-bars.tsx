"use client";

import { motion } from "motion/react";

type Props = { languages: { name: string; count: number; percent: number }[] };

/** Thanh ngang cho từng ngôn ngữ, tự kéo dài khi cuộn tới. */
export function LanguageBars({ languages }: Props) {
  return (
    <ul className="space-y-4">
      {languages.map((language, i) => (
        <li key={language.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{language.name}</span>
            <span className="font-mono text-xs text-muted">{language.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-chip">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(language.percent, 2)}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-brand h-full rounded-full"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
