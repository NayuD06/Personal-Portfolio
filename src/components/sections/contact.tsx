"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { LuCircleAlert, LuCircleCheck, LuLoaderCircle, LuMail, LuMapPin, LuPhone, LuSend } from "react-icons/lu";
import { profile } from "@/data/profile";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";
import { TechIcon } from "../ui/tech-icon";

// Muốn form gửi thẳng về email: tạo form miễn phí ở https://formspree.io,
// rồi đặt NEXT_PUBLIC_FORMSPREE_ID (vd. "xyzabcd") trong file .env.local và trên Vercel.
// Chưa đặt thì nút gửi sẽ mở ứng dụng email với nội dung đã điền sẵn.
const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full border border-brand-blue/40 bg-input px-5 py-3 text-sm text-fg placeholder:text-muted/70 outline-none transition-all focus:border-brand-sky/70 focus:shadow-[0_0_0_4px_var(--glow-blue)]";
const inputClass = `${fieldClass} rounded-full`;

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (!formspreeId) {
      const subject = `Portfolio contact from ${data.name}`;
      const body = [
        data.message,
        "",
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone && `Phone: ${data.phone}`,
        data.company && `Company: ${data.company}`,
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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
    { icon: LuMail, label: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { icon: LuPhone, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: LuMapPin, label: profile.location },
  ].filter(Boolean) as { icon: typeof LuMail; label: string; href?: string }[];

  return (
    <section id="contact" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Contact Me"
          subtitle="Have a project in mind or an opening on your team? Let's talk about how I can help."
        />

        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal from="left">
            <h3 className="text-2xl font-bold sm:text-3xl">Get in touch today</h3>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              I&apos;m always happy to talk about new projects, internships and ideas worth building. Send a message and
              I&apos;ll get back to you soon.
            </p>

            <ul className="mt-8 space-y-4">
              {details.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {href ? (
                    <a href={href} className="break-all transition-colors hover:text-brand-blue">
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>

            <ul className="mt-8 flex gap-3">
              {profile.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="bg-brand grid size-11 place-items-center rounded-xl text-white transition-transform hover:-translate-y-1"
                  >
                    <TechIcon name={social.icon} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal from="right">
            <form onSubmit={handleSubmit} className="card rounded-3xl p-6 shadow-[0_30px_80px_-40px_var(--glow-blue)] sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="name">
                  <input id="name" name="name" required autoComplete="name" placeholder="Nguyen Van A" className={inputClass} />
                </Field>
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Optional" className={inputClass} />
                </Field>
                <Field label="Company" htmlFor="company">
                  <input
                    id="company"
                    name="company"
                    autoComplete="organization"
                    placeholder="Optional"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Message" htmlFor="message">
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me a little about your project..."
                    className={`${fieldClass} resize-none rounded-2xl`}
                  />
                </Field>
              </div>

              <motion.button
                type="submit"
                disabled={status === "sending"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand shine mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-white shadow-[0_14px_34px_-12px_var(--glow-sky)] disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <LuLoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Sending...
                  </>
                ) : (
                  <>
                    Send message <LuSend className="size-4" aria-hidden="true" />
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
                      status === "sent" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {status === "sent" ? (
                      <>
                        <LuCircleCheck className="size-5" aria-hidden="true" /> Message sent. I&apos;ll reply soon.
                      </>
                    ) : (
                      <>
                        <LuCircleAlert className="size-5" aria-hidden="true" /> Couldn&apos;t send the message. Please
                        email me directly.
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

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
