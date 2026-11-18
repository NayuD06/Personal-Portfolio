"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { profile, type TimelineItem } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";
import { TechIcon } from "../ui/tech-icon";

const items: TimelineItem[] = profile.timeline;

/** Hành trình: đường kẻ dọc tự vẽ dần khi cuộn, các mốc hiện xen kẽ trái/phải. */
export function Journey() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  if (items.length === 0) return null;

  return (
    <section id="journey" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="journey" title={ui.journey.title} subtitle={ui.journey.subtitle} />

        <ol ref={listRef} className="relative space-y-10 md:space-y-0">
          {/* đường kẻ nền + phần đã vẽ theo tiến độ cuộn */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-4 w-px bg-border md:left-1/2" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute top-2 bottom-2 left-4 w-0.5 origin-top -translate-x-[0.5px] rounded-full bg-gradient-to-b from-brand-blue to-brand-sky shadow-[0_0_12px_var(--glow-sky)] md:left-1/2"
          />

          {items.map((item, i) => (
            <Milestone key={pick(item.title, "en")} item={item} left={i % 2 === 0} first={i === 0} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Milestone({ item, left, first }: { item: TimelineItem; left: boolean; first: boolean }) {
  return (
    // Trên màn hình rộng các thẻ so le hai bên, kéo lên một chút để không trống
    <li className={`relative md:grid md:grid-cols-2 md:gap-16 ${first ? "" : "md:-mt-20"}`}>
      {/* chấm trên đường kẻ */}
      <motion.span
        aria-hidden="true"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="absolute top-7 left-4 z-10 -mt-2 -ml-2 grid size-4 place-items-center md:left-1/2"
      >
        {item.current && <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-sky opacity-60" />}
        <span
          className={`relative size-4 rounded-full border-2 ${
            item.current ? "bg-brand border-transparent" : "border-brand-blue bg-bg"
          } shadow-[0_0_0_4px_var(--bg-alt)]`}
        />
      </motion.span>

      <Reveal
        from={left ? "left" : "right"}
        className={`pl-12 md:pl-0 ${left ? "md:col-start-1" : "md:col-start-2"}`}
      >
        <article className="card group rounded-2xl p-5 shadow-[0_20px_50px_-30px_var(--glow-blue)] transition-transform duration-300 hover:-translate-y-1 sm:p-6">
          <Period item={item} />
          <div className="mt-3 flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg]">
              <TechIcon name={item.icon} className="size-5" />
            </span>
            <h3 className="text-lg leading-snug font-bold">
              <T v={item.title} />
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <T v={item.description} />
          </p>
          {item.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <li key={tag} className="rounded-lg bg-chip px-2.5 py-1 text-xs font-medium text-chip-fg">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </article>
      </Reveal>
    </li>
  );
}

function Period({ item }: { item: TimelineItem }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-brand-blue">
      <T v={item.period} />
      {item.current && (
        <span className="bg-brand rounded-md px-2 py-0.5 font-sans text-[11px] font-bold text-white">
          <T v={ui.journey.now} />
        </span>
      )}
    </p>
  );
}
