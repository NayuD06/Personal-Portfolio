"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { LuMenu, LuMessageCircle, LuX } from "react-icons/lu";
import { profile } from "@/data/profile";
import { navLinks, ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { LangToggle } from "./ui/lang-toggle";
import { ThemeToggle } from "./ui/theme-toggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const { scrollY } = useScroll();
  const lang = useLang();

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
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 transition-[padding] duration-500 sm:px-8 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <a href="#home" className="group flex items-center gap-3" aria-label={profile.name}>
          <span className="bg-brand grid size-10 place-items-center rounded-xl font-heading text-sm font-black tracking-tight text-white shadow-[0_8px_24px_-10px_var(--glow-sky)] transition-transform duration-300 group-hover:-rotate-6">
            {profile.initials}
          </span>
          <span className="hidden font-heading text-lg font-extrabold tracking-tight sm:block">{profile.name}</span>
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

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <a
            href="#contact"
            className="bg-brand shine ml-1 hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_var(--glow-sky)] transition-transform hover:scale-[1.03] md:inline-flex"
          >
            <LuMessageCircle className="size-4" aria-hidden="true" />
            <T v={ui.nav.cta} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={pick(open ? ui.nav.closeMenu : ui.nav.openMenu, lang)}
            className="grid size-10 place-items-center rounded-full border border-border bg-input lg:hidden"
          >
            {open ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mx-3 mb-3 rounded-2xl border border-border bg-[var(--nav)] p-3 backdrop-blur-xl sm:mx-5 lg:hidden"
          >
            <ul className="grid gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 font-semibold ${
                      active === link.href ? "bg-chip text-brand-blue" : "text-fg hover:bg-chip"
                    }`}
                  >
                    <T v={link.label} />
                  </a>
                </motion.li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="bg-brand mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white"
                >
                  <LuMessageCircle className="size-4" aria-hidden="true" />
                  <T v={ui.nav.cta} />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
