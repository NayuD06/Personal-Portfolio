import Image from "next/image";
import { FaGithub } from "react-icons/fa6";
import { LuDownload, LuMail } from "react-icons/lu";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import type { IconName } from "@/lib/icons";
import { linkProps } from "@/lib/site";
import { CountUp } from "../ui/count-up";
import { Reveal } from "../ui/reveal";
import { TechIcon } from "../ui/tech-icon";

const github = profile.socials.find((s) => s.icon === "github");
const badgeIcons: IconName[] = ["typescript", "react", "nestjs", "python"];

export function About() {
  return (
    <section id="about" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="font-mono text-sm text-brand-blue" aria-hidden="true">
              {"<about />"}
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              <T v={ui.about.title} />
            </h2>
          </Reveal>

          {profile.about.map((paragraph, i) => (
            <Reveal key={pick(paragraph, "en")} delay={0.1 + i * 0.1}>
              <p className="mt-6 max-w-[62ch] leading-relaxed text-muted">
                <T v={paragraph} />
              </p>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <dl className="mt-10 grid grid-cols-3 divide-x divide-border border-y border-border">
              {profile.stats.map((stat) => (
                <div key={stat.value + pick(stat.label, "en")} className="flex flex-col-reverse px-3 py-5 first:pl-0 sm:px-6">
                  <dt className="mt-1 text-xs text-muted sm:text-sm">
                    <T v={stat.label} />
                  </dt>
                  <dd className="text-gradient font-heading text-3xl font-black sm:text-5xl">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.4} className="mt-10 flex flex-wrap gap-3">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                download
                className="bg-brand shine inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-sky)] transition-transform hover:scale-[1.03]"
              >
                <LuDownload className="size-4" aria-hidden="true" />
                <T v={ui.about.resume} />
              </a>
            ) : (
              github && (
                <a
                  href={github.href}
                  {...linkProps(github.href)}
                  className="bg-brand shine inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-sky)] transition-transform hover:scale-[1.03]"
                >
                  <FaGithub className="size-4" aria-hidden="true" />
                  <T v={ui.about.github} />
                </a>
              )
            )}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-7 py-3.5 font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              <LuMail className="size-4" aria-hidden="true" />
              <T v={ui.about.contact} />
            </a>
          </Reveal>
        </div>

        <Reveal from="right" className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div aria-hidden="true" className="bg-brand absolute -inset-3 rounded-[2rem] opacity-25 blur-2xl" />
          {profile.aboutPhoto ? (
            <div className="card relative aspect-[4/5] rotate-2 overflow-hidden rounded-[2rem] p-1.5 shadow-[0_30px_80px_-30px_var(--glow-blue)] transition-transform duration-500 hover:rotate-0">
              <div className="group relative size-full overflow-hidden rounded-[1.6rem]">
                <Image
                  src={profile.aboutPhoto}
                  alt={profile.name}
                  fill
                  sizes="(min-width: 1024px) 26rem, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#04070d]/70 to-transparent" />
              </div>
            </div>
          ) : (
            <CodeCard />
          )}

          {/* huy hiệu nhỏ dưới ảnh */}
          <div className="card absolute -bottom-6 -left-4 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-[0_20px_50px_-20px_var(--glow-blue)] sm:-left-8">
            {badgeIcons.map((name) => (
              <span key={name} className="grid size-9 place-items-center rounded-lg bg-chip">
                <TechIcon name={name} brandColor className="size-5" />
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Khung "trình soạn code" thay cho ảnh khi chưa có ảnh đại diện. */
function CodeCard() {
  const key = "text-sky-400";
  const str = "text-sky-200";
  const punct = "text-slate-400";
  const stack = ["TypeScript", "NestJS", "Next.js", "Python"];

  return (
    <div className="card relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_var(--glow-blue)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#0a1324] px-5 py-3.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-slate-400">developer.ts</span>
      </div>
      <pre className="overflow-x-auto bg-[#060b16] p-6 font-mono text-[13px] leading-7 text-slate-200 sm:text-sm">
        <code>
          <span className="text-blue-400">const</span> <span className="text-blue-300">developer</span>{" "}
          <span className={punct}>=</span> <span className={punct}>{"{"}</span>
          {"\n  "}
          <span className={key}>name</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;{profile.name}&quot;</span>
          <span className={punct}>,</span>
          {"\n  "}
          <span className={key}>role</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;{pick(profile.roles[0], "en")}&quot;</span>
          <span className={punct}>,</span>
          {"\n  "}
          <span className={key}>stack</span>
          <span className={punct}>: [</span>
          {stack.map((tech, i) => (
            <span key={tech}>
              {"\n    "}
              <span className={str}>&quot;{tech}&quot;</span>
              {i < stack.length - 1 && <span className={punct}>,</span>}
            </span>
          ))}
          {"\n  "}
          <span className={punct}>],</span>
          {"\n  "}
          <span className={key}>openToWork</span>
          <span className={punct}>: </span>
          <span className="text-cyan-300">true</span>
          <span className={punct}>,</span>
          {"\n"}
          <span className={punct}>{"};"}</span>
          <span className="caret ml-1 inline-block h-4 w-2 translate-y-0.5 bg-sky-400" />
        </code>
      </pre>
    </div>
  );
}
