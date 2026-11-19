"use client";

import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { LuSparkles } from "react-icons/lu";
import { ui } from "@/data/ui";
import { greetConsole } from "@/lib/console-greeting";
import { foundSecret, OPEN_ASK, primeAudio, OPEN_TERMINAL, SECRET_FOUND, type SecretId } from "@/lib/extras";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { HackerMode } from "./hacker-mode";
import { TopPeek } from "./top-peek";

// Gắn một lần trong layout: nút "Hỏi AI", phím tắt mở Terminal và các easter egg trên trang:
// mã Konami (phím hoặc vuốt), gõ "duyan", bấm logo 5 lần, lắc chuột hoặc điện thoại, lời chào trong Console, vào trang lúc 0h đến 4h sáng,
// kéo quá đầu trang (top-peek.tsx) và nhãn của chế độ hacker (hacker-mode.tsx, bật bằng lệnh matrix trong Terminal).
// Terminal, khung chat và hiệu ứng easter egg chỉ được tải về khi mở lần đầu, nên không làm chậm trang.

const Terminal = dynamic(() => import("./terminal"), { ssr: false });
const ChatPanel = dynamic(() => import("./chat-panel"), { ssr: false });
// Hiệu ứng easter egg tải bằng tay (không dùng dynamic): tải xong mới hiện, nên hiện ra ngay không bị React đợi thêm
let warpModule: Promise<typeof import("./warp")> | undefined;
const loadWarp = () => (warpModule ??= import("./warp"));

const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/**
 * Tên phím đã bấm (chữ thường). Bộ gõ tiếng Việt (Unikey, Telex của Windows...) có lúc che mất phím thật
 * (key = "Process", đang ghép chữ), khi đó đọc vị trí phím trên bàn phím (event.code) để mã Konami và chữ "duyan" vẫn nhận.
 * Trả về "" cho phím bổ trợ để không làm đứt dãy đang gõ.
 */
function keyName(event: KeyboardEvent) {
  // Shift, Caps Lock... không tính là một phím trong dãy (gõ B A in hoa vẫn được)
  if (["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "Fn", "OS"].includes(event.key)) return "";
  const hidden = event.isComposing || ["Process", "Unidentified", "Dead", ""].includes(event.key) || event.keyCode === 229;
  if (!hidden) return event.key.toLowerCase();
  if (event.code.startsWith("Key")) return event.code.slice(3).toLowerCase();
  if (event.code.startsWith("Arrow")) return event.code.toLowerCase();
  return "";
}

export function SiteExtras() {
  const lang = useLang();
  const pathname = usePathname();
  const [terminal, setTerminal] = useState(false);
  const [chat, setChat] = useState<{ open: boolean; question?: string; key: number }>({ open: false, key: 0 });
  const [secret, setSecret] = useState<{ id: SecretId; key: number } | null>(null);
  const [Warp, setWarp] = useState<ComponentType<{ id: SecretId; onClose: () => void }> | null>(null);
  // chỗ đang focus trước khi mở, để đóng xong trả focus về đó
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const remember = () => {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) lastFocus.current = active;
    };
    const onTerminal = () => {
      remember();
      setTerminal(true);
    };
    const onAsk = (event: Event) => {
      remember();
      const question = (event as CustomEvent<string | undefined>).detail;
      setChat((state) => ({ open: true, question, key: state.key + 1 }));
    };
    const onSecret = (event: Event) => {
      const id = (event as CustomEvent<SecretId>).detail;
      void loadWarp().then((module) => {
        setWarp(() => module.default);
        setSecret({ id, key: Date.now() });
      });
    };

    // mã Konami: ↑ ↑ ↓ ↓ ← → ← → B A (trên điện thoại là vuốt theo các hướng đó rồi chạm 2 lần)
    let progress = 0;
    const advance = (key: string) => {
      if (key === konami[progress]) progress += 1;
      else progress = key === "arrowup" ? (progress === 2 ? 2 : 1) : 0;
      if (progress === konami.length) {
        progress = 0;
        foundSecret("konami");
      }
    };
    let typed = "";
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']");
      // phím đã được dùng việc khác (vd. điều khiển rắn trong game snake) thì không tính vào mã Konami / chữ "duyan"
      if (typing || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      // phím ` (cạnh số 1) mở / đóng Terminal
      if (event.key === "`") {
        event.preventDefault();
        remember();
        setTerminal((open) => !open);
        return;
      }
      const key = keyName(event);
      if (!key) return;
      advance(key);
      // gõ "duyan" ở bất kỳ đâu (không phải trong ô nhập): mưa code
      if (key.length === 1) {
        typed = (typed + key).slice(-5);
        if (typed === "duyan") {
          typed = "";
          foundSecret("matrix");
        }
      }
    };

    // vuốt trên màn hình cảm ứng: mỗi lần vuốt tính như một phím mũi tên, chạm nhẹ là B rồi A
    let touch: { x: number; y: number; time: number } | null = null;
    const onTouchStart = (event: TouchEvent) => {
      // vuốt trong game snake là để điều khiển rắn, không tính
      if ((event.target as HTMLElement | null)?.closest?.("[data-no-gestures]")) {
        touch = null;
        return;
      }
      const point = event.touches.length === 1 ? event.touches[0] : null;
      touch = point ? { x: point.clientX, y: point.clientY, time: performance.now() } : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const point = event.changedTouches[0];
      if (!touch || !point) return;
      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;
      const tap = Math.hypot(dx, dy) < 12 && performance.now() - touch.time < 350;
      touch = null;
      if (tap) advance(progress === 8 ? "b" : progress === 9 ? "a" : "tap");
      else if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        advance(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "arrowright" : "arrowleft") : dy > 0 ? "arrowdown" : "arrowup");
      }
    };

    // lắc chuột thật nhanh qua lại (ít nhất 8 lần đổi hướng, mỗi lần đi được một đoạn, trong 1 giây): trang rơi rồi lắp lại
    let lastX: number | null = null;
    let direction = 0;
    let segment = 0;
    let turns: number[] = [];
    let moves: { time: number; distance: number }[] = [];
    let quietUntil = 0;
    const shaken = (now: number) => {
      if (now < quietUntil) return;
      quietUntil = now + 15000;
      turns = [];
      moves = [];
      foundSecret("shake");
    };
    const onMove = (event: MouseEvent) => {
      const x = event.clientX;
      const dx = lastX === null ? 0 : x - lastX;
      lastX = x;
      if (Math.abs(dx) < 1) return;
      const now = performance.now();
      moves = [...moves.filter((move) => now - move.time < 1000), { time: now, distance: Math.abs(dx) }];
      const sign = Math.sign(dx);
      if (sign !== direction) {
        if (segment > 40) turns = [...turns.filter((time) => now - time < 1000), now];
        direction = sign;
        segment = 0;
      }
      segment += Math.abs(dx);
      const distance = moves.reduce((sum, move) => sum + move.distance, 0);
      if (turns.length >= 8 && distance > 1800) shaken(now);
    };
    // điện thoại: lắc mạnh 4 lần trong 1 giây (iPhone cần cấp quyền cảm biến nên có thể không bắt được)
    let jolts: number[] = [];
    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.acceleration;
      const g = event.accelerationIncludingGravity;
      const force =
        a?.x != null && a.y != null && a.z != null
          ? Math.hypot(a.x, a.y, a.z)
          : g?.x != null && g.y != null && g.z != null
            ? Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81)
            : 0;
      if (force < 16) return;
      const now = performance.now();
      if (jolts.length && now - jolts[jolts.length - 1] < 120) return;
      jolts = [...jolts.filter((time) => now - time < 1000), now];
      if (jolts.length >= 4) {
        jolts = [];
        shaken(now);
      }
    };

    // vào trang lúc nửa đêm đến 4 giờ sáng: nhắc đi uống nước (mỗi phiên một lần)
    let owl: number | undefined;
    const seenOwl = () => {
      try {
        return sessionStorage.getItem("night-owl") === "1";
      } catch {
        return false;
      }
    };
    if (new Date().getHours() < 4 && !seenOwl()) {
      owl = window.setTimeout(() => {
        try {
          sessionStorage.setItem("night-owl", "1");
        } catch {
          // trình duyệt chặn lưu trữ: vẫn hiện, chỉ là lần sau có thể hiện lại
        }
        foundSecret("nightowl");
      }, 2500);
    }

    // lời chào cho ai mở DevTools
    greetConsole();

    // bấm logo 5 lần liên tiếp (trong 3 giây): màn jumpscare
    let clicks: number[] = [];
    const onClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement | null)?.closest?.("[data-logo]")) return;
      const now = Date.now();
      clicks = [...clicks.filter((time) => now - time < 3000), now];
      // tải sẵn màn jumpscare từ lần bấm thứ hai, để lần thứ năm hiện ra ngay không phải chờ
      if (clicks.length === 2) void loadWarp().then((module) => setWarp(() => module.default));
      if (clicks.length >= 5) {
        clicks = [];
        primeAudio();
        foundSecret("logo");
      }
    };

    window.addEventListener(OPEN_TERMINAL, onTerminal);
    window.addEventListener(OPEN_ASK, onAsk);
    window.addEventListener(SECRET_FOUND, onSecret);
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(owl);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener(OPEN_TERMINAL, onTerminal);
      window.removeEventListener(OPEN_ASK, onAsk);
      window.removeEventListener(SECRET_FOUND, onSecret);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const restoreFocus = () => lastFocus.current?.focus?.({ preventScroll: true });
  // trang chủ có thanh menu dưới đáy trên điện thoại: đặt nút cao hơn cho khỏi che
  const home = pathname === "/";

  return (
    <>
      {!chat.open && (
        <button
          type="button"
          data-quake
          onClick={(event) => {
            lastFocus.current = event.currentTarget;
            setChat((state) => ({ open: true, key: state.key + 1 }));
          }}
          aria-label={pick(ui.ask.launcher, lang)}
          title={pick(ui.ask.open, lang)}
          className={`ask-launcher bg-brand-strong fixed right-4 z-40 flex h-12 items-center gap-2 rounded-full px-3.5 text-white shadow-[0_12px_32px_-10px_var(--glow-sky)] transition-transform hover:scale-[1.04] sm:right-5 lg:bottom-5 lg:px-5 print:hidden ${
            home ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]" : "bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
          }`}
        >
          <LuSparkles className="size-5" aria-hidden="true" />
          <span className="hidden text-sm font-semibold lg:inline">
            <T v={ui.ask.launcher} />
          </span>
        </button>
      )}

      <AnimatePresence onExitComplete={restoreFocus}>
        {chat.open && <ChatPanel key={`chat-${chat.key}`} question={chat.question} onClose={() => setChat((state) => ({ ...state, open: false }))} />}
      </AnimatePresence>

      <AnimatePresence onExitComplete={restoreFocus}>{terminal && <Terminal key="terminal" onClose={() => setTerminal(false)} />}</AnimatePresence>

      {secret && Warp && <Warp key={secret.key} id={secret.id} onClose={() => setSecret(null)} />}

      <HackerMode home={home} />
      <TopPeek />
    </>
  );
}
