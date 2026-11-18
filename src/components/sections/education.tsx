"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useRef } from "react";
import { LuArrowUpRight, LuMapPin } from "react-icons/lu";
import { profile, type Education as School } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { linkProps } from "@/lib/site";
import { SectionHeading } from "../ui/section-heading";
import { CampusArt, CodeArt } from "../ui/school-art";

const ease = [0.22, 1, 0.36, 1] as const;
const schools: School[] = profile.education;

/** Học vấn: mỗi trường một hàng, ảnh (hoặc hình minh họa) và chữ đổi bên xen kẽ. */
export function Education() {
  if (schools.length === 0) return null;

  return (
    <section id="education" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="education" title={ui.education.title} subtitle={ui.education.subtitle} />
        <div className="space-y-24 lg:space-y-32">
          {schools.map((school, i) => (
            <SchoolRow key={school.short} school={school} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SchoolRow({ school, flip }: { school: School; flip: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // ảnh trôi nhẹ ngược chiều cuộn
  const photoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const artY = useTransform(scrollYProgress, [0, 1], [-16, 16]);

  return (
    // Thẻ cha không bị cắt, nên trình duyệt vẫn nhận ra khi nó lọt vào màn hình
    <motion.article
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16"
    >
      <SchoolVisual school={school} flip={flip} photoY={photoY} artY={artY} />
      <SchoolInfo school={school} flip={flip} />
    </motion.article>
  );
}

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.75 } },
};

function SchoolVisual({
  school,
  flip,
  photoY,
  artY,
}: {
  school: School;
  flip: boolean;
  photoY: MotionValue<string>;
  artY: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  // khung mở ra từ phía gần chữ nhất
  const open = "inset(0% 0% 0% 0% round 28px)";
  const frame: Variants = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { clipPath: flip ? "inset(0% 0% 0% 100% round 28px)" : "inset(0% 100% 0% 0% round 28px)" },
        // mở xong thì bỏ cắt khung để bóng đổ hiện đầy đủ
        show: { clipPath: open, transition: { duration: 1.1, ease }, transitionEnd: { clipPath: "none" } },
      };

  return (
    <div className={`relative ${flip ? "lg:order-2" : ""}`}>
      <div aria-hidden="true" className="bg-brand absolute -inset-4 rounded-[2.5rem] opacity-20 blur-3xl" />

      <motion.div
        variants={frame}
        className="card group relative aspect-[4/3] rounded-[1.75rem] p-1.5 shadow-[0_30px_80px_-30px_var(--glow-blue)]"
      >
        <div className="relative size-full overflow-hidden rounded-[1.4rem] bg-bg">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            {school.image ? (
              <motion.div style={{ y: photoY }} className="absolute inset-x-0 -inset-y-[7%]">
                <Image
                  src={school.image}
                  alt={pick(school.school, "en")}
                  fill
                  sizes="(min-width: 1024px) 34rem, 92vw"
                  className="object-cover"
                />
              </motion.div>
            ) : school.art === "campus" ? (
              <CampusArt y={artY} />
            ) : (
              <CodeArt y={artY} />
            )}
          </div>
          <div aria-hidden="true" className="absolute inset-0 rounded-[1.4rem] ring-1 ring-white/10 ring-inset" />
        </div>
      </motion.div>

      {/* trạng thái học: góc trên */}
      <motion.span
        variants={pop}
        className={`card absolute -top-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-[0_14px_40px_-16px_var(--glow-blue)] ${
          flip ? "left-6" : "right-6"
        }`}
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-sky opacity-70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-brand-sky" />
        </span>
        <T v={school.status} />
      </motion.span>

      {/* logo trường (hoặc chữ viết tắt): góc dưới */}
      <motion.div
        variants={pop}
        className={`card absolute -bottom-8 rounded-2xl p-1.5 shadow-[0_20px_50px_-20px_var(--glow-blue)] ${
          flip ? "right-6" : "left-6"
        }`}
      >
        {school.logo ? (
          <span className="relative block size-16 overflow-hidden rounded-xl bg-white sm:size-20">
            <Image src={school.logo} alt={`${school.short} logo`} fill sizes="80px" className="object-contain p-1.5" />
          </span>
        ) : (
          <span className="bg-brand grid size-16 place-items-center rounded-xl font-heading text-lg font-black tracking-tight text-white sm:size-20 sm:text-xl">
            {school.short}
          </span>
        )}
      </motion.div>
    </div>
  );
}

const info: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const chips: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const chip: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } },
};

function SchoolInfo({ school, flip }: { school: School; flip: boolean }) {
  return (
    <motion.div variants={info} className={flip ? "lg:order-1" : ""}>
      <motion.p
        variants={rise}
        className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-sm font-semibold text-brand-blue"
      >
        <T v={school.period} />
        {school.location && (
          <span className="inline-flex items-center gap-1.5 font-sans font-medium text-muted">
            <LuMapPin className="size-4" aria-hidden="true" />
            <T v={school.location} />
          </span>
        )}
      </motion.p>

      <motion.h3 variants={rise} className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">
        <T v={school.school} />
      </motion.h3>
      <motion.p variants={rise} className="mt-2 text-lg font-semibold text-chip-fg">
        <T v={school.program} />
      </motion.p>

      <motion.p variants={rise} className="mt-5 max-w-[62ch] leading-relaxed text-muted">
        <T v={school.description} />
      </motion.p>

      {school.progress && (
        <motion.div variants={rise}>
          <YearProgress current={school.progress.current} total={school.progress.total} />
        </motion.div>
      )}

      {school.subjects.length > 0 && (
        <motion.div variants={rise} className="mt-7">
          <h4 className="text-sm font-bold">
            <T v={ui.education.subjects} />
          </h4>
          <motion.ul variants={chips} className="mt-3 flex flex-wrap gap-2">
            {school.subjects.map((subject) => (
              <motion.li
                key={pick(subject, "en")}
                variants={chip}
                className="rounded-lg border border-border bg-input px-3 py-1.5 text-sm font-medium transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                <T v={subject} />
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {school.website && (
        <motion.a
          variants={rise}
          href={school.website}
          {...linkProps(school.website)}
          className="group/link mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue"
        >
          <span className="underline-offset-4 group-hover/link:underline">
            <T v={ui.education.website} />
          </span>
          <LuArrowUpRight
            className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            aria-hidden="true"
          />
        </motion.a>
      )}
    </motion.div>
  );
}

/** Thanh tiến độ theo năm học: các năm đã qua tô đầy, năm đang học sáng nhấp nháy. */
function YearProgress({ current, total }: { current: number; total: number }) {
  const reduce = useReducedMotion();
  const label = { en: `Year ${current} of ${total}`, vi: `Năm thứ ${current} trên ${total} năm` };

  return (
    <div className="mt-7 max-w-md">
      <p className="text-sm font-bold">
        <T v={label} />
      </p>
      <ol className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }, (_, i) => {
          const year = i + 1;
          const done = year < current;
          const now = year === current;
          return (
            <li key={year}>
              <span className="relative block h-2 overflow-hidden rounded-full bg-border">
                {(done || now) && (
                  <motion.span
                    variants={{
                      hidden: { scaleX: reduce ? 1 : 0 },
                      show: { scaleX: 1, transition: { duration: 0.55, delay: 0.5 + i * 0.3, ease } },
                    }}
                    className={`absolute inset-0 origin-left rounded-full bg-brand ${
                      now ? "shadow-[0_0_14px_var(--glow-sky)] motion-safe:animate-pulse" : ""
                    }`}
                  />
                )}
              </span>
              <span className={`mt-2 block text-xs ${now ? "font-bold text-brand-blue" : "text-muted"}`}>
                <T v={ui.education.year} /> {year}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
