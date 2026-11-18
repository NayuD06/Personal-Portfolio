"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import {
  LuCircleAlert,
  LuCircleCheck,
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
import { useLang } from "@/lib/use-lang";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";
import { TechIcon } from "../ui/tech-icon";

// Muốn form gửi thẳng về email: tạo form miễn phí ở https://formspree.io,
// rồi đặt NEXT_PUBLIC_FORMSPREE_ID (vd. "xyzabcd") trong file .env.local và trên Vercel.
// Chưa đặt thì nút gửi sẽ mở ứng dụng email với nội dung đã điền sẵn.
const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-fg placeholder:text-muted/70 outline-none transition-all focus:border-brand-blue focus:shadow-[0_0_0_4px_var(--glow-blue)]";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const lang = useLang();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;

    if (!formspreeId) {
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
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
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
    <section id="contact" className="section-wash relative py-24 sm:py-32">
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
              className="card rounded-3xl p-6 shadow-[0_30px_80px_-40px_var(--glow-blue)] sm:p-8"
            >
              <h3 className="mb-6 text-xl font-bold">
                <T v={ui.contact.formTitle} />
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={ui.contact.name} htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder={pick(ui.contact.namePlaceholder, lang)}
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.email} htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.phone} htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={optional}
                    className={fieldClass}
                  />
                </Field>
                <Field label={ui.contact.company} htmlFor="company">
                  <input
                    id="company"
                    name="company"
                    autoComplete="organization"
                    placeholder={optional}
                    className={fieldClass}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label={ui.contact.message} htmlFor="message">
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder={pick(ui.contact.messagePlaceholder, lang)}
                    className={`${fieldClass} resize-none`}
                  />
                </Field>
              </div>

              <motion.button
                type="submit"
                disabled={status === "sending"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand shine mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-[0_14px_34px_-12px_var(--glow-sky)] disabled:opacity-70"
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

              <AnimatePresence>
                {(status === "sent" || status === "error") && (
                  <motion.p
                    role="status"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${
                      status === "sent" ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {status === "sent" ? (
                      <>
                        <LuCircleCheck className="size-5" aria-hidden="true" />{" "}
                        <T v={ui.contact.sent} />
                      </>
                    ) : (
                      <>
                        <LuCircleAlert className="size-5" aria-hidden="true" />{" "}
                        <T v={ui.contact.error} />
                      </>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
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
  children,
}: {
  label: Text;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        <T v={label} />
      </label>
      {children}
    </div>
  );
}
