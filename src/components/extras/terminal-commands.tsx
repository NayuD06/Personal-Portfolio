"use client";

import { useEffect, useState, type ReactNode } from "react";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { askAssistant, MAX_QUESTION, type AskOutcome, type ChatMessage } from "@/lib/ask-client";
import { foundSecret, readSecrets, secretIds, type SecretId } from "@/lib/extras";
import { pick, T, type Lang, type Text } from "@/lib/i18n";
import { normalize } from "@/lib/normalize";
import { RichText } from "./rich-text";
import { SnakeGame } from "./snake";

// Các lệnh của chế độ Terminal. Chữ hiện ra dùng <T> nên đổi ngôn ngữ là cả màn hình đổi theo.
// Thêm lệnh mới: thêm một mục vào mảng `commands` bên dưới.

export type CommandContext = {
  args: string[];
  lang: Lang;
  isDark: boolean;
  history: string[];
  /** chạy một lệnh khác (khi bấm vào tên dự án, tên lệnh...) */
  run: (command: string) => void;
  /** điền sẵn chữ vào ô lệnh */
  fill: (text: string) => void;
  clear: () => void;
  close: () => void;
  /** đóng terminal rồi mở trang trong site */
  navigate: (href: string) => void;
  /** đặt con trỏ lại vào ô lệnh (vd. sau khi thoát game) */
  focusInput: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setLang: (lang: Lang) => void;
  /** các lượt hỏi AI trước đó, để hỏi tiếp nối được */
  askHistory: ChatMessage[];
};

export type Command = {
  name: string;
  aliases?: string[];
  /** mô tả trong "help". Không có thì là lệnh ẩn. */
  summary?: Text;
  usage?: string;
  /** gợi ý cho Tab sau tên lệnh */
  complete?: () => string[];
  run: (ctx: CommandContext) => ReactNode | void;
};

// ---------- Mảnh giao diện dùng chung ----------

const c = {
  muted: "text-[#7d8db0]",
  blue: "text-[#60a5fa]",
  sky: "text-[#38bdf8]",
  white: "text-white",
  warn: "text-amber-400",
};

function Block({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
}

function Run({ command, children, ctx }: { command: string; children?: ReactNode; ctx: CommandContext }) {
  return (
    <button
      type="button"
      onClick={() => ctx.run(command)}
      className={`${c.sky} underline decoration-[#38bdf8]/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white`}
    >
      {children ?? command}
    </button>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={`${c.sky} underline decoration-[#38bdf8]/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white`}
    >
      {children}
    </a>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <p className={`${c.white} font-bold`}>{children}</p>;
}

/** hai cột: tên bên trái, nội dung bên phải (xuống dòng trên màn hình hẹp) */
function Rows({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[max-content_1fr]">
      {rows.map(([left, right], index) => (
        <div key={index} className="contents">
          <div className={`${c.blue} max-sm:mt-1.5`}>{left}</div>
          <div className="max-sm:pl-3">{right}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Chữ lớn "DUY AN" ----------

const glyphs: Record<string, string[]> = {
  A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  D: ["██████╗ ", "██╔══██╗", "██║  ██║", "██║  ██║", "██████╔╝", "╚═════╝ "],
  N: ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
  U: ["██╗   ██╗", "██║   ██║", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  Y: ["██╗   ██╗", "╚██╗ ██╔╝", " ╚████╔╝ ", "  ╚██╔╝  ", "   ██║   ", "   ╚═╝   "],
  " ": ["   ", "   ", "   ", "   ", "   ", "   "],
};

/** Ghép chữ khối từ tên. Có chữ cái chưa vẽ thì trả về null (hiện tên bằng chữ thường). */
export function bannerOf(text: string) {
  const letters = text.toUpperCase().split("");
  if (!letters.every((letter) => glyphs[letter])) return null;
  return glyphs.A.map((_, row) => letters.map((letter) => glyphs[letter][row]).join("")).join("\n");
}

export function Banner() {
  const art = bannerOf(profile.name);
  if (!art) return <p className="text-gradient font-heading text-3xl font-black">{profile.name}</p>;
  return (
    <pre aria-label={profile.name} className="term-banner text-gradient w-max text-[7px] leading-[1.15] font-bold min-[400px]:text-[9px] sm:text-[13px]">
      {art}
    </pre>
  );
}

// ---------- Trả lời AI ngay trong terminal ----------

const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const askNotices: Partial<Record<AskOutcome, Text>> = {
  not_configured: ui.ask.notConfigured,
  rate_limited: ui.ask.rateLimited,
  busy: ui.ask.busy,
  quota: ui.ask.quota,
  verify: ui.ask.verify,
  error: ui.ask.error,
  refusal: ui.ask.refusal,
  cut: ui.ask.cut,
};

function AskOutput({ question, lang, history, onNavigate }: { question: string; lang: Lang; history: ChatMessage[]; onNavigate: () => void }) {
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<AskOutcome | null>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // đợi một nhịp: ở chế độ dev React chạy effect hai lần, như vậy chỉ gửi một câu hỏi
    const timer = window.setTimeout(async () => {
      let text = "";
      const result = await askAssistant(
        [...history, { role: "user", content: question }],
        lang,
        (chunk) => {
          text += chunk;
          setAnswer(text);
        },
        controller.signal,
      );
      if (result === "aborted") return;
      if ((result === "ok" || result === "cut") && text) history.push({ role: "user", content: question }, { role: "assistant", content: text });
      setOutcome(result);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // chỉ hỏi một lần khi dòng này xuất hiện
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outcome || answer) return;
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % spinner.length), 80);
    return () => window.clearInterval(timer);
  }, [outcome, answer]);

  return (
    <Block>
      <p className={c.blue}>
        <span className="mr-2 rounded bg-[#1d4ed8]/30 px-1.5 py-0.5 text-[11px] font-bold text-[#93c5fd]">AI</span>
        {!answer && !outcome && (
          <span className={c.muted}>
            {spinner[frame]} <T v={ui.ask.thinking} />
            ...
          </span>
        )}
      </p>
      {answer && (
        <div className="space-y-2 text-[#d7e3ff]">
          <RichText text={answer} onNavigate={onNavigate} linkClassName={`${c.sky} underline underline-offset-4`} />
          {!outcome && <span aria-hidden="true" className="caret inline-block h-3.5 w-2 translate-y-[2px] bg-[#38bdf8]" />}
        </div>
      )}
      {outcome && askNotices[outcome] && (
        <p className={outcome === "cut" ? c.muted : c.warn}>
          <T v={askNotices[outcome]!} />
          {(outcome === "not_configured" || outcome === "quota") && (
            <>
              {" "}
              <Ext href={`mailto:${profile.email}`}>{profile.email}</Ext>
            </>
          )}
        </p>
      )}
    </Block>
  );
}

// ---------- Tiện ích ----------

const sectionIds = ["about", "skills", "services", "projects", "education", "journey", "github", "contact"];

function findProject(query: string) {
  const projects = profile.projects;
  const index = Number(query);
  if (Number.isInteger(index) && index >= 1 && index <= projects.length) return projects[index - 1];
  const wanted = normalize(query).replace(/[^a-z0-9]+/g, "");
  if (!wanted) return undefined;
  return (
    projects.find((project) => project.slug.replace(/-/g, "") === wanted) ??
    projects.find((project) => normalize(project.title).replace(/[^a-z0-9]+/g, "").includes(wanted))
  );
}

function socialTargets() {
  return profile.socials
    .filter((social) => !social.href.startsWith("mailto:"))
    .map((social) => ({ key: social.label.toLowerCase(), label: social.label, href: social.href }));
}

function openTargets() {
  return [
    ...profile.projects.map((project) => project.slug),
    "cv",
    "home",
    ...sectionIds,
    ...socialTargets().map((social) => social.key),
    "email",
  ];
}

function resumeFile(lang: Lang) {
  return profile.resumeUrl ? pick(profile.resumeUrl, lang) : "";
}

const files = [
  { name: "about.txt", dir: false },
  { name: "contact.md", dir: false },
  { name: "cv.pdf", dir: false },
  { name: "education/", dir: true },
  { name: "projects/", dir: true },
  { name: "skills/", dir: true },
];

const secretText: Record<SecretId, { title: Text; hint: Text }> = {
  konami: {
    title: ui.secrets.konami.title,
    hint: {
      en: "an old cheat code, typed on the main page (it starts with ↑ ↑; on a phone, swipe it)",
      vi: "một mã cheat game kinh điển, gõ ở trang chính (bắt đầu bằng ↑ ↑; trên điện thoại thì vuốt)",
    },
  },
  logo: {
    title: ui.secrets.logo.title,
    hint: { en: "a familiar logo that rewards stubborn clicking (five times)", vi: "một cái logo quen thuộc, thưởng cho ai bấm lì (năm lần)" },
  },
  sudo: {
    title: ui.secrets.sudo.title,
    hint: { en: "a command that asks for super powers, right here", vi: "một lệnh xin siêu quyền lực, ngay trong terminal này" },
  },
  matrix: {
    title: ui.secrets.matrix.title,
    hint: {
      en: "type my name (lowercase, no space) anywhere on the site, or right here",
      vi: "gõ tên mình (viết thường, liền, không dấu) ở bất kỳ đâu trên trang, hoặc ngay tại đây",
    },
  },
  console: {
    title: ui.secrets.console.title,
    hint: { en: "every developer knows where the console lives (F12)", vi: "dân dev ai cũng biết Console nằm ở đâu mà (F12)" },
  },
  shake: {
    title: ui.secrets.shake.title,
    hint: { en: "shake your mouse (or phone) like you mean it", vi: "lắc chuột (hoặc điện thoại) thật mạnh vào" },
  },
  rmrf: {
    title: ui.secrets.rmrf.title,
    hint: { en: "the most dangerous command in Linux, right here", vi: "câu lệnh nguy hiểm nhất của Linux, gõ ngay tại đây" },
  },
  nightowl: {
    title: ui.secrets.nightowl.title,
    hint: { en: "come back while most people are asleep", vi: "ghé lại vào lúc mọi người đã ngủ say" },
  },
  pixel: {
    title: ui.secrets.pixel.title,
    hint: {
      en: "the photo at the top of the page loves a double-click (keyboard: Tab to it, press Enter)",
      vi: "tấm ảnh ở đầu trang thích được nhấp đúp (bàn phím: Tab tới rồi nhấn Enter)",
    },
  },
  snake: {
    title: ui.secrets.snake.title,
    hint: { en: "the most famous Nokia phone game, typed as a command right here", vi: "trò chơi huyền thoại trên điện thoại Nokia, gõ tên nó thành lệnh ngay tại đây" },
  },
};

const coffeeArt = String.raw`    ( (
     ) )
  ........
  |      |]
  \      /
   '----'`;

/** rm -rf /: giả vờ xóa sạch từng file một, rồi thú nhận là đùa (và mở khóa bí mật) */
const wipeTargets = [
  "/home/guest/projects/",
  "/home/guest/skills/",
  "/home/guest/education/",
  "/home/guest/about.txt",
  "/home/guest/cv.pdf",
  "/usr/bin/coffee",
  "/var/lib/motivation",
  "/etc/sleep.conf",
  "/dev/brain",
];

function Wipe() {
  const [step, setStep] = useState(0);
  const total = wipeTargets.length + 2;
  useEffect(() => {
    if (step >= total) {
      foundSecret("rmrf");
      return;
    }
    const timer = window.setTimeout(() => setStep((value) => value + 1), step < wipeTargets.length ? 130 : 700);
    return () => window.clearTimeout(timer);
  }, [step, total]);

  const percent = Math.min(100, Math.round((Math.min(step, wipeTargets.length) / wipeTargets.length) * 100));
  const bar = "█".repeat(Math.round(percent / 5)).padEnd(20, "░");
  return (
    <Block>
      {wipeTargets.slice(0, step).map((target) => (
        <p key={target} className={c.muted}>
          removed &apos;{target}&apos;
        </p>
      ))}
      <p className={c.warn}>
        [{bar}] {percent}%
      </p>
      {step > wipeTargets.length && (
        <p className={`font-bold ${c.warn}`}>
          <T v={{ en: "System destroyed. Portfolio deleted. Goodbye.", vi: "Hệ thống đã bị phá hủy. Portfolio đã bị xóa. Vĩnh biệt." }} />
        </p>
      )}
      {step > wipeTargets.length + 1 && (
        <p className={c.sky}>
          <T
            v={{
              en: "...just kidding 😅 Nothing was deleted. Ctrl+Z is always on around here.",
              vi: "...đùa thôi 😅 Chưa có gì bị xóa cả. Ở đây Ctrl+Z lúc nào cũng bật sẵn.",
            }}
          />
        </p>
      )}
    </Block>
  );
}

// ---------- Danh sách lệnh ----------

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["giupdo", "trogiup", "?", "man"],
    summary: { en: "List the commands", vi: "Xem danh sách lệnh" },
    run: (ctx) => (
      <Block>
        <Heading>
          <T v={{ en: "Available commands", vi: "Các lệnh có thể dùng" }} />
        </Heading>
        <Rows
          rows={commands
            .filter((command) => command.summary)
            .map((command) => [
              command.usage ? (
                <button type="button" onClick={() => ctx.fill(`${command.name} `)} className="text-left hover:text-white">
                  {command.usage}
                </button>
              ) : (
                <Run ctx={ctx} command={command.name} />
              ),
              <span key={command.name} className={c.muted}>
                <T v={command.summary!} />
              </span>,
            ])}
        />
        <p className={`${c.muted} pt-1`}>
          <T v={{ en: "Psst: a few commands are hidden. Type", vi: "Bật mí: có vài lệnh ẩn đấy. Gõ" }} /> <Run ctx={ctx} command="secrets" />{" "}
          <T v={{ en: "for hints.", vi: "để xem gợi ý." }} />
        </p>
      </Block>
    ),
  },
  {
    name: "about",
    aliases: ["gioithieu", "bio"],
    summary: { en: "Who I am", vi: "Mình là ai" },
    run: (ctx) => (
      <Block className="space-y-2">
        <p>
          <span className={`${c.white} font-bold`}>{profile.name}</span>
          <span className={c.muted}>, {pick(profile.roles[0], ctx.lang)}</span>
        </p>
        <p className="text-[#d7e3ff]">
          <T v={profile.intro} />
        </p>
        {profile.about.map((paragraph, index) => (
          <p key={index} className={c.muted}>
            <T v={paragraph} />
          </p>
        ))}
        {profile.availability && (
          <p className={c.sky}>
            ● <T v={profile.availability} />
          </p>
        )}
        <p className={c.muted}>
          <T v={{ en: "Next:", vi: "Xem tiếp:" }} /> <Run ctx={ctx} command="skills" />, <Run ctx={ctx} command="projects" />,{" "}
          <Run ctx={ctx} command="contact" />
        </p>
      </Block>
    ),
  },
  {
    name: "skills",
    aliases: ["kynang", "stack"],
    summary: { en: "Languages, frameworks and tools", vi: "Ngôn ngữ, framework và công cụ" },
    run: () => (
      <Block>
        <p className={c.blue}>skills/</p>
        {profile.skills.map((skill, index) => {
          const last = index === profile.skills.length - 1;
          return (
            <div key={index} className="grid grid-cols-[2ch_1fr] gap-x-1">
              <span className={c.muted}>{last ? "└─" : "├─"}</span>
              <span className={`${c.white} font-bold`}>
                <T v={skill.name} />
              </span>
              <span className={c.muted}>{last ? " " : "│"}</span>
              <span className={c.muted}>
                <T v={skill.description} />
                <br />
                <span className={c.sky}>{skill.tools.join(", ")}</span>
              </span>
            </div>
          );
        })}
        <p className={`${c.muted} pt-1`}>
          <T v={{ en: "Also:", vi: "Ngoài ra:" }} /> {profile.techMarquee.join(", ")}
        </p>
      </Block>
    ),
  },
  {
    name: "projects",
    aliases: ["duan", "project", "work"],
    summary: { en: "Things I've built (projects 1 for details)", vi: "Những gì mình đã làm (projects 1 để xem chi tiết)" },
    complete: () => profile.projects.map((project) => project.slug),
    run: (ctx) => {
      if (ctx.args.length) {
        const project = findProject(ctx.args.join(" "));
        if (!project) {
          return (
            <p className={c.warn}>
              projects: <T v={{ en: "no project matches", vi: "không có dự án nào khớp với" }} /> “{ctx.args.join(" ")}”.{" "}
              <Run ctx={ctx} command="projects">
                <T v={{ en: "See the list", vi: "Xem danh sách" }} />
              </Run>
            </p>
          );
        }
        return (
          <Block className="space-y-2">
            <p>
              <span className={`${c.white} font-bold`}>{project.title}</span>
              <span className={c.muted}>
                {" "}
                ({project.year}, {project.categories.join(" / ")})
              </span>
            </p>
            <p className="text-[#d7e3ff]">
              <T v={project.description} />
            </p>
            <div>
              <Heading>
                <T v={ui.project.problem} />
              </Heading>
              <p className={c.muted}>
                <T v={project.problem} />
              </p>
            </div>
            <div>
              <Heading>
                <T v={ui.project.features} />
              </Heading>
              {project.features.map((feature, index) => (
                <p key={index} className={c.muted}>
                  <span className={c.sky}>› </span>
                  <T v={feature} />
                </p>
              ))}
            </div>
            <p>
              <span className={c.blue}>
                <T v={ui.project.stack} />:
              </span>{" "}
              {project.tags.join(", ")}
            </p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <Run ctx={ctx} command={`open ${project.slug}`}>
                <T v={ui.projects.details} />
              </Run>
              {project.githubUrl && (
                <Ext href={project.githubUrl}>
                  <T v={ui.projects.code} />
                </Ext>
              )}
              {project.liveUrl && (
                <Ext href={project.liveUrl}>
                  <T v={ui.projects.live} />
                </Ext>
              )}
            </p>
          </Block>
        );
      }
      return (
        <Block>
          <div className="grid grid-cols-[2ch_1fr_auto] gap-x-3 gap-y-1 sm:w-max sm:grid-cols-[2ch_max-content_max-content_max-content] sm:gap-x-6">
            <span className={c.muted}>#</span>
            <span className={c.muted}>
              <T v={{ en: "PROJECT", vi: "DỰ ÁN" }} />
            </span>
            <span className={c.muted}>
              <T v={{ en: "YEAR", vi: "NĂM" }} />
            </span>
            <span className={`${c.muted} max-sm:hidden`}>
              <T v={{ en: "TYPE", vi: "LOẠI" }} />
            </span>
            {profile.projects.map((project, index) => (
              <div key={project.slug} className="contents">
                <span className={c.muted}>{index + 1}</span>
                <span>
                  <Run ctx={ctx} command={`projects ${index + 1}`}>
                    {project.title}
                  </Run>
                  {project.featured && <span className={c.warn}> ★</span>}
                </span>
                <span className={c.muted}>{project.year}</span>
                <span className={`${c.muted} max-sm:hidden`}>{project.categories.join(", ")}</span>
              </div>
            ))}
          </div>
          <p className={`${c.muted} pt-1`}>
            <T v={{ en: "Click a name, or type", vi: "Bấm vào tên, hoặc gõ" }} /> <span className={c.white}>projects 1</span>{" "}
            <T v={{ en: "for details.", vi: "để xem chi tiết." }} />
          </p>
        </Block>
      );
    },
  },
  {
    name: "education",
    aliases: ["hocvan", "school", "edu"],
    summary: { en: "Where I study", vi: "Mình học ở đâu" },
    run: () => (
      <Block className="space-y-3">
        {profile.education.map((school) => (
          <div key={school.short}>
            <p>
              <span className={`${c.white} font-bold`}>
                <T v={school.school} />
              </span>{" "}
              <span className={c.muted}>({school.short})</span>
            </p>
            <p className={c.sky}>
              <T v={school.program} />, <T v={school.period} />, <T v={school.status} />
            </p>
            <p className={c.muted}>
              <T v={school.description} />
            </p>
            <p className={c.muted}>
              <span className={c.blue}>›</span>{" "}
              {school.subjects.map((subject, index) => (
                <span key={index}>
                  {index > 0 && ", "}
                  <T v={subject} />
                </span>
              ))}
            </p>
          </div>
        ))}
      </Block>
    ),
  },
  {
    name: "contact",
    aliases: ["lienhe", "email", "mail"],
    summary: { en: "How to reach me", vi: "Cách liên hệ với mình" },
    run: (ctx) => (
      <Block>
        <Rows
          rows={[
            ["Email", <Ext key="email" href={`mailto:${profile.email}`}>{profile.email}</Ext>],
            ...(profile.phone ? [[<T key="p" v={ui.contact.phoneLabel} />, profile.phone] as [ReactNode, ReactNode]] : []),
            [<T key="l" v={ui.contact.locationLabel} />, <T key="lv" v={profile.location} />],
            ...socialTargets().map(
              (social) =>
                [social.label, <Ext key={social.key} href={social.href}>{social.href.replace(/^https?:\/\/(www\.)?/, "")}</Ext>] as [ReactNode, ReactNode],
            ),
          ]}
        />
        <p className={`${c.muted} pt-1`}>
          <T v={{ en: "Prefer a form?", vi: "Thích dùng form hơn?" }} /> <Run ctx={ctx} command="open contact" />
        </p>
      </Block>
    ),
  },
  {
    name: "cv",
    aliases: ["resume"],
    summary: { en: "Download my CV (cv open to read it here)", vi: "Tải CV của mình (cv open để xem trên web)" },
    complete: () => ["open"],
    run: (ctx) => {
      const file = resumeFile(ctx.lang);
      if (ctx.args[0] === "open" || ctx.args[0] === "view" || !file) {
        ctx.navigate("/cv");
        return (
          <p className={c.muted}>
            <T v={{ en: "Opening", vi: "Đang mở" }} /> /cv ...
          </p>
        );
      }
      const link = document.createElement("a");
      link.href = file;
      link.download = "";
      link.click();
      return (
        <Block>
          <p>
            <T v={{ en: "Downloading", vi: "Đang tải" }} /> <span className={c.sky}>{file.split("/").pop()}</span> ...{" "}
            <span className={c.blue}>
              <T v={{ en: "done", vi: "xong" }} />
            </span>
          </p>
          <p className={c.muted}>
            <T v={{ en: "Want to read it here instead?", vi: "Muốn xem ngay trên web?" }} /> <Run ctx={ctx} command="cv open" />
          </p>
        </Block>
      );
    },
  },
  {
    name: "ask",
    aliases: ["hoi", "ai", "chat"],
    usage: "ask <question>",
    summary: { en: "Ask the AI assistant anything about me", vi: "Hỏi trợ lý AI bất cứ điều gì về mình" },
    run: (ctx) => {
      const question = ctx.args.join(" ").trim();
      if (!question) {
        ctx.fill("ask ");
        return (
          <p className={c.muted}>
            <T v={{ en: "Usage: ask <question>, e.g.", vi: "Cách dùng: ask <câu hỏi>, ví dụ" }} />{" "}
            <Run ctx={ctx} command={`ask ${pick(ui.ask.suggestions[0], ctx.lang)}`}>
              ask {pick(ui.ask.suggestions[0], ctx.lang)}
            </Run>
          </p>
        );
      }
      if (question.length > MAX_QUESTION) {
        return <p className={c.warn}>{pick(ui.ask.tooLong, ctx.lang).replace("{max}", String(MAX_QUESTION))}</p>;
      }
      return <AskOutput question={question} lang={ctx.lang} history={ctx.askHistory} onNavigate={ctx.close} />;
    },
  },
  {
    name: "neofetch",
    aliases: ["fastfetch", "sysinfo"],
    summary: { en: "System info, portfolio edition", vi: "Thông tin hệ thống, phiên bản portfolio" },
    run: (ctx) => {
      const logo = bannerOf(profile.initials);
      const minutes = Math.max(1, Math.round(performance.now() / 60000));
      const school = profile.education[0];
      const info: [string, ReactNode][] = [
        [pick({ en: "Name", vi: "Tên" }, ctx.lang), profile.name],
        [pick({ en: "Role", vi: "Vai trò" }, ctx.lang), <T key="r" v={profile.roles[0]} />],
        [pick({ en: "Location", vi: "Nơi ở" }, ctx.lang), <T key="l" v={profile.location} />],
        [
          pick({ en: "Studying", vi: "Đang học" }, ctx.lang),
          <span key="s">
            <T v={school.program} /> @ {school.short} (<T v={school.status} />)
          </span>,
        ],
        [pick({ en: "Stack", vi: "Công nghệ" }, ctx.lang), "TypeScript, React, Next.js, NestJS, Laravel"],
        [pick({ en: "Projects", vi: "Dự án" }, ctx.lang), String(profile.projects.length)],
        ...profile.stats.slice(0, 1).map((stat) => [pick(stat.label, ctx.lang), stat.value] as [string, ReactNode]),
        [pick({ en: "Building", vi: "Đang làm" }, ctx.lang), profile.currentlyBuilding],
        ...(profile.availability ? [[pick({ en: "Status", vi: "Trạng thái" }, ctx.lang), <T key="a" v={profile.availability} />] as [string, ReactNode]] : []),
        ["Shell", "portfolio-sh 1.0"],
        [pick({ en: "Theme", vi: "Giao diện" }, ctx.lang), `${ctx.isDark ? "dark" : "light"}, ${ctx.lang}`],
        ["Uptime", `${minutes} min`],
      ];
      return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          {logo && <pre className="term-banner text-gradient w-max text-[11px] leading-[1.15] font-bold sm:text-[13px]">{logo}</pre>}
          <div className="min-w-0 space-y-0.5">
            <p>
              <span className={`${c.sky} font-bold`}>guest</span>
              <span className={c.muted}>@</span>
              <span className={`${c.sky} font-bold`}>{profile.website}</span>
            </p>
            <p className={c.muted}>{"-".repeat(`guest@${profile.website}`.length)}</p>
            {info.map(([key, value]) => (
              <p key={key}>
                <span className={`${c.blue} font-bold`}>{key}</span>
                <span className={c.muted}>: </span>
                {value}
              </p>
            ))}
            <p className="flex gap-0 pt-2" aria-hidden="true">
              {["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#38bdf8", "#93c5fd", "#e0f2fe"].map((color) => (
                <span key={color} className="h-4 w-6" style={{ background: color }} />
              ))}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    name: "open",
    aliases: ["goto", "mo"],
    usage: "open <name>",
    summary: { en: "Open a project, the CV, GitHub...", vi: "Mở một dự án, CV, GitHub..." },
    complete: openTargets,
    run: (ctx) => {
      const target = (ctx.args[0] ?? "").toLowerCase();
      if (!target) {
        return (
          <Block>
            <p className={c.muted}>
              <T v={{ en: "Usage: open <name>. You can open:", vi: "Cách dùng: open <tên>. Có thể mở:" }} />
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              {openTargets().map((name) => (
                <Run key={name} ctx={ctx} command={`open ${name}`}>
                  {name}
                </Run>
              ))}
            </p>
          </Block>
        );
      }
      const opening = (label: ReactNode) => (
        <p className={c.muted}>
          <T v={{ en: "Opening", vi: "Đang mở" }} /> <span className={c.sky}>{label}</span> ...
        </p>
      );
      const social = socialTargets().find((item) => item.key === target);
      if (social) {
        window.open(social.href, "_blank", "noopener,noreferrer");
        return opening(social.href);
      }
      if (target === "email" || target === "mail") {
        window.location.href = `mailto:${profile.email}`;
        return opening(profile.email);
      }
      if (target === "cv") {
        ctx.navigate("/cv");
        return opening("/cv");
      }
      if (target === "home" || target === "~" || target === "/") {
        ctx.navigate("/");
        return opening("/");
      }
      if (sectionIds.includes(target)) {
        ctx.navigate(`/#${target}`);
        return opening(`#${target}`);
      }
      const project = findProject(ctx.args.join(" "));
      if (project) {
        ctx.navigate(`/projects/${project.slug}`);
        return opening(`/projects/${project.slug}`);
      }
      return (
        <p className={c.warn}>
          open: <T v={{ en: "nothing called", vi: "không có mục nào tên" }} /> “{ctx.args.join(" ")}”. <Run ctx={ctx} command="open" />
        </p>
      );
    },
  },
  {
    name: "theme",
    usage: "theme [dark|light]",
    summary: { en: "Switch between light and dark", vi: "Đổi giao diện sáng / tối" },
    complete: () => ["dark", "light"],
    run: (ctx) => {
      const wanted = ctx.args[0]?.toLowerCase();
      const next = wanted === "dark" || wanted === "light" ? wanted : ctx.isDark ? "light" : "dark";
      ctx.setTheme(next);
      return (
        <p className={c.muted}>
          <T v={{ en: "Theme set to", vi: "Đã đổi giao diện sang" }} /> <span className={c.sky}>{next}</span>.
        </p>
      );
    },
  },
  {
    name: "lang",
    aliases: ["language", "ngonngu"],
    usage: "lang [en|vi]",
    summary: { en: "Switch language (tiếng Việt / English)", vi: "Đổi ngôn ngữ (tiếng Việt / English)" },
    complete: () => ["en", "vi"],
    run: (ctx) => {
      const wanted = ctx.args[0]?.toLowerCase();
      const next: Lang = wanted === "en" || wanted === "vi" ? wanted : ctx.lang === "en" ? "vi" : "en";
      ctx.setLang(next);
      return <p className={c.muted}>{next === "vi" ? "Đã chuyển sang tiếng Việt." : "Switched to English."}</p>;
    },
  },
  {
    name: "history",
    summary: { en: "Commands you've typed", vi: "Các lệnh bạn đã gõ" },
    run: (ctx) =>
      ctx.history.length ? (
        <Block>
          {ctx.history.map((entry, index) => (
            <p key={index}>
              <span className={`${c.muted} inline-block w-8 text-right`}>{index + 1}</span>
              <span className="ml-3">{entry}</span>
            </p>
          ))}
        </Block>
      ) : (
        <p className={c.muted}>
          <T v={{ en: "No commands yet.", vi: "Chưa có lệnh nào." }} />
        </p>
      ),
  },
  {
    name: "clear",
    aliases: ["cls", "xoa"],
    summary: { en: "Clear the screen (Ctrl + L)", vi: "Xóa màn hình (Ctrl + L)" },
    run: (ctx) => ctx.clear(),
  },
  {
    name: "exit",
    aliases: ["quit", "q", "thoat", "logout"],
    summary: { en: "Back to the normal site (Esc)", vi: "Về lại trang bình thường (Esc)" },
    run: (ctx) => ctx.close(),
  },

  // ----- lệnh ẩn -----
  {
    name: "secrets",
    aliases: ["bimat", "secret", "hint", "hints"],
    run: () => {
      const found = readSecrets();
      return (
        <Block>
          <p className={c.white}>
            <T
              v={{
                en: ui.secrets.progress.en.replace("{found}", String(found.length)).replace("{total}", String(secretIds.length)),
                vi: ui.secrets.progress.vi.replace("{found}", String(found.length)).replace("{total}", String(secretIds.length)),
              }}
            />
          </p>
          {secretIds.map((id) => (
            <p key={id}>
              {found.includes(id) ? (
                <>
                  <span className={c.sky}>[x]</span> <T v={secretText[id].title} />
                </>
              ) : (
                <>
                  <span className={c.muted}>[ ]</span> ??? <span className={c.muted}>(</span>
                  <span className={c.muted}>
                    <T v={secretText[id].hint} />)
                  </span>
                </>
              )}
            </p>
          ))}
        </Block>
      );
    },
  },
  {
    name: "sudo",
    aliases: ["su"],
    run: () => {
      foundSecret("sudo");
      return (
        <Block>
          <p>[sudo] password for guest: ********</p>
          <p className={c.warn}>guest is not in the sudoers file. This incident will be reported.</p>
          <p className={c.muted}>
            <T v={{ en: "...just kidding. But you did find a secret.", vi: "...đùa thôi. Nhưng bạn vừa tìm ra một bí mật đấy." }} />
          </p>
        </Block>
      );
    },
  },
  {
    name: "duyan",
    aliases: ["matrix"],
    run: () => {
      foundSecret("matrix");
      return (
        <p className={c.sky}>
          <T v={{ en: "Opening the code rain...", vi: "Đang mở màn mưa code..." }} />
        </p>
      );
    },
  },
  {
    name: "snake",
    aliases: ["ran", "ransanmoi", "nokia", "game", "play"],
    run: (ctx) => <SnakeGame lang={ctx.lang} onExit={ctx.focusInput} />,
  },
  {
    name: "whoami",
    run: (ctx) => (
      <p>
        guest{" "}
        <span className={c.muted}>
          (<T v={{ en: "you're the guest here, I'm", vi: "bạn là khách, còn mình là" }} /> {profile.name}. <T v={{ en: "Try", vi: "Thử" }} />{" "}
          <Run ctx={ctx} command="about" />)
        </span>
      </p>
    ),
  },
  { name: "pwd", run: () => <p>/home/guest/{profile.website}</p> },
  {
    name: "ls",
    aliases: ["dir", "ll"],
    run: (ctx) => (
      <p className="flex flex-wrap gap-x-5 gap-y-1">
        {files.map((file) => (
          <Run key={file.name} ctx={ctx} command={file.dir ? `cd ${file.name}` : `cat ${file.name}`}>
            <span className={file.dir ? `${c.blue} font-bold` : "text-[#d7e3ff]"}>{file.name}</span>
          </Run>
        ))}
      </p>
    ),
  },
  {
    name: "cat",
    aliases: ["less", "more", "type"],
    complete: () => files.map((file) => file.name),
    run: (ctx) => {
      const name = (ctx.args[0] ?? "").toLowerCase();
      if (name === "about.txt") return commands.find((command) => command.name === "about")!.run(ctx);
      if (name === "contact.md") return commands.find((command) => command.name === "contact")!.run(ctx);
      if (name === "cv.pdf") {
        return (
          <p className={c.muted}>
            cat: cv.pdf: <T v={{ en: "binary file, try", vi: "file nhị phân, thử" }} /> <Run ctx={ctx} command="cv" />
          </p>
        );
      }
      const dir = files.find((file) => file.dir && file.name.replace("/", "") === name.replace("/", ""));
      if (dir) {
        return (
          <p className={c.muted}>
            cat: {dir.name}: <T v={{ en: "is a directory, try", vi: "là thư mục, thử" }} /> <Run ctx={ctx} command={`cd ${dir.name}`} />
          </p>
        );
      }
      return (
        <p className={c.warn}>
          cat: {name || "?"}: <T v={{ en: "no such file. Try", vi: "không có file này. Thử" }} /> <Run ctx={ctx} command="ls" />
        </p>
      );
    },
  },
  {
    name: "cd",
    complete: () => files.filter((file) => file.dir).map((file) => file.name),
    run: (ctx) => {
      const name = (ctx.args[0] ?? "").toLowerCase().replace(/\/$/, "");
      const target = commands.find((command) => command.name === name && ["projects", "skills", "education"].includes(name));
      if (target) return target.run({ ...ctx, args: [] });
      if (!name || name === "~" || name === ".." || name === "/") {
        return (
          <p className={c.muted}>
            <T v={{ en: "Nice try, you're stuck here with me. Type", vi: "Không thoát được đâu, ở lại chơi với mình nhé. Gõ" }} />{" "}
            <Run ctx={ctx} command="exit" /> <T v={{ en: "to leave.", vi: "để ra ngoài." }} />
          </p>
        );
      }
      return (
        <p className={c.warn}>
          cd: <T v={{ en: "no such directory:", vi: "không có thư mục:" }} /> {name}
        </p>
      );
    },
  },
  { name: "echo", run: (ctx) => <p className="whitespace-pre-wrap">{ctx.args.join(" ")}</p> },
  {
    name: "date",
    run: (ctx) => <p>{new Date().toLocaleString(ctx.lang === "vi" ? "vi-VN" : "en-US", { dateStyle: "full", timeStyle: "short" })}</p>,
  },
  {
    name: "rm",
    aliases: ["rmdir", "del"],
    run: (ctx) => {
      // rm -rf / (hoặc -fr, *, ~): màn "xóa sạch" giả
      const flags = ctx.args.filter((arg) => arg.startsWith("-")).join("");
      const everything = ctx.args.some((arg) => ["/", "/*", "*", "~", "."].includes(arg));
      if (flags.includes("r") && flags.includes("f") && everything) return <Wipe />;
      return (
        <p className={c.warn}>
          rm: <T v={{ en: "permission denied. This portfolio is read-only (and precious).", vi: "không được phép. Portfolio này chỉ đọc thôi (và quý lắm)." }} />
        </p>
      );
    },
  },
  {
    name: "vim",
    aliases: ["vi", "nano", "emacs", "code"],
    run: () => (
      <p className={c.muted}>
        <T
          v={{
            en: "No editor here. Probably for the best: you'd still be trying to exit vim.",
            vi: "Ở đây không có trình soạn thảo. Vậy cũng tốt, không thì giờ bạn vẫn đang tìm cách thoát vim.",
          }}
        />
      </p>
    ),
  },
  {
    name: "hello",
    aliases: ["hi", "hey", "chao", "xinchao", "alo"],
    run: (ctx) => (
      <p>
        <T v={{ en: "Hi there! 👋 New here? Type", vi: "Chào bạn! 👋 Mới tới hả? Gõ" }} /> <Run ctx={ctx} command="help" />{" "}
        <T v={{ en: "to get started.", vi: "để bắt đầu nhé." }} />
      </p>
    ),
  },
  {
    name: "coffee",
    aliases: ["cafe", "caphe", "brew"],
    run: () => (
      <Block>
        <pre className={`${c.sky} leading-tight`}>{coffeeArt}</pre>
        <p>
          <T v={{ en: "Brewing coffee...", vi: "Đang pha cà phê..." }} /> <span className={c.blue}>[████████████████████] 100%</span>
        </p>
        <p className={c.warn}>
          <T v={{ en: "Error 418: I'm a teapot. I refuse to brew coffee.", vi: "Lỗi 418: Tôi là ấm trà. Tôi không pha cà phê đâu." }} />
        </p>
        <p className={c.muted}>
          <T
            v={{
              en: "(A real HTTP status code, look it up.) Have some tea instead 🍵. An still runs on coffee and TypeScript though.",
              vi: "(Mã lỗi HTTP có thật đấy, tra thử đi.) Thôi uống trà nhé 🍵. Còn An thì vẫn chạy bằng cà phê và TypeScript.",
            }}
          />
        </p>
      </Block>
    ),
  },
  {
    name: "hire",
    aliases: ["hireme", "thue", "tuyen", "tuyendung"],
    run: (ctx) => (
      <Block>
        <p>
          <T v={{ en: "Checking An's calendar...", vi: "Đang kiểm tra lịch của An..." }} /> <span className={c.sky}>✓ </span>
          <T v={{ en: "available!", vi: "đang rảnh!" }} />
        </p>
        <p className={c.white}>
          🤝 <T v={{ en: "Best decision you'll make today. Offer accepted in advance.", vi: "Quyết định sáng suốt nhất hôm nay. Lời mời được nhận trước luôn rồi." }} />
        </p>
        <p className={c.muted}>
          <T v={{ en: "Next step:", vi: "Bước tiếp theo:" }} /> <Run ctx={ctx} command="contact" /> <T v={{ en: "or", vi: "hoặc" }} />{" "}
          <Run ctx={ctx} command="cv" />
        </p>
      </Block>
    ),
  },
];

const byName = new Map<string, Command>();
for (const command of commands) {
  byName.set(command.name, command);
  for (const alias of command.aliases ?? []) byName.set(alias, command);
}

export function findCommand(name: string) {
  return byName.get(normalize(name).replace(/\s+/g, ""));
}

/** Tên lệnh hiện trong help, dùng cho Tab và gợi ý khi gõ sai */
export const visibleNames = commands.filter((command) => command.summary).map((command) => command.name);

/** Gõ sai một chút thì gợi ý lệnh gần giống nhất */
export function suggest(name: string) {
  const distance = (a: string, b: string) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const current = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = current;
      }
    }
    return row[b.length];
  };
  const word = normalize(name);
  let best: string | undefined;
  let bestScore = 3;
  for (const candidate of [...visibleNames, "whoami", "ls", "secrets"]) {
    const score = distance(word, candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/** Câu gõ vào trông như một câu hỏi (vd. "An biết React không?") thì chuyển cho trợ lý AI */
export function looksLikeQuestion(text: string) {
  return text.trim().endsWith("?") || text.trim().split(/\s+/).length >= 4;
}
