"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { LuArrowDownRight, LuCheck, LuRotateCcw, LuSend } from "react-icons/lu";
import { ui } from "@/data/ui";
import { T, type Text } from "@/lib/i18n";

/** Thay {name}, {time}... trong chữ hai ngôn ngữ */
function fill(text: Text, values: Record<string, string>): Text {
  const replace = (value: string) => value.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
  return typeof text === "string" ? replace(text) : { en: replace(text.en), vi: replace(text.vi) };
}

/** Mảnh giấy màu bay ra quanh dấu tick: hướng (độ), khoảng cách (px), màu, hình */
const confetti: [number, number, string, string][] = [
  [-80, 88, "bg-brand-blue", "rounded-sm"],
  [-50, 96, "bg-brand-sky", "rounded-full"],
  [-20, 80, "bg-sky-300", "rounded-sm"],
  [10, 92, "bg-brand-blue", "rounded-full"],
  [38, 84, "bg-blue-300", "rounded-sm"],
  [65, 98, "bg-brand-sky", "rounded-sm"],
  [95, 78, "bg-brand-blue", "rounded-full"],
  [125, 92, "bg-sky-300", "rounded-sm"],
  [155, 86, "bg-brand-sky", "rounded-full"],
  [185, 96, "bg-blue-300", "rounded-sm"],
  [215, 80, "bg-brand-blue", "rounded-sm"],
  [245, 90, "bg-brand-sky", "rounded-full"],
];

export type SentInfo = { name: string; email: string; time: string };

/**
 * Thẻ cảm ơn hiện đè lên form sau khi gửi thành công:
 * máy bay giấy bay đi, dấu tick hiện ra cùng giấy màu, lời cảm ơn có tên người gửi và "biên nhận" kiểu terminal.
 * Animation nằm trong globals.css (nhóm .sent-*), tự tắt khi máy bật giảm chuyển động.
 */
export function SentCard({ info, onReset }: { info: SentInfo; onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // đưa focus tới lời cảm ơn để trình đọc màn hình đọc ngay, và để nút Gửi (đã bị ẩn) không giữ focus
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="sent-panel absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-8 text-center sm:px-10">
      {/* Cảnh: đường bay, máy bay giấy, dấu tick, giấy màu */}
      <div aria-hidden="true" className="relative h-[120px] w-[280px] shrink-0">
        <svg viewBox="0 0 280 120" className="absolute inset-0 size-full overflow-visible" fill="none">
          <path
            className="sent-trail"
            d="M20 104 C 90 118, 120 30, 270 14"
            pathLength={1}
            stroke="var(--brand-blue)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="sent-plane absolute top-0 left-0 text-brand-blue">
          <LuSend className="size-7" />
        </span>

        <div className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2">
          <span className="sent-ring absolute inset-0 rounded-full border-2 border-brand-sky" />
          {confetti.map(([angle, distance, color, shape], i) => (
            <span
              key={angle}
              className={`sent-confetti absolute top-1/2 left-1/2 ${i % 3 === 0 ? "h-2.5 w-1.5" : "size-2"} ${color} ${shape}`}
              style={
                {
                  "--x": `${Math.cos((angle * Math.PI) / 180) * distance}px`,
                  "--y": `${Math.sin((angle * Math.PI) / 180) * distance}px`,
                  "--r": `${angle * 2}deg`,
                } as CSSProperties
              }
            />
          ))}
          <span className="sent-badge bg-brand absolute inset-0 grid place-items-center rounded-full text-white shadow-[0_16px_40px_-12px_var(--glow-sky)]">
            <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path className="sent-check" d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
            </svg>
          </span>
        </div>
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ "--i": 0 } as CSSProperties}
        className="sent-in mt-5 max-w-full text-2xl font-extrabold tracking-tight break-words outline-none sm:text-3xl"
      >
        <T v={fill(ui.contact.sentTitle, { name: info.name })} />
      </h3>
      <p style={{ "--i": 1 } as CSSProperties} className="sent-in mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        <T v={ui.contact.sentBody} />
      </p>

      {/* "Biên nhận" kiểu terminal, hợp với dòng $ ở đầu trang */}
      <div
        style={{ "--i": 2 } as CSSProperties}
        className="sent-in mt-6 w-full max-w-sm rounded-xl border border-border bg-input px-4 py-3 text-left font-mono text-xs leading-6 sm:text-[13px]"
      >
        <p className="text-muted">
          <span className="text-brand-blue">$</span> send --to duy-an
        </p>
        <p className="flex items-center gap-2">
          <LuCheck className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          <span>
            <T v={fill(ui.contact.sentDelivered, { time: info.time })} />
          </span>
        </p>
        <p className="flex items-start gap-2 text-muted">
          <span aria-hidden="true" className="w-3.5 shrink-0 text-center">
            ↳
          </span>
          <span className="min-w-0">
            <T v={ui.contact.sentReplyTo} />
            <span className="block break-all text-fg">{info.email}</span>
          </span>
        </p>
      </div>

      <div style={{ "--i": 3 } as CSSProperties} className="sent-in mt-6 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-input px-5 py-3 text-sm font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          <LuRotateCcw className="size-4" aria-hidden="true" />
          <T v={ui.contact.sentAgain} />
        </button>
        <a
          href="#projects"
          className="bg-brand shine inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_var(--glow-sky)]"
        >
          <T v={ui.contact.sentProjects} />
          <LuArrowDownRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
