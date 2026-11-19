"use client";

import { useEffect, useRef, useState } from "react";
import { LuArrowUp } from "react-icons/lu";
import { ui } from "@/data/ui";
import { foundSecret } from "@/lib/extras";
import { T } from "@/lib/i18n";

/**
 * Easter egg: đã ở đầu trang mà vẫn cố kéo lên (cuộn chuột / touchpad, vuốt xuống trên điện thoại, hoặc nhấn ↑ / Page Up / Home
 * vài lần) thì một dòng chữ thò xuống từ mép trên màn hình theo tay kéo. Kéo đủ thì hiện hẳn:
 * "Không có gì ở trên này đâu..." rồi "hay có?", và mở khóa bí mật.
 * Chỉ nghe sự kiện kiểu passive (không chặn cuộn trang), không chạy gì khi đang ở giữa trang.
 */

/** Tổng lượng cuộn lên (px) cần có khi đã ở đầu trang. Một nấc chuột tính là 100, nên cần 4 nấc. */
const WHEEL = 400;
/** Khoảng kéo ngón tay (px) trên điện thoại, nhỏ hơn mức kéo để tải lại trang của Chrome */
const TOUCH = 96;
/** Số lần nhấn ↑ / Page Up / Home liên tiếp */
const KEYS = 5;
/** Cuộn tới đầu trang bằng đà (touchpad, chuột) còn dư vài nhịp: chỉ tính sau khi đã nằm yên ở đầu trang chừng này */
const SETTLE = 350;
const COOLDOWN = 12000;

type Stage = "idle" | "open" | "reveal";

export function TopPeek() {
  const [stage, setStage] = useState<Stage>("idle");
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage>("idle");

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const now = () => performance.now();
    let atTopSince: number | null = window.scrollY <= 0 ? now() - SETTLE : null;
    let wheel = 0;
    let keys: number[] = [];
    let touchStart: number | null = null;
    let cooldownUntil = 0;
    let idle: number | undefined;
    let timers: number[] = [];

    /** Kéo được bao nhiêu (0..1): dòng chữ thò xuống tương ứng */
    const show = (progress: number, follow: boolean) => {
      const box = boxRef.current;
      if (!box) return;
      box.style.setProperty("--pull", String(Math.max(0, Math.min(1, progress))));
      box.dataset.follow = follow ? "true" : "false";
    };
    const retract = () => {
      wheel = 0;
      keys = [];
      if (stageRef.current === "idle") show(0, false);
    };

    const blocked = () =>
      Boolean(document.documentElement.dataset.overlay) || Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]'));
    const ready = () => stageRef.current === "idle" && now() > cooldownUntil && atTopSince !== null && now() - atTopSince > SETTLE && !blocked();

    const open = () => {
      wheel = 0;
      keys = [];
      touchStart = null;
      cooldownUntil = now() + COOLDOWN;
      window.clearTimeout(idle);
      show(1, false);
      setStage("open");
      timers = [
        window.setTimeout(() => {
          setStage("reveal");
          foundSecret("ceiling");
        }, 1100),
        window.setTimeout(() => {
          setStage("idle");
          show(0, false);
        }, 5200),
      ];
    };

    const onScroll = () => {
      if (window.scrollY <= 0) atTopSince ??= now();
      else if (atTopSince !== null) {
        atTopSince = null;
        retract();
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (event.deltaY > 0) {
        if (wheel > 0) retract();
        return;
      }
      if (event.deltaY === 0 || !ready()) return;
      if ((event.target as HTMLElement | null)?.closest?.("[data-no-gestures]")) return;
      // deltaMode 1 = tính theo dòng (Firefox), 2 = theo trang
      const raw = -event.deltaY * (event.deltaMode === 1 ? 33 : event.deltaMode === 2 ? window.innerHeight : 1);
      // một nấc chuột báo con số khác nhau tùy máy (100, 60, 120... theo độ phóng màn hình): nấc lớn nào cũng tính 100,
      // touchpad gửi nhiều nhịp nhỏ thì cộng dồn theo đúng khoảng cuộn
      const step = raw >= 40 ? Math.max(raw, 100) : raw;
      wheel += step;
      show(wheel / WHEEL, true);
      window.clearTimeout(idle);
      idle = window.setTimeout(retract, 700);
      if (wheel >= WHEEL) open();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStart = null;
      if (event.touches.length !== 1 || window.scrollY > 0 || !ready()) return;
      if ((event.target as HTMLElement | null)?.closest?.("[data-no-gestures]")) return;
      touchStart = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (touchStart === null || stageRef.current !== "idle") return;
      if (window.scrollY > 0) {
        touchStart = null;
        retract();
        return;
      }
      const pulled = event.touches[0].clientY - touchStart;
      show(pulled / TOUCH, true);
      if (pulled >= TOUCH) open();
    };
    const onTouchEnd = () => {
      if (touchStart === null) return;
      touchStart = null;
      retract();
    };

    const onKey = (event: KeyboardEvent) => {
      if (!["ArrowUp", "PageUp", "Home"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      if ((event.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true'], [data-no-gestures]")) return;
      if (!ready()) return;
      const time = now();
      keys = [...keys.filter((t) => time - t < 2500), time];
      show(keys.length / KEYS, false);
      window.clearTimeout(idle);
      idle = window.setTimeout(retract, 1600);
      if (keys.length >= KEYS) open();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(idle);
      for (const timer of timers) window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* câu cho trình đọc màn hình: chỉ có chữ khi đã hiện hẳn */}
      <p className="sr-only" role="status" aria-live="polite">
        {stage !== "idle" && (
          <>
            <T v={ui.topPeek.first} />
            {stage === "reveal" && (
              <>
                {" "}
                <T v={ui.topPeek.second} />
              </>
            )}
          </>
        )}
      </p>
      <div ref={boxRef} aria-hidden="true" className="top-peek pointer-events-none fixed top-0 left-1/2 z-[70] w-max max-w-[calc(100vw-1.5rem)] print:hidden" data-stage={stage}>
        <div className="card flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2 text-sm font-semibold shadow-[0_18px_50px_-18px_var(--glow-blue)] sm:text-[15px]">
          <span className="bg-brand grid size-7 shrink-0 place-items-center rounded-full text-white">
            <LuArrowUp className="top-peek-arrow size-4" />
          </span>
          <span>
            <T v={ui.topPeek.first} />
            {stage === "reveal" && (
              <span className="top-peek-second text-brand-blue dark:text-brand-sky">
                {" "}
                <T v={ui.topPeek.second} /> 👀
              </span>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
