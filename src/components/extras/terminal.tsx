"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import type { ChatMessage } from "@/lib/ask-client";
import { pick, T, type Lang } from "@/lib/i18n";
import { setLang, useLang } from "@/lib/use-lang";
import { switchTheme } from "../ui/theme-toggle";
import { Banner, findCommand, looksLikeQuestion, suggest, visibleNames, type CommandContext } from "./terminal-commands";

// Chế độ Terminal: cửa sổ dòng lệnh phủ lên trang. Mở bằng nút >_ trên menu, phím ` hoặc Ctrl + K > Terminal.
// Danh sách lệnh nằm ở terminal-commands.tsx.

type Line = { id: number; node: ReactNode };

/** Bấm vào tên lệnh / dự án trong màn hình thì chạy lệnh đó */
const RUN_EVENT = "terminal-run";
const runCommand = (command: string) => window.dispatchEvent(new CustomEvent(RUN_EVENT, { detail: command }));

const quick = ["help", "about", "projects", "skills", "contact", "neofetch", "ask", "clear"];

function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="font-bold text-[#38bdf8]">guest</span>
      <span className="text-[#7d8db0]">@</span>
      <span className="font-bold text-[#60a5fa]">{profile.initials.toLowerCase()}</span>
      <span className="text-[#7d8db0]">:</span>
      <span className="text-[#93c5fd]">~</span>
      <span className="text-[#7d8db0]">$ </span>
    </span>
  );
}

function Echo({ text }: { text: string }) {
  return (
    <p className="flex whitespace-pre-wrap break-all">
      <Prompt />
      <span className="text-white">{text}</span>
    </p>
  );
}

export default function Terminal({ onClose }: { onClose: () => void }) {
  const lang = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [full, setFull] = useState(false);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const nextId = useRef(1);
  const askHistory = useRef<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const push = useCallback((...nodes: ReactNode[]) => {
    setLines((list) => [...list, ...nodes.map((node) => ({ id: nextId.current++, node }))]);
  }, []);

  // lời chào lúc mở: hiện lần lượt từng dòng cho có cảm giác máy đang khởi động
  useEffect(() => {
    const now = new Date();
    const boot: ReactNode[] = [
      <p key="login" className="text-[#7d8db0]">
        Last login: {now.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} on{" "}
        {profile.website}
      </p>,
      <div key="banner" className="py-2">
        <Banner />
      </div>,
      <p key="welcome" className="text-[#d7e3ff]">
        <T v={ui.terminal.welcome} />
      </p>,
      <p key="start" className="text-[#7d8db0]">
        <T v={ui.terminal.start} />{" "}
        <button type="button" onClick={() => runCommand("help")} className="text-[#38bdf8] underline underline-offset-4 hover:text-white">
          help
        </button>
        .
      </p>,
    ];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      push(...boot);
      return;
    }
    const timers = boot.map((node, index) => window.setTimeout(() => push(node), 180 + index * 130));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [push]);

  // khóa cuộn trang phía sau, đặt con trỏ vào ô lệnh
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // luôn cuộn xuống dòng mới nhất (kể cả lúc AI đang trả lời), trừ khi người xem kéo lên đọc lại
  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;
    const observer = new ResizeObserver(() => {
      if (stick.current) scroller.scrollTop = scroller.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const isDark = resolvedTheme !== "light";

  const navigate = useCallback(
    (href: string) => {
      window.setTimeout(() => {
        onClose();
        const [path, hash] = href.split("#");
        if (hash && (path === "" || path === "/") && pathname === "/") {
          // cùng trang chủ: cuộn tới mục sau khi terminal đóng
          window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 320);
        } else {
          router.push(href);
        }
      }, 450);
    },
    [onClose, pathname, router],
  );

  const run = useCallback(
    (raw: string) => {
      const text = raw.trim();
      stick.current = true;
      if (!text) {
        push(<Echo text="" />);
        return;
      }
      setHistory((list) => (list[list.length - 1] === text ? list : [...list, text]));
      historyIndex.current = null;

      const [name, ...args] = text.split(/\s+/);
      const command = findCommand(name);
      const ctx: CommandContext = {
        args,
        lang,
        isDark,
        history: [...history, text],
        run: runCommand,
        fill: (value) => {
          setInput(value);
          inputRef.current?.focus();
        },
        clear: () => setLines([]),
        close: onClose,
        navigate,
        setTheme: (theme) => {
          const rect = inputRef.current?.getBoundingClientRect();
          switchTheme(theme, setTheme, rect ? { x: rect.left, y: rect.top } : { x: innerWidth / 2, y: innerHeight / 2 });
        },
        setLang: (next: Lang) => setLang(next),
        askHistory: askHistory.current,
      };

      if (command?.name === "clear") {
        setLines([]);
        return;
      }
      if (!command) {
        if (looksLikeQuestion(text)) {
          const ask = findCommand("ask")!;
          push(<Echo text={text} />, ask.run({ ...ctx, args: text.split(/\s+/) }) ?? null);
          return;
        }
        const guess = suggest(name);
        push(
          <Echo text={text} />,
          <p className="text-amber-400">
            <T v={{ en: "command not found:", vi: "không có lệnh:" }} /> {name}.{" "}
            <span className="text-[#7d8db0]">
              {guess ? (
                <>
                  <T v={{ en: "Did you mean", vi: "Có phải ý bạn là" }} />{" "}
                  <button type="button" onClick={() => runCommand(guess)} className="text-[#38bdf8] underline underline-offset-4 hover:text-white">
                    {guess}
                  </button>
                  ?{" "}
                </>
              ) : null}
              <T v={{ en: "Type", vi: "Gõ" }} />{" "}
              <button type="button" onClick={() => runCommand("help")} className="text-[#38bdf8] underline underline-offset-4 hover:text-white">
                help
              </button>{" "}
              <T v={{ en: "to see what I can do.", vi: "để xem các lệnh." }} />
            </span>
          </p>,
        );
        return;
      }
      const output = command.run(ctx);
      push(<Echo text={text} />, ...(output ? [output] : []));
    },
    [history, isDark, lang, navigate, onClose, push, setTheme],
  );

  useEffect(() => {
    const onRun = (event: Event) => run((event as CustomEvent<string>).detail);
    window.addEventListener(RUN_EVENT, onRun);
    return () => window.removeEventListener(RUN_EVENT, onRun);
  }, [run]);

  /** Tab: gợi ý tên lệnh hoặc tham số (tên dự án, file...) */
  function complete() {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      const word = parts[0].toLowerCase();
      const matches = visibleNames.filter((name) => name.startsWith(word));
      if (matches.length === 1) setInput(`${matches[0]} `);
      else if (matches.length > 1) push(<Echo text={input} />, <p className="text-[#60a5fa]">{matches.join("   ")}</p>);
      return;
    }
    const command = findCommand(parts[0]);
    const options = command?.complete?.() ?? [];
    const word = parts[parts.length - 1].toLowerCase();
    const matches = options.filter((option) => option.toLowerCase().startsWith(word));
    if (matches.length === 1) setInput([...parts.slice(0, -1), matches[0]].join(" ") + " ");
    else if (matches.length > 1) push(<Echo text={input} />, <p className="text-[#60a5fa]">{matches.join("   ")}</p>);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      run(input);
      setInput("");
    } else if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      if (historyIndex.current === null) draft.current = input;
      const current = historyIndex.current ?? history.length;
      const next = event.key === "ArrowUp" ? Math.max(0, current - 1) : current + 1;
      if (next >= history.length) {
        historyIndex.current = null;
        setInput(draft.current);
      } else {
        historyIndex.current = next;
        setInput(history[next]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setLines([]);
    } else if (event.ctrlKey && event.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      event.preventDefault();
      push(<Echo text={`${input}^C`} />);
      setInput("");
    }
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[75] bg-[#01030a]/80 backdrop-blur-md"
      />
      <div className={`pointer-events-none fixed inset-0 z-[76] grid place-items-center ${full ? "" : "sm:p-6"}`}>
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={pick(ui.terminal.open, lang)}
          initial={{ opacity: 0, scaleX: 0.7, scaleY: 0.006 }}
          animate={{ opacity: [0, 1, 1], scaleX: [0.7, 1, 1], scaleY: [0.006, 0.006, 1] }}
          exit={{ opacity: [1, 1, 0], scaleX: [1, 1, 0.4], scaleY: [1, 0.006, 0.006] }}
          transition={{ duration: 0.5, times: [0, 0.35, 1], ease: [0.22, 1, 0.36, 1] }}
          className={`term pointer-events-auto relative flex h-full w-full flex-col overflow-hidden font-mono text-[13px] leading-6 text-[#d7e3ff] sm:text-sm ${
            full ? "" : "sm:h-[min(82vh,760px)] sm:max-w-4xl sm:rounded-2xl"
          }`}
        >
          {/* thanh tiêu đề */}
          <div className="relative flex items-center gap-2 border-b border-[#1e3a8a]/60 bg-[#060c1a] px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5">
            <button
              type="button"
              onClick={onClose}
              aria-label={pick(ui.terminal.close, lang)}
              className="group grid size-3.5 place-items-center rounded-full bg-[#ff5f57]"
            >
              <span aria-hidden="true" className="text-[9px] leading-none font-black text-[#4d0000] opacity-0 group-hover:opacity-100">
                ×
              </span>
            </button>
            <span aria-hidden="true" className="size-3.5 rounded-full bg-[#febc2e]" />
            <button
              type="button"
              onClick={() => setFull((value) => !value)}
              aria-label={pick(ui.terminal.maximize, lang)}
              aria-pressed={full}
              className="hidden size-3.5 rounded-full bg-[#28c840] sm:block"
            />
            <span aria-hidden="true" className="block size-3.5 rounded-full bg-[#28c840] sm:hidden" />
            <p className="pointer-events-none absolute inset-x-0 text-center text-xs text-[#7d8db0]">
              guest@{profile.website}: ~
            </p>
            <span className="ml-auto hidden text-[11px] text-[#7d8db0] sm:inline">
              <T v={ui.terminal.keys} />
            </span>
          </div>

          {/* màn hình */}
          <div
            ref={scrollRef}
            onScroll={(event) => {
              const el = event.currentTarget;
              stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
            }}
            onMouseUp={(event) => {
              // bấm vào chỗ trống thì đặt con trỏ lại vào ô lệnh (trừ khi đang bôi đen chữ để chép)
              const target = event.target as HTMLElement;
              if (!target.closest("a, button") && !window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
            }}
            className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
          >
            <div ref={contentRef} className="space-y-2.5">
              {lines.map((line) => (
                <div key={line.id} className="term-line break-words">
                  {line.node}
                </div>
              ))}
              <label className="flex items-center">
                <Prompt />
                <span className="sr-only">
                  <T v={ui.terminal.inputLabel} />
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    historyIndex.current = null;
                  }}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  enterKeyHint="send"
                  className="command-input min-w-0 flex-1 bg-transparent text-base text-white caret-[#38bdf8] outline-none sm:text-sm"
                />
              </label>
            </div>
          </div>

          {/* lệnh nhanh: tiện khi dùng điện thoại */}
          <div
            role="group"
            aria-label={pick(ui.terminal.quick, lang)}
            className="flex gap-2 overflow-x-auto border-t border-[#1e3a8a]/60 bg-[#060c1a] px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] [scrollbar-width:none]"
          >
            {quick.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  if (chip === "ask") {
                    setInput("ask ");
                    inputRef.current?.focus();
                  } else run(chip);
                }}
                className="shrink-0 rounded-md border border-[#1e3a8a] bg-[#0a1428] px-2.5 py-1 text-xs text-[#93c5fd] transition-colors hover:border-[#38bdf8] hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
