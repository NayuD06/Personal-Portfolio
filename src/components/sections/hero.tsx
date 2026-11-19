"use client";

import { motion } from "motion/react";
import { useMemo, type CSSProperties } from "react";
import { LuArrowDownRight, LuDownload, LuHammer, LuMail, LuMapPin, LuMouse } from "react-icons/lu";
import { profile } from "@/data/profile";
import { linkProps } from "@/lib/site";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import type { IconName } from "@/lib/icons";
import { useLang } from "@/lib/use-lang";
import { Avatar } from "../ui/avatar";
import { HeroParticles } from "../ui/hero-particles";
import { ResumeLink } from "../ui/resume-link";
import { TechIcon } from "../ui/tech-icon";
import { Typewriter } from "../ui/typewriter";

/** Thứ tự xuất hiện của từng dòng chữ (class "enter" trong globals.css, chạy bằng CSS nên không chờ JavaScript) */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

/** Các icon xoay quanh ảnh đại diện */
const orbitIcons: IconName[] = ["react", "nextjs", "nestjs", "typescript", "claude", "docker", "postgresql", "nodejs"];

export function Hero() {
  const lang = useLang();
  const roles = useMemo(() => profile.roles.map((role) => pick(role, lang)), [lang]);

  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
      {/* Nền: lưới mờ và hai đốm sáng trôi */}
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_25%,transparent_70%)]"
      />
      <div aria-hidden="true" className="blob absolute -top-40 right-0 -z-10 size-[30rem] rounded-full bg-brand-blue/25 blur-[120px]" />
      <div
        aria-hidden="true"
        className="blob absolute bottom-0 -left-40 -z-10 size-[24rem] rounded-full bg-brand-sky/15 blur-[110px] [animation-delay:-7s]"
      />
      {/* hạt sáng chuyển động theo chuột (chỉ máy có chuột) */}
      <HeroParticles />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:gap-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div>
          {profile.availability && (
            <p
              style={at(0)}
              className="enter mb-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-input py-1.5 pr-4 pl-2 text-xs font-medium text-muted sm:text-sm"
            >
              <span className="relative flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <T v={profile.availability} />
            </p>
          )}

          <p style={at(1)} className="enter font-mono text-sm text-muted sm:text-base">
            <span className="text-brand-blue">{"// "}</span>
            <T v={ui.hero.greeting} />
          </p>

          <div style={at(2)} className="enter">
            <h1 className="text-gradient animate-gradient mt-2 pb-2 text-6xl leading-[0.95] font-black tracking-tight sm:text-7xl lg:text-8xl">
              {profile.name}
            </h1>
          </div>

          <p
            style={at(3)}
            className="enter mt-5 inline-flex max-w-full items-center gap-3 rounded-xl border border-border bg-input px-4 py-2.5 font-mono text-base font-semibold sm:text-lg"
          >
            <span className="text-brand-blue" aria-hidden="true">
              $
            </span>
            <span className="min-h-[1.5em] truncate">
              <Typewriter words={roles} />
            </span>
          </p>

          <p style={at(4)} className="enter mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            <T v={profile.intro} />
          </p>

          <div style={at(5)} className="enter mt-9 flex flex-wrap items-center gap-3">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-brand shine group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-sky)]"
            >
              <T v={ui.hero.viewProjects} />
              <LuArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden="true" />
            </motion.a>
            <ResumeLink className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-7 py-3.5 font-semibold transition-[color,border-color,scale] hover:scale-[1.04] hover:border-brand-blue hover:text-brand-blue active:scale-[0.97]">
              <LuDownload className="size-4" aria-hidden="true" />
              <T v={ui.hero.cv} />
            </ResumeLink>
            {/* nút phụ thứ ba: chỉ chữ, nhẹ hơn hai nút trên */}
            <a
              href="#contact"
              className="group/contact inline-flex items-center gap-2 px-2 py-3.5 font-semibold text-muted transition-colors hover:text-brand-blue"
            >
              <LuMail className="size-4" aria-hidden="true" />
              <span className="underline-offset-4 group-hover/contact:underline">
                <T v={ui.hero.contact} />
              </span>
            </a>
          </div>

          <ul style={at(6)} className="enter mt-10 flex items-center gap-2">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  {...linkProps(social.href)}
                  aria-label={social.label}
                  className="grid size-10 place-items-center rounded-lg text-muted transition-all hover:-translate-y-1 hover:bg-chip hover:text-brand-blue"
                >
                  <TechIcon name={social.icon} className="size-5" />
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="ml-2 h-px w-16 bg-gradient-to-r from-border to-transparent" />
          </ul>
        </div>

        {/* Ảnh đại diện trong khung bo góc + vòng icon công nghệ */}
        <div className="relative order-first mx-auto grid aspect-square w-full max-w-[19rem] place-items-center [--r:8.25rem] sm:max-w-[28rem] sm:[--r:12.75rem] lg:order-none">
          {/* đường quỹ đạo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-[calc(var(--r)*2)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-blue/30"
          />

          <div className="enter-avatar relative size-[64%] -rotate-3">
            <div aria-hidden="true" className="bg-brand absolute -inset-6 rounded-[3rem] opacity-35 blur-3xl" />
            <div className="bg-brand relative size-full rounded-[2.5rem] p-[3px] shadow-[0_0_80px_-10px_var(--glow-blue)]">
              <div className="relative size-full overflow-hidden rounded-[calc(2.5rem-3px)] bg-bg">
                <Avatar sizes="(min-width: 640px) 290px, 230px" priority />
              </div>
            </div>
          </div>

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
                    className="grid size-10 place-items-center rounded-xl border border-brand-blue/40 bg-[var(--card-from)] text-fg shadow-[0_0_24px_-4px_var(--glow-blue)] sm:size-12"
                  >
                    <TechIcon name={name} brandColor className="size-5 sm:size-6" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          {/* thẻ thông tin nổi */}
          <FloatingCard className="-bottom-3 -left-2 sm:bottom-4 sm:-left-6" delay={1.3} drift={-8}>
            <span className="bg-brand grid size-9 place-items-center rounded-lg text-white">
              <LuHammer className="size-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] text-muted">
                <T v={ui.hero.building} />
              </span>
              <span className="block text-sm font-bold">{profile.currentlyBuilding}</span>
            </span>
          </FloatingCard>
          <FloatingCard className="-top-1 -right-2 sm:top-6 sm:-right-4" delay={1.5} drift={8}>
            <span className="grid size-9 place-items-center rounded-lg bg-chip text-brand-blue">
              <LuMapPin className="size-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] text-muted">
                <T v={ui.hero.basedIn} />
              </span>
              <span className="block text-sm font-bold">
                <T v={profile.location} />
              </span>
            </span>
          </FloatingCard>
        </div>
      </div>

      <motion.a
        href="#about"
        aria-label={pick(ui.hero.scroll, lang)}
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

function FloatingCard({
  children,
  className,
  delay,
  drift,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
  drift: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, drift, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, type: "spring", stiffness: 260, damping: 20 },
        y: { delay, duration: 5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`card absolute z-10 flex items-center gap-2.5 rounded-2xl py-2 pr-3 pl-2 sm:gap-3 sm:py-2.5 sm:pr-4 sm:pl-2.5 shadow-[0_20px_50px_-20px_var(--glow-blue)] backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}
