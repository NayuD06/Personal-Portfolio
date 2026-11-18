"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties } from "react";
import { LuArrowUpRight, LuMouse } from "react-icons/lu";
import { profile } from "@/data/profile";
import type { IconName } from "@/lib/icons";
import { Avatar } from "../ui/avatar";
import { TechIcon } from "../ui/tech-icon";
import { Typewriter } from "../ui/typewriter";

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/** Các icon xoay quanh ảnh đại diện */
const orbitIcons: IconName[] = ["react", "nextjs", "nestjs", "typescript", "python", "docker", "postgresql", "nodejs"];

export function Hero() {
  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      {/* Nền: lưới mờ và hai đốm sáng trôi */}
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
      />
      <div aria-hidden="true" className="blob absolute -top-32 -left-32 -z-10 size-[28rem] rounded-full bg-brand-blue/25 blur-[110px]" />
      <div
        aria-hidden="true"
        className="blob absolute -right-32 bottom-0 -z-10 size-[26rem] rounded-full bg-brand-sky/20 blur-[110px] [animation-delay:-7s]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          {profile.availability && (
          <motion.p
            variants={item}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-input px-4 py-1.5 text-xs font-medium text-muted sm:text-sm"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            {profile.availability}
          </motion.p>
          )}

          <motion.h1 variants={item} className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            {profile.greeting}
            <span className="text-gradient animate-gradient mt-2 block pb-2 drop-shadow-[0_0_30px_var(--glow-sky)]">
              {profile.name}
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-4 min-h-[2.25rem] font-heading text-2xl font-bold text-fg/90 sm:text-3xl">
            <Typewriter words={profile.roles} />
          </motion.p>

          <motion.p variants={item} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            {profile.intro}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-brand shine rounded-full px-8 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-sky)]"
            >
              View Projects
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-blue/70 px-7 py-3.5 font-semibold text-brand-blue transition-colors hover:bg-brand-blue/10"
            >
              Let&apos;s Collaborate
              <LuArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </motion.div>

          <motion.ul variants={item} className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid size-11 place-items-center rounded-full border border-border bg-input text-muted transition-all hover:-translate-y-1 hover:border-brand-blue hover:text-brand-blue"
                >
                  <TechIcon name={social.icon} className="size-[18px]" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Ảnh đại diện + vòng icon công nghệ */}
        <div className="relative mx-auto grid aspect-square w-full max-w-[22rem] place-items-center sm:max-w-[28rem] [--r:9rem] sm:[--r:12.5rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease, delay: 0.2 }}
            className="relative size-[68%]"
          >
            <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-brand opacity-40 blur-3xl" />
            <div className="bg-brand relative size-full rounded-full p-[3px] shadow-[0_0_80px_-10px_var(--glow-blue)]">
              <div className="relative size-full overflow-hidden rounded-full bg-bg">
                <Avatar sizes="(min-width: 640px) 300px, 240px" priority />
              </div>
            </div>
          </motion.div>

          {/* đường quỹ đạo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-[calc(var(--r)*2)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-blue/30"
          />

          <div aria-hidden="true" className="orbit pointer-events-none absolute inset-0">
            {orbitIcons.map((name, i) => (
              <div
                key={name}
                className="absolute top-1/2 left-1/2"
                style={
                  {
                    "--a": `${(360 / orbitIcons.length) * i}deg`,
                    transform:
                      "translate(-50%, -50%) rotate(var(--a)) translateX(var(--r)) rotate(calc(var(--a) * -1))",
                  } as CSSProperties
                }
              >
                <div className="orbit-item">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
                    className="grid size-11 place-items-center rounded-full border border-brand-blue/40 bg-[var(--card-from)] text-fg shadow-[0_0_24px_-4px_var(--glow-blue)] sm:size-12"
                  >
                    <TechIcon name={name} brandColor className="size-5 sm:size-6" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to About"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.6 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-muted hover:text-brand-blue md:block"
      >
        <LuMouse className="size-7" />
      </motion.a>
    </section>
  );
}
