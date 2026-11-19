"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { LuArrowUp, LuCircleAlert, LuRotateCcw, LuSparkles, LuSquare, LuX } from "react-icons/lu";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { askAssistant, MAX_QUESTION, type AskOutcome, type ChatMessage } from "@/lib/ask-client";
import { pick, T } from "@/lib/i18n";
import { warmTurnstile } from "@/lib/turnstile-client";
import { useLang } from "@/lib/use-lang";
import { Avatar } from "../ui/avatar";
import { RichText } from "./rich-text";

// Khung chat hỏi đáp với trợ lý AI. Mở bằng nút "Hỏi AI" ở góc phải dưới, hoặc từ bảng lệnh Ctrl + K.
// Cuộc trò chuyện được giữ lại khi đóng/mở khung (cho tới khi tải lại trang hoặc bấm "Cuộc trò chuyện mới").

type Message = ChatMessage & {
  id: number;
  streaming?: boolean;
  outcome?: AskOutcome;
};

let saved: Message[] = [];
let nextId = 1;

const notices: Partial<Record<AskOutcome, (typeof ui.ask)["error"]>> = {
  not_configured: ui.ask.notConfigured,
  rate_limited: ui.ask.rateLimited,
  busy: ui.ask.busy,
  quota: ui.ask.quota,
  verify: ui.ask.verify,
  error: ui.ask.error,
  refusal: ui.ask.refusal,
};

type Props = {
  onClose: () => void;
  /** Câu hỏi gửi kèm khi mở (vd. từ bảng lệnh) */
  question?: string;
};

export default function ChatPanel({ onClose, question }: Props) {
  const lang = useLang();
  const [messages, setMessages] = useState<Message[]>(saved);
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const streaming = messages.some((message) => message.streaming);

  // tải sẵn script chống bot (nếu đã bật Turnstile) để câu hỏi đầu không phải chờ
  useEffect(warmTurnstile, []);

  // nhớ cuộc trò chuyện khi đóng khung; đang trả lời dở thì dừng lại
  useEffect(() => {
    saved = messages;
  }, [messages]);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      saved = saved.map((message) => (message.streaming ? { ...message, streaming: false, outcome: message.content ? "cut" : "aborted" } : message));
    },
    [],
  );

  // máy có chuột thì đặt con trỏ vào ô nhập luôn; điện thoại thì không, để bàn phím không che mất gợi ý
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    else dialogRef.current?.focus();
  }, []);

  // trên điện thoại khung chat phủ kín màn hình: khóa cuộn trang phía sau
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // tự cuộn xuống khi có chữ mới, trừ khi người xem đang kéo lên đọc lại
  useEffect(() => {
    const log = logRef.current;
    if (log && stickRef.current) log.scrollTop = log.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || content.length > MAX_QUESTION || streaming) return;

    // chỉ gửi lại các lượt đã trả lời xong, bỏ những câu bị lỗi
    const history: ChatMessage[] = [];
    for (let i = 0; i + 1 < messages.length; i += 2) {
      const [asked, answered] = [messages[i], messages[i + 1]];
      if (asked.role === "user" && answered.role === "assistant" && answered.content && (answered.outcome === "ok" || answered.outcome === "cut")) {
        history.push({ role: "user", content: asked.content }, { role: "assistant", content: answered.content });
      }
    }

    const answerId = nextId + 1;
    setMessages((list) => [
      ...list,
      { id: nextId, role: "user", content },
      { id: answerId, role: "assistant", content: "", streaming: true },
    ]);
    nextId += 2;
    setInput("");
    stickRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    const outcome = await askAssistant(
      [...history, { role: "user", content }],
      lang,
      (chunk) => setMessages((list) => list.map((message) => (message.id === answerId ? { ...message, content: message.content + chunk } : message))),
      controller.signal,
    );
    abortRef.current = null;
    setMessages((list) =>
      list.map((message) =>
        message.id === answerId
          ? { ...message, streaming: false, outcome: outcome === "aborted" && message.content ? "cut" : outcome }
          : message,
      ),
    );
  }

  // câu hỏi gửi kèm lúc mở (đợi một nhịp để không bị gửi hai lần ở chế độ dev)
  useEffect(() => {
    if (!question) return;
    const timer = window.setTimeout(() => void send(question), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    // isComposing: đang gõ dấu tiếng Việt bằng bộ gõ thì Enter chưa phải là gửi
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    inputRef.current?.focus();
  }

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 639px)").matches) onClose();
  };

  const tooLong = input.length > MAX_QUESTION;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-label={pick(ui.ask.title, lang)}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "bottom right" }}
      className="card fixed inset-0 z-[70] flex flex-col overflow-hidden outline-none sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:w-[400px] sm:rounded-2xl sm:shadow-[0_40px_120px_-30px_var(--glow-blue)] print:hidden"
    >
      {/* đầu khung */}
      <div className="flex items-center gap-3 border-b border-border px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <span className="relative size-10 shrink-0">
          <span className="relative block size-10 overflow-hidden rounded-full ring-2 ring-brand-blue/40">
            <Avatar sizes="40px" />
          </span>
          <span className="bg-brand absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full text-white ring-2 ring-[var(--card-from)]">
            <LuSparkles className="size-3" aria-hidden="true" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-extrabold">
            <T v={ui.ask.title} />
          </p>
          <p className="truncate text-xs text-muted">
            <T v={ui.ask.subtitle} />
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            aria-label={pick(ui.ask.newChat, lang)}
            title={pick(ui.ask.newChat, lang)}
            className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-chip hover:text-fg"
          >
            <LuRotateCcw className="size-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={pick(ui.ask.close, lang)}
          className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-chip hover:text-fg"
        >
          <LuX className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* các tin nhắn */}
      <div
        ref={logRef}
        role="log"
        aria-busy={streaming}
        onScroll={(event) => {
          const el = event.currentTarget;
          stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <Bubble role="assistant">
          <p>
            <T v={ui.ask.welcome} />
          </p>
        </Bubble>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pl-1">
            {ui.ask.suggestions.map((suggestion) => (
              <button
                key={suggestion.en}
                type="button"
                onClick={() => void send(pick(suggestion, lang))}
                className="rounded-full border border-brand-blue/30 bg-chip px-3 py-1.5 text-left text-xs font-semibold text-chip-fg transition-colors hover:border-brand-blue hover:text-fg"
              >
                <T v={suggestion} />
              </button>
            ))}
          </div>
        )}

        {messages.map((message) =>
          message.role === "user" ? (
            <Bubble key={message.id} role="user">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </Bubble>
          ) : (
            <Bubble key={message.id} role="assistant">
              {message.content ? (
                <div className="space-y-2">
                  <RichText text={message.content} onNavigate={closeOnMobile} linkClassName="font-semibold text-brand-blue underline underline-offset-2" />
                  {message.streaming && <span aria-hidden="true" className="caret -mb-0.5 inline-block h-4 w-1.5 rounded-sm bg-brand-sky" />}
                </div>
              ) : message.streaming ? (
                <span className="flex items-center gap-2 text-muted">
                  <span aria-hidden="true" className="ask-dots flex gap-1">
                    <span />
                    <span />
                    <span />
                  </span>
                  <T v={ui.ask.thinking} />
                </span>
              ) : null}
              {message.outcome === "cut" && (
                <p className="mt-1 text-xs text-muted">
                  <T v={ui.ask.cut} />
                </p>
              )}
              {message.outcome && notices[message.outcome] && (
                <p className={`flex gap-2 ${message.content ? "mt-2" : ""}`}>
                  <LuCircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span>
                    <T v={notices[message.outcome]!} />
                    {(message.outcome === "not_configured" || message.outcome === "quota") && (
                      <>
                        {" "}
                        <a href={`mailto:${profile.email}`} className="font-semibold text-brand-blue underline underline-offset-2">
                          {profile.email}
                        </a>
                      </>
                    )}
                  </span>
                </p>
              )}
            </Bubble>
          ),
        )}
      </div>

      {/* ô nhập */}
      <form onSubmit={onSubmit} className="border-t border-border px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-input p-1.5 pl-3.5 transition-colors focus-within:border-brand-blue">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              const el = event.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
            onKeyDown={onKeyDown}
            rows={1}
            aria-label={pick(ui.ask.placeholder, lang)}
            aria-invalid={tooLong || undefined}
            placeholder={pick(ui.ask.placeholder, lang)}
            className="command-input max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 outline-none placeholder:text-muted/70 sm:text-sm"
          />
          {streaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label={pick(ui.ask.stop, lang)}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-fg transition-colors hover:border-brand-blue"
            >
              <LuSquare className="size-3.5 fill-current" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || tooLong}
              aria-label={pick(ui.ask.send, lang)}
              className="bg-brand grid size-9 shrink-0 place-items-center rounded-xl text-white transition-opacity disabled:opacity-40"
            >
              <LuArrowUp className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-2 flex items-center justify-between gap-3 px-1 text-[11px] leading-snug text-muted">
          <span>
            <T v={ui.ask.disclaimer} />{" "}
            <a href={`mailto:${profile.email}`} className="underline underline-offset-2 hover:text-fg">
              {profile.name}
            </a>
            .
          </span>
          {input.length > MAX_QUESTION - 100 && (
            <span className={`shrink-0 tabular-nums ${tooLong ? "font-bold text-amber-500" : ""}`}>
              {input.length}/{MAX_QUESTION}
            </span>
          )}
        </p>
      </form>
    </motion.div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-brand max-w-[85%] rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm leading-relaxed text-white">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-border bg-input px-3.5 py-2.5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
