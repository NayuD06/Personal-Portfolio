"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LuSearch } from "react-icons/lu";
import { ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { openCommandPalette, useIsMac } from "./command-palette";

const noop = () => () => {};

/** Khung terminal trên trang 404: hiện đúng đường link người xem vừa mở */
export function NotFoundTerminal() {
  const path = useSyncExternalStore(
    noop,
    () => {
      try {
        return decodeURI(window.location.pathname);
      } catch {
        return window.location.pathname;
      }
    },
    () => "",
  );

  const places = [
    { href: "/", label: "home/" },
    { href: "/#projects", label: "projects/" },
    { href: "/cv", label: "cv" },
    { href: "/#contact", label: "contact" },
  ];

  return (
    <div className="card w-full max-w-lg overflow-hidden rounded-2xl text-left font-mono text-[13px] leading-7 shadow-[0_30px_80px_-40px_var(--glow-blue)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] text-muted">~/portfolio</span>
      </div>
      <div className="px-5 py-4">
        <p className="break-all">
          <span className="text-brand-blue">$</span> open <span className="text-fg">{path || "..."}</span>
        </p>
        <p className="text-amber-700 dark:text-amber-500">
          <T v={ui.notFound.error} />
        </p>
        <p className="mt-2">
          <span className="text-brand-blue">$</span> ls ~/
        </p>
        <p className="flex flex-wrap gap-x-5">
          {places.map((place) => (
            <Link key={place.href} href={place.href} className="text-brand-blue underline-offset-4 hover:underline dark:text-brand-sky">
              {place.label}
            </Link>
          ))}
        </p>
        <p className="mt-2">
          <span className="text-brand-blue">$</span>{" "}
          <span aria-hidden="true" className="caret inline-block h-4 w-2 translate-y-[3px] bg-brand-sky" />
        </p>
      </div>
    </div>
  );
}

/** Nút mở bảng lệnh Ctrl + K */
export function NotFoundSearch() {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="inline-flex items-center gap-2 px-2 py-3.5 font-semibold text-muted transition-colors hover:text-brand-blue"
    >
      <LuSearch className="size-4" aria-hidden="true" />
      <T v={ui.notFound.search} />
      <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] leading-none sm:inline">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
