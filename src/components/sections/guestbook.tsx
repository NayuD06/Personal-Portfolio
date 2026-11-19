"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { LuCircleAlert, LuCircleCheck, LuLoaderCircle, LuSend, LuShieldCheck, LuTrash2 } from "react-icons/lu";
import { ui } from "@/data/ui";
import { MAX_MESSAGE, MAX_NAME, type GuestbookEntry, type GuestbookError } from "@/lib/guestbook-shared";
import { pick, T, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";

// Sổ lưu bút: khách viết vài dòng, lời nhắn dán lên "tường" ngay. Lời nhắn được tải khi cuộn gần tới mục này
// (không làm chậm lúc mở trang). Dữ liệu lưu trong Upstash Redis qua /api/guestbook (xem README).
// Bạn mở trang với đuôi #gbadmin=<GUESTBOOK_ADMIN_KEY> một lần là hiện nút xóa trên từng lời nhắn.

const PAGE = 12;
const NAME_KEY = "guestbook-name";
const ADMIN_KEY = "guestbook-admin";

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-fg placeholder:text-muted/70 outline-none transition-all focus:border-brand-blue focus:shadow-[0_0_0_4px_var(--glow-blue)]";

/** Màu ảnh đại diện: các tông xanh, chọn theo tên để mỗi người giữ một màu */
const avatarColors = [
  "from-blue-600 to-sky-400",
  "from-sky-500 to-cyan-300",
  "from-blue-800 to-blue-500",
  "from-cyan-600 to-sky-300",
  "from-blue-500 to-cyan-400",
];

function seed(value: string) {
  let total = 0;
  for (const char of value) total = (total * 31 + char.codePointAt(0)!) | 0;
  return Math.abs(total);
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => [...word][0]?.toUpperCase() ?? "").join("") || "?";
}

/** "5 phút trước" / "5 minutes ago"; quá 30 ngày thì hiện ngày */
function timeAgo(at: number, lang: Lang, now: number) {
  const seconds = Math.round((now - at) / 1000);
  if (seconds < 45) return pick(ui.guestbook.justNow, lang);
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return format.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return format.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days <= 30) return format.format(-days, "day");
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(at);
}

type Status = "idle" | "loading" | "ready" | "not_ready" | "error";

export function Guestbook() {
  const lang = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [shown, setShown] = useState(PAGE);
  const [fresh, setFresh] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [admin, setAdmin] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; error?: GuestbookError } | null>(null);
  // lúc mở trang, để nhận ra bot gửi ngay lập tức
  const openedAt = useRef(0);

  // nhớ tên đã gõ lần trước; mã quản lý từ đuôi #gbadmin=...
  useEffect(() => {
    openedAt.current = Date.now();
    const readAdmin = () => {
      try {
        const match = window.location.hash.match(/^#gbadmin=(.+)$/);
        if (match) {
          localStorage.setItem(ADMIN_KEY, decodeURIComponent(match[1]));
          history.replaceState(null, "", `${window.location.pathname}#guestbook`);
          sectionRef.current?.scrollIntoView();
        }
        setAdmin(localStorage.getItem(ADMIN_KEY));
      } catch {
        // trình duyệt chặn lưu trữ: bỏ qua
      }
    };
    const timer = window.setTimeout(() => {
      try {
        setName(localStorage.getItem(NAME_KEY) ?? "");
      } catch {
        // bỏ qua
      }
      readAdmin();
    }, 0);
    window.addEventListener("hashchange", readAdmin);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", readAdmin);
    };
  }, []);

  // cuộn gần tới mục này mới tải lời nhắn
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const load = async () => {
      setStatus("loading");
      try {
        const response = await fetch("/api/guestbook");
        const data = (await response.json()) as { ready: boolean; entries: GuestbookEntry[] };
        setNow(Date.now());
        if (!data.ready) return setStatus("not_ready");
        if (!response.ok) return setStatus("error");
        setEntries(data.entries);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void load();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = new FormData(event.currentTarget);
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || [...trimmedMessage].length < 2) return setNotice({ kind: "error", error: "invalid" });

    setSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage, website: form.get("website"), elapsed: Date.now() - openedAt.current }),
      });
      const data = (await response.json().catch(() => ({}))) as { entry?: GuestbookEntry; error?: GuestbookError };
      if (!response.ok || !data.entry) {
        setNotice({ kind: "error", error: data.error ?? "failed" });
        return;
      }
      const entry = data.entry;
      try {
        localStorage.setItem(NAME_KEY, trimmedName);
      } catch {
        // bỏ qua
      }
      setEntries((list) => [entry, ...list.filter((item) => item.id !== entry.id)]);
      setFresh(entry.id);
      setNow(Date.now());
      setStatus("ready");
      setMessage("");
      setNotice({ kind: "ok" });
    } catch {
      setNotice({ kind: "error", error: "failed" });
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!admin) return;
    const response = await fetch(`/api/guestbook?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-key": admin } }).catch(() => null);
    if (response?.status === 403) return exitAdmin();
    if (response?.ok || response?.status === 404) setEntries((list) => list.filter((item) => item.id !== id));
  };

  const exitAdmin = () => {
    try {
      localStorage.removeItem(ADMIN_KEY);
    } catch {
      // bỏ qua
    }
    setAdmin(null);
  };

  const remaining = MAX_MESSAGE - [...message].length;
  const closed = status === "not_ready";
  const count = entries.length >= 60 ? "60+" : String(entries.length);

  return (
    <section ref={sectionRef} id="guestbook" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="guestbook" title={ui.guestbook.title} subtitle={ui.guestbook.subtitle} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,23rem)_1fr] lg:gap-10">
          <Reveal className="lg:sticky lg:top-28">
            <form onSubmit={submit} className="card relative rounded-2xl p-5 sm:p-7" noValidate>
              <h3 className="text-lg font-bold">
                <T v={ui.guestbook.formTitle} />
              </h3>

              <label htmlFor="gb-name" className="mt-5 mb-2 block text-sm font-semibold">
                <T v={ui.guestbook.name} />
              </label>
              <input
                id="gb-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={MAX_NAME}
                autoComplete="nickname"
                placeholder={pick(ui.guestbook.namePlaceholder, lang)}
                disabled={closed}
                className={fieldClass}
              />

              <label htmlFor="gb-message" className="mt-4 mb-2 block text-sm font-semibold">
                <T v={ui.guestbook.message} />
              </label>
              <textarea
                id="gb-message"
                name="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE}
                rows={4}
                placeholder={pick(ui.guestbook.messagePlaceholder, lang)}
                disabled={closed}
                className={`${fieldClass} resize-none`}
              />
              <div className="mt-2 flex items-start justify-between gap-3 text-xs text-muted">
                <span>
                  <T v={ui.guestbook.rules} />
                </span>
                <span className={`shrink-0 font-mono tabular-nums ${remaining < 20 ? "text-amber-500" : ""}`} aria-hidden="true">
                  {remaining}
                </span>
              </div>

              {/* ô bẫy bot: người thật không thấy */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />

              <button
                type="submit"
                disabled={sending || closed}
                className="bg-brand mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-[0_12px_30px_-12px_var(--glow-sky)] transition-[scale,opacity] hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {sending ? <LuLoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LuSend className="size-4" aria-hidden="true" />}
                <T v={sending ? ui.guestbook.sending : ui.guestbook.send} />
              </button>

              <p aria-live="polite" className="mt-3 flex items-start gap-2 text-sm">
                {notice?.kind === "ok" && (
                  <>
                    <LuCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <T v={ui.guestbook.posted} />
                  </>
                )}
                {notice?.kind === "error" && (
                  <>
                    <LuCircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <T v={ui.guestbook.errors[notice.error ?? "failed"]} />
                  </>
                )}
              </p>
            </form>
          </Reveal>

          <div className="min-w-0">
            {admin && (
              <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand-blue/40 bg-chip px-4 py-2.5 text-sm">
                <LuShieldCheck className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
                <span className="flex-1">
                  <T v={ui.guestbook.admin} />
                </span>
                <button type="button" onClick={exitAdmin} className="font-semibold text-brand-blue hover:underline">
                  <T v={ui.guestbook.adminExit} />
                </button>
              </p>
            )}

            {status === "ready" && entries.length > 0 && (
              <p className="mb-4 font-mono text-sm text-muted">
                {entries.length === 1 ? <T v={ui.guestbook.countOne} /> : pick(ui.guestbook.count, lang).replace("{n}", count)}
              </p>
            )}

            {(status === "idle" || status === "loading") && (
              <ul className="columns-1 gap-4 sm:columns-2" aria-label={pick(ui.guestbook.loading, lang)}>
                {[0, 1, 2, 3].map((index) => (
                  <li key={index} className="card mb-4 break-inside-avoid rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <span className="size-10 animate-pulse rounded-full bg-chip" />
                      <span className="h-3 w-28 animate-pulse rounded bg-chip" />
                    </div>
                    <span className="mt-4 block h-3 w-full animate-pulse rounded bg-chip" />
                    <span className={`mt-2 block h-3 animate-pulse rounded bg-chip ${index % 2 ? "w-2/3" : "w-4/5"}`} />
                  </li>
                ))}
              </ul>
            )}

            {(closed || status === "error" || (status === "ready" && entries.length === 0)) && (
              <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted">
                <p className="max-w-sm">
                  <T v={closed ? ui.guestbook.notReady : status === "error" ? ui.guestbook.loadFailed : ui.guestbook.empty} />
                </p>
              </div>
            )}

            {status === "ready" && entries.length > 0 && (
              <ul className="columns-1 gap-4 sm:columns-2">
                <AnimatePresence initial={false}>
                  {entries.slice(0, shown).map((entry) => {
                    const hue = seed(entry.name);
                    // nghiêng nhẹ như giấy dán tường, rê chuột vào thì thẳng lại
                    const tilt = ((seed(entry.id) % 5) - 2) * 0.45;
                    return (
                      <motion.li
                        key={entry.id}
                        initial={entry.id === fresh ? { opacity: 0, scale: 0.85, y: -12 } : false}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        style={{ "--tilt": `${tilt}deg` } as CSSProperties}
                        className={`card relative mb-4 break-inside-avoid rounded-2xl p-5 transition-[rotate] duration-300 rotate-(--tilt) hover:rotate-0 ${
                          entry.id === fresh ? "ring-2 ring-brand-sky/60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={`grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarColors[hue % avatarColors.length]}`}
                          >
                            {initials(entry.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{entry.name}</span>
                            <time dateTime={new Date(entry.at).toISOString()} className="block text-xs text-muted">
                              {timeAgo(entry.at, lang, now)}
                            </time>
                          </span>
                          {admin && (
                            <button
                              type="button"
                              onClick={() => void remove(entry.id)}
                              aria-label={pick(ui.guestbook.remove, lang)}
                              title={pick(ui.guestbook.remove, lang)}
                              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-chip hover:text-fg"
                            >
                              <LuTrash2 className="size-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                        <p className="mt-3 text-[15px] leading-relaxed break-words whitespace-pre-line">{entry.message}</p>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}

            {status === "ready" && entries.length > shown && (
              <button
                type="button"
                onClick={() => setShown((value) => value + PAGE)}
                className="mx-auto mt-2 flex items-center gap-2 rounded-xl border border-border bg-input px-6 py-3 text-sm font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                <T v={ui.guestbook.showMore} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
