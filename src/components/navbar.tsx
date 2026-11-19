"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { LuCodeXml, LuFolderGit2, LuHouse, LuLayers, LuMail, LuMessageCircle, LuUserRound } from "react-icons/lu";
import { profile } from "@/data/profile";
import { navLinks, ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { CommandTrigger } from "./command-palette";
import { TerminalTrigger } from "./extras/triggers";
import { LangToggle } from "./ui/lang-toggle";
import { ThemeToggle } from "./ui/theme-toggle";

/** Icon cho thanh menu dưới đáy trên điện thoại */
const tabIcons: Record<string, IconType> = {
  "#home": LuHouse,
  "#about": LuUserRound,
  "#skills": LuCodeXml,
  "#services": LuLayers,
  "#projects": LuFolderGit2,
  "#contact": LuMail,
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Đánh dấu mục đang xem trên menu
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "border-border bg-[var(--nav)] shadow-[0_10px_40px_-24px_var(--glow-blue)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-[padding] duration-500 sm:px-8 ${
            scrolled ? "py-2.5 sm:py-3" : "py-4 sm:py-5"
          }`}
        >
          <a href="#home" data-logo className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span aria-hidden="true" className="bg-brand grid size-10 shrink-0 place-items-center rounded-xl font-heading text-sm font-black tracking-tight text-white shadow-[0_8px_24px_-10px_var(--glow-sky)] transition-transform duration-300 group-hover:-rotate-6">
              {profile.initials}
            </span>
            <span className="truncate font-heading text-lg font-extrabold tracking-tight">{profile.name}</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href} className="relative">
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative z-10 block px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    <T v={link.label} />
                  </a>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="bg-brand absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <CommandTrigger />
            <TerminalTrigger />
            <LangToggle />
            <ThemeToggle />
            <a
              href="#contact"
              className="bg-brand shine ml-1 hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_var(--glow-sky)] transition-transform hover:scale-[1.03] md:inline-flex"
            >
              <LuMessageCircle className="size-4" aria-hidden="true" />
              <T v={ui.nav.cta} />
            </a>
          </div>
        </nav>
      </motion.header>

      {/* Thanh menu dưới đáy màn hình trên điện thoại và máy tính bảng */}
      <motion.nav
        aria-label="Mobile"
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:px-3 lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-6 rounded-2xl border border-border bg-[var(--nav)] p-1 shadow-[0_-10px_40px_-20px_var(--glow-blue)] backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = tabIcons[link.href];
            const isActive = active === link.href;
            return (
              <li key={link.href} className="relative">
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-chip"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative flex flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10px] leading-none font-semibold max-[359px]:text-[9px] transition-colors ${
                    isActive ? "text-brand-blue" : "text-muted active:text-fg"
                  }`}
                >
                  <motion.span animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.12 : 1 }}>
                    <Icon className="size-5" aria-hidden="true" />
                  </motion.span>
                  <span className="w-full truncate text-center tracking-tight">
                    <T v={link.short ?? link.label} />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}
