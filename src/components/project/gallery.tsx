"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { ui } from "@/data/ui";
import { keepFocusInside } from "@/lib/focus-trap";
import { pick, T, type Text } from "@/lib/i18n";
import { useOverlay } from "@/lib/overlay";
import { useLang } from "@/lib/use-lang";

type Shot = { src: string; caption: Text };

/** Lưới ảnh chụp màn hình; bấm một ảnh để xem lớn, dùng phím mũi tên để chuyển ảnh, Esc để đóng. */
export function Gallery({ shots, title }: { shots: Shot[]; title: string }) {
  const lang = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButton = useRef<HTMLButtonElement>(null);
  const lastOpened = useRef(0);

  const close = useCallback(() => {
    setOpen(null);
    // trả focus về ảnh vừa mở
    thumbs.current[lastOpened.current]?.focus();
  }, []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (open === null) return;
    lastOpened.current = open;
  }, [open]);

  const isOpen = open !== null;
  // tạm dừng hiệu ứng phía sau lớp nền mờ khi đang xem ảnh lớn (lib/overlay.ts)
  useOverlay(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, step]);

  const current = open === null ? null : shots[open];

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <button
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${pick(ui.project.open, lang)}: ${pick(shot.caption, lang)}`}
              className="group card block w-full overflow-hidden rounded-2xl p-1.5 text-left transition-shadow hover:shadow-[0_24px_60px_-30px_var(--glow-blue)]"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-xl">
                <Image
                  src={shot.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span className="block px-2.5 pt-3 pb-2 text-sm font-semibold">
                <T v={shot.caption} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && open !== null && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${title}: ${pick(current.caption, lang)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#02050b]/90 backdrop-blur-md"
            onClick={close}
            onKeyDown={keepFocusInside}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
              <p className="min-w-0 truncate text-sm font-semibold">
                <span className="mr-3 font-mono text-white/60">
                  {open + 1}/{shots.length}
                </span>
                <T v={current.caption} />
              </p>
              <button
                ref={closeButton}
                type="button"
                onClick={close}
                aria-label={pick(ui.project.close, lang)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <LuX className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-20">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.src}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-[16/10] w-full max-w-6xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Image
                    src={current.src}
                    alt={pick(current.caption, lang)}
                    fill
                    sizes="(min-width: 1280px) 1152px, 100vw"
                    className="rounded-xl object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {shots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      step(-1);
                    }}
                    aria-label={pick(ui.project.prevImage, lang)}
                    className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-5"
                  >
                    <LuChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      step(1);
                    }}
                    aria-label={pick(ui.project.nextImage, lang)}
                    className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5"
                  >
                    <LuChevronRight className="size-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
