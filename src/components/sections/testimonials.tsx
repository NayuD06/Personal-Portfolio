"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuQuote, LuStar } from "react-icons/lu";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";

const items = profile.testimonials;
/** Thời gian mỗi nhận xét hiện trước khi tự chuyển (giây) */
const AUTOPLAY_SECONDS = 6;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Testimonials() {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const lang = useLang();

  const go = useCallback((step: number) => {
    setState(([current]) => [(current + step + items.length) % items.length, step]);
  }, []);

  if (items.length === 0) return null;
  const item = items[index];

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  }

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="testimonials" title={ui.testimonials.title} subtitle={ui.testimonials.subtitle} />

        <Reveal from="scale">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label={pick(ui.testimonials.title, lang)}
            className="card relative overflow-hidden rounded-3xl shadow-[0_30px_80px_-40px_var(--glow-blue)]"
          >
            <LuQuote
              aria-hidden="true"
              className="pointer-events-none absolute top-10 right-12 hidden size-20 text-brand-blue/25 sm:block"
            />

            <div className="relative min-h-[20rem] overflow-hidden px-6 pt-10 pb-6 sm:min-h-[16rem] sm:px-12 sm:pt-14">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: direction >= 0 ? 80 : -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction >= 0 ? -80 : 80 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                  aria-live="polite"
                >
                  <blockquote className="max-w-3xl font-heading text-xl leading-relaxed font-semibold text-fg/90 sm:text-2xl">
                    <T v={item.quote} />
                  </blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-4">
                    <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-xl font-heading font-black text-white">
                      {initialsOf(item.name)}
                    </span>
                    <span>
                      <span className="block font-heading text-lg font-bold">{item.name}</span>
                      <span className="block text-sm text-muted">
                        <T v={item.role} />, {item.date}
                      </span>
                    </span>
                    <span className="ml-auto flex gap-1 text-brand-sky" aria-label="5/5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <LuStar className="size-5 fill-current" aria-hidden="true" />
                        </motion.span>
                      ))}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 border-t border-border px-6 py-4 sm:px-12">
              <span className="font-mono text-sm text-muted" aria-hidden="true">
                <span className="font-bold text-fg">{String(index + 1).padStart(2, "0")}</span> /{" "}
                {String(items.length).padStart(2, "0")}
              </span>

              {/* thanh thời gian tự chuyển, hết thanh thì sang nhận xét kế tiếp */}
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-chip">
                {items.length > 1 && (
                  <div
                    key={index}
                    onAnimationEnd={() => go(1)}
                    className="progress-bar bg-brand h-full w-full origin-left rounded-full"
                    style={{
                      animationDuration: `${AUTOPLAY_SECONDS}s`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <ArrowButton label={pick(ui.testimonials.prev, lang)} onClick={() => go(-1)}>
                  <LuChevronLeft className="size-5" />
                </ArrowButton>
                <ArrowButton label={pick(ui.testimonials.next, lang)} onClick={() => go(1)}>
                  <LuChevronRight className="size-5" />
                </ArrowButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ArrowButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-input text-fg transition-colors hover:border-brand-blue hover:text-brand-blue"
    >
      {children}
    </motion.button>
  );
}
