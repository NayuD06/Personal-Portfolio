import { LuDownload } from "react-icons/lu";
import { FaGithub } from "react-icons/fa6";
import { profile } from "@/data/profile";
import { Avatar } from "../ui/avatar";
import { CountUp } from "../ui/count-up";
import { Reveal } from "../ui/reveal";

const github = profile.socials.find((s) => s.icon === "github");

export function About() {
  return (
    <section id="about" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal from="left" className="relative mx-auto w-full max-w-md">
          <div aria-hidden="true" className="bg-brand absolute -inset-3 rounded-[2rem] opacity-30 blur-2xl" />
          {profile.avatar ? (
            <div className="card relative aspect-[4/5] overflow-hidden rounded-[1.75rem] p-1.5">
              <div className="relative size-full overflow-hidden rounded-3xl">
                <Avatar sizes="(min-width: 1024px) 28rem, 90vw" />
              </div>
            </div>
          ) : (
            <CodeCard />
          )}
        </Reveal>

        <div>
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              About <span className="text-gradient">Me</span>
            </h2>
            <div className="bg-brand mt-4 h-1 w-16 rounded-full" aria-hidden="true" />
          </Reveal>

          {profile.about.map((paragraph, i) => (
            <Reveal key={paragraph} delay={0.1 + i * 0.1}>
              <p className="mt-6 leading-relaxed text-muted">{paragraph}</p>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="card flex flex-col-reverse rounded-2xl px-3 py-4 text-center sm:px-4">
                  <dt className="mt-1 text-xs text-muted sm:text-sm">{stat.label}</dt>
                  <dd className="text-gradient font-heading text-3xl font-extrabold sm:text-4xl">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.4} className="mt-10">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                download
                className="bg-brand shine inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-red)] transition-transform hover:scale-[1.03]"
              >
                Download Resume
                <LuDownload className="size-4" aria-hidden="true" />
              </a>
            ) : (
              github && (
                <a
                  href={github.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand shine inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-red)] transition-transform hover:scale-[1.03]"
                >
                  <FaGithub className="size-4" aria-hidden="true" />
                  View my GitHub
                </a>
              )
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Khung "trình soạn code" thay cho ảnh khi chưa có ảnh đại diện. */
function CodeCard() {
  const key = "text-sky-400";
  const str = "text-amber-300";
  const punct = "text-slate-400";
  const stack = ["TypeScript", "NestJS", "Next.js", "Python"];

  return (
    <div className="card relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_var(--glow-blue)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#0d1830] px-5 py-3.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-slate-400">developer.ts</span>
      </div>
      <pre className="overflow-x-auto bg-[#0b1426] p-6 font-mono text-[13px] leading-7 text-slate-200 sm:text-sm">
        <code>
          <span className="text-fuchsia-400">const</span> <span className="text-blue-300">developer</span>{" "}
          <span className={punct}>=</span> <span className={punct}>{"{"}</span>
          {"\n  "}
          <span className={key}>name</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;{profile.name}&quot;</span>
          <span className={punct}>,</span>
          {"\n  "}
          <span className={key}>role</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;{profile.roles[0]}&quot;</span>
          <span className={punct}>,</span>
          {"\n  "}
          <span className={key}>location</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;{profile.location}&quot;</span>
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
          <span className={key}>loves</span>
          <span className={punct}>: </span>
          <span className={str}>&quot;clean code &amp; shipping&quot;</span>
          <span className={punct}>,</span>
          {"\n  "}
          <span className={key}>openToWork</span>
          <span className={punct}>: </span>
          <span className="text-orange-400">true</span>
          <span className={punct}>,</span>
          {"\n"}
          <span className={punct}>{"};"}</span>
          <span className="caret ml-1 inline-block h-4 w-2 translate-y-0.5 bg-sky-400" />
        </code>
      </pre>
    </div>
  );
}
