"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuTerminal, LuX } from "react-icons/lu";
import { ui } from "@/data/ui";
import { HACKER_EVENT, setHacker } from "@/lib/extras";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

/**
 * Chế độ hacker (gõ `matrix` trong Terminal). Màu sắc nằm ở globals.css (mục "Chế độ hacker"), file này lo:
 * - nhãn nhỏ ở góc dưới bên trái kèm nút thoát (dùng được bằng chuột, chạm và bàn phím),
 * - phím Esc để thoát (khi không có hộp thoại nào đang mở, để Esc đóng Terminal không tắt luôn chế độ này),
 * - ép nền tối khi đang ở giao diện sáng, rồi trả lại như cũ lúc thoát (không đổi lựa chọn sáng / tối đã lưu).
 */
export function HackerMode({ home }: { home: boolean }) {
  const lang = useLang();
  const { resolvedTheme } = useTheme();
  const [on, setOn] = useState(false);
  // câu báo cho trình đọc màn hình khi bật / tắt
  const [say, setSay] = useState("");

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<boolean>).detail;
      setOn(next);
      setSay(pick(next ? ui.hacker.on : ui.hacker.off, document.documentElement.dataset.lang === "vi" ? "vi" : "en"));
    };
    window.addEventListener(HACKER_EVENT, onChange);
    return () => window.removeEventListener(HACKER_EVENT, onChange);
  }, []);

  // giao diện sáng: tạm gắn class "dark" để các màu riêng của chế độ tối cũng đổi theo
  useEffect(() => {
    if (!on || resolvedTheme === "dark") return;
    const root = document.documentElement;
    const scheme = root.style.colorScheme;
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = scheme;
    };
  }, [on, resolvedTheme]);

  useEffect(() => {
    if (!on) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // Esc đang dùng để đóng Terminal, bảng lệnh, ảnh phóng to...: để lần nhấn sau mới thoát
      if (document.documentElement.dataset.overlay || document.querySelector('[role="dialog"], [aria-modal="true"]')) return;
      setHacker(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {say}
      </p>
      {on && (
        <div
          className={`hacker-badge fixed left-3 z-40 flex items-center gap-2 rounded-xl border py-1.5 pr-1.5 pl-3 font-mono text-xs sm:left-5 lg:bottom-5 print:hidden ${
            home ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]" : "bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
          }`}
        >
          <LuTerminal className="size-4 shrink-0" aria-hidden="true" />
          <span className="font-bold tracking-[0.15em]">
            <T v={ui.hacker.badge} />
          </span>
          <span className="hacker-badge-hint hidden sm:inline">
            · <T v={ui.hacker.hint} />
          </span>
          <button
            type="button"
            onClick={() => setHacker(false)}
            aria-label={pick(ui.hacker.exit, lang)}
            title={pick(ui.hacker.exit, lang)}
            className="hacker-badge-exit grid size-8 place-items-center rounded-lg"
          >
            <LuX className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
