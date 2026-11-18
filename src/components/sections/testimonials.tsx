"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuQuote, LuStar } from "react-icons/lu";
import { profile } from "@/data/profile";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const items = profile.testimonials;

export function Testimonials() {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const go = useCallback((step: number) => {
    setState(([current]) => [(current + step + items.length) % items.length, step]);
  }, []);

  // Tự chuyển sau mỗi 6 giây, dừng khi rê chuột vào
  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setInterval(() => go(1), 6000);
    return () => clearInterval(timer);
  }, [paused, go]);

  if (items.length === 0) return null;
  const item = items[index];

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  }

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Testimonials"
          subtitle="What lecturers, teammates and collaborators say about working with me."
        />

        <Reveal from="scale">
          <div
            className="mx-auto flex max-w-3xl items-center gap-3 sm:gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Testimonials"
          >
            <ArrowButton label="Previous testimonial" onClick={() => go(-1)}>
              <LuChevronLeft className="size-5" />
            </ArrowButton>

            <div className="relative min-h-[19rem] flex-1 overflow-hidden sm:min-h-[16rem]">
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
                  className="card relative cursor-grab rounded-2xl px-6 py-9 text-center active:cursor-grabbing sm:px-10"
                  aria-live="polite"
                >
                  <LuQuote aria-hidden="true" className="absolute top-5 left-5 size-8 text-brand-blue/30" />
                  <div className="flex justify-center gap-1 text-brand-sky" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <LuStar className="size-6 fill-current" aria-hidden="true" />
                      </motion.span>
                    ))}
                  </div>
                  <blockquote className="mt-6 leading-relaxed text-fg/90">{item.quote}</blockquote>
                  <figcaption className="mt-6">
                    <span className="block font-heading text-lg font-bold text-brand-sky">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {item.role}, {item.date}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <ArrowButton label="Next testimonial" onClick={() => go(1)}>
              <LuChevronRight className="size-5" />
            </ArrowButton>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {items.map((t, i) => (
              <button
                key={t.name + i}
                type="button"
                onClick={() => setState([i, i > index ? 1 : -1])}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
                className="grid h-6 place-items-center"
              >
                <motion.span
                  animate={{ width: i === index ? 28 : 10 }}
                  className={`block h-2.5 rounded-full ${i === index ? "bg-brand" : "bg-muted/40"}`}
                />
              </button>
            ))}
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
      className="bg-brand grid size-10 shrink-0 place-items-center rounded-full text-white shadow-[0_8px_24px_-8px_var(--glow-sky)] sm:size-12"
    >
      {children}
    </motion.button>
  );
}
