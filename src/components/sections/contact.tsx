"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties, type FormEvent } from "react";
import {
  LuCircleAlert,
  LuLoaderCircle,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSend,
} from "react-icons/lu";
import { profile } from "@/data/profile";
import { linkProps } from "@/lib/site";
import { ui } from "@/data/ui";
import { pick, T, type Text } from "@/lib/i18n";
import { getTurnstileToken, warmTurnstile } from "@/lib/turnstile-client";
import { useLang } from "@/lib/use-lang";
import { SentCard, type SentInfo } from "../contact/sent-card";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";
import { TechIcon } from "../ui/tech-icon";

// Form gửi tới /api/contact (src/app/api/contact/route.ts), server gửi email về cho bạn qua Resend.
// Khi chưa đặt RESEND_API_KEY, nút gửi sẽ mở ứng dụng email của người xem với nội dung đã điền sẵn.

type Status = "idle" | "sending" | "sent" | "error" | "verify";

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-fg placeholder:text-muted/90 outline-none transition-all focus:border-brand-blue focus:shadow-[0_0_0_4px_var(--glow-blue)]";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [sentInfo, setSentInfo] = useState<SentInfo | null>(null);
  const lang = useLang();
  // đã quay lại form sau khi gửi: các ô hiện lại lần lượt (class form-return trong globals.css)
  const [returned, setReturned] = useState(false);
  const isSent = status === "sent" && sentInfo !== null;

  function sendAnother() {
    setStatus("idle");
    setSentInfo(null);
    setReturned(true);
    requestAnimationFrame(() => document.getElementById("name")?.focus({ preventScroll: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;

    setStatus("sending");
    try {
      // mã chống bot của Cloudflare Turnstile (không có gì nếu chưa đặt key)
      const turnstileToken = await getTurnstileToken("contact");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // gửi kèm ngôn ngữ đang xem để email báo cho bạn biết nên trả lời bằng tiếng gì
        body: JSON.stringify({ ...data, lang, turnstileToken }),
      });
      if (response.status === 503) {
        // server chưa cấu hình gửi email: mở ứng dụng email thay thế
        setStatus("idle");
        openMailApp(data);
        return;
      }
      if (response.status === 403) {
        // không tải được ô xác minh (vd. trình chặn quảng cáo chặn Cloudflare): mở ứng dụng email để vẫn liên hệ được
        if (!turnstileToken) {
          setStatus("idle");
          openMailApp(data);
          return;
        }
        setStatus("verify");
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      setSentInfo({
        name: data.name.trim().replace(/\s+/g, " "),
        email: data.email.trim(),
        time: new Date().toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }),
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  function openMailApp(data: Record<string, string>) {
    const subject = `${pick(ui.contact.mailSubject, lang)} ${data.name}`;
    const body = [
      data.message,
      "",
      `${pick(ui.contact.name, lang)}: ${data.name}`,
      `Email: ${data.email}`,
      data.phone && `${pick(ui.contact.phone, lang)}: ${data.phone}`,
      data.company && `${pick(ui.contact.company, lang)}: ${data.company}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const details = [
    {
      icon: LuMail,
      label: ui.contact.emailLabel,
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.phone && {
      icon: LuPhone,
      label: ui.contact.phoneLabel,
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s/g, "")}`,
    },
    {
      icon: LuMapPin,
      label: ui.contact.locationLabel,
      value: profile.location,
    },
  ].filter(Boolean) as {
    icon: typeof LuMail;
    label: Text;
    value: Text;
    href?: string;
  }[];

  const optional = pick(ui.contact.optional, lang);

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          tag="contact"
          title={ui.contact.title}
          subtitle={ui.contact.subtitle}
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <Reveal from="left" className="space-y-3">
            {details.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-muted">
                      <T v={label} />
                    </span>
                    <span className="block font-semibold break-all">
                      <T v={value} />
                    </span>
                  </span>
                </>
              );
              const box =
                "card group flex items-center gap-4 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1";
              return href ? (
                <a key={pick(label, "en")} href={href} className={box}>
                  {content}
                </a>
              ) : (
                <div key={pick(label, "en")} className={box}>
                  {content}
                </div>
              );
            })}

            <div className="pt-5">
              <p className="mb-3 text-sm font-semibold text-muted">
                <T v={ui.contact.findMe} />
              </p>
              <ul className="flex flex-wrap gap-2">
                {profile.socials
                  .filter((social) => social.icon !== "email")
                  .map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        {...linkProps(social.href)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-1 hover:border-brand-blue hover:text-brand-blue"
                      >
                        <TechIcon name={social.icon} className="size-4" />
                        {social.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </Reveal>

          <Reveal from="right">
            <form
              onSubmit={handleSubmit}
              onFocus={warmTurnstile}
              className="card relative rounded-3xl p-6 shadow-[0_30px_80px_-40px_var(--glow-blue)] sm:p-8"
            >
              {/* Khi đã gửi: form mờ đi nhưng vẫn giữ chỗ (thẻ không đổi chiều cao), thẻ cảm ơn hiện đè lên.
                  inert để không bấm hay tab vào được phần form đang ẩn. */}
              <div
                inert={isSent}
                className={isSent ? "opacity-0 transition-opacity duration-300" : returned ? "form-return" : undefined}
              >
              <h3 style={{ "--i": 0 } as CSSProperties} className="return-item mb-6 text-xl font-bold">
                <T v={ui.contact.formTitle} />
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={ui.contact.name} htmlFor="name" index={1}>
                  <input
                    id="name"
                    name="name"
                    maxLength={100}
                    required
                    autoComplete="name"
                    placeholder={pick(ui.contact.namePlaceholder, lang)}
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.email} htmlFor="email" index={2}>
                  <input
                    id="email"
                    name="email"
                    maxLength={200}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.phone} htmlFor="phone" index={3}>
                  <input
                    id="phone"
                    name="phone"
                    maxLength={40}
                    type="tel"
                    autoComplete="tel"
                    placeholder={optional}
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.company} htmlFor="company" index={4}>
                  <input
                    id="company"
                    name="company"
                    maxLength={120}
                    autoComplete="organization"
                    placeholder={optional}
                    className={fieldClass}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label={ui.contact.message} htmlFor="message" index={5}>
                  <textarea
                    id="message"
                    name="message"
                    maxLength={5000}
                    required
                    rows={5}
                    placeholder={pick(ui.contact.messagePlaceholder, lang)}
                    className={`${fieldClass} resize-none`}
                  />
                </Field>
              </div>

              {/* Ô bẫy chống spam: ẩn với người xem, bot tự điền vào sẽ bị bỏ qua */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div style={{ "--i": 6 } as CSSProperties} className="return-item">
              <motion.button
                type="submit"
                disabled={status === "sending"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-strong shine mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-[0_14px_34px_-12px_var(--glow-sky)] disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <LuLoaderCircle
                      className="size-5 animate-spin"
                      aria-hidden="true"
                    />{" "}
                    <T v={ui.contact.sending} />
                  </>
                ) : (
                  <>
                    <T v={ui.contact.send} />{" "}
                    <LuSend className="size-4" aria-hidden="true" />
                  </>
                )}
              </motion.button>
              </div>

              <AnimatePresence>
                {(status === "error" || status === "verify") && (
                  <motion.p
                    role="status"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-500"
                  >
                    <LuCircleAlert className="size-5" aria-hidden="true" /> <T v={status === "verify" ? ui.contact.verifyError : ui.contact.error} />
                  </motion.p>
                )}
              </AnimatePresence>
              </div>

              {isSent && <SentCard info={sentInfo} onReset={sendAnother} />}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  index,
  children,
}: {
  label: Text;
  htmlFor: string;
  /** thứ tự hiện ra khi quay lại form sau khi gửi */
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ "--i": index } as CSSProperties} className="return-item">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        <T v={label} />
      </label>
      {children}
    </div>
  );
}
