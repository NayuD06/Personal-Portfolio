"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  LuActivity,
  LuArrowDown,
  LuArrowUp,
  LuArrowUpRight,
  LuCheck,
  LuCodeXml,
  LuCopy,
  LuCornerDownLeft,
  LuDownload,
  LuFileText,
  LuFolderGit2,
  LuGraduationCap,
  LuHouse,
  LuLanguages,
  LuLayers,
  LuMail,
  LuMoon,
  LuSearch,
  LuSend,
  LuSparkles,
  LuSquareTerminal,
  LuSun,
  LuUserRound,
} from "react-icons/lu";
import { profile, type Project } from "@/data/profile";
import { navLinks, ui } from "@/data/ui";
import { openAsk, openTerminal } from "@/lib/extras";
import { pick, T, type Text } from "@/lib/i18n";
import { normalize } from "@/lib/normalize";
import { setLang, useLang } from "@/lib/use-lang";
import { TechIcon } from "./ui/tech-icon";
import { switchTheme } from "./ui/theme-toggle";

// Bảng lệnh: bấm Ctrl + K (⌘ + K trên Mac) hoặc nút kính lúp trên thanh menu để mở.
// Gõ để lọc, ↑ ↓ để chọn, Enter để chạy, Esc để đóng. Gõ có dấu hay không dấu đều tìm được.

const OPEN_EVENT = "open-command-palette";

/** Mở bảng lệnh từ bất kỳ đâu (nút trên menu, trang 404...) */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const noop = () => () => {};
export function useIsMac() {
  return useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.userAgent), () => false);
}

/** Nút mở bảng lệnh trên thanh menu: kính lúp, màn hình rộng có thêm phím tắt */
export function CommandTrigger() {
  const lang = useLang();
  const isMac = useIsMac();
  const shortcut = isMac ? "⌘K" : "Ctrl K";
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label={`${pick(ui.palette.open, lang)} (${shortcut})`}
      aria-keyshortcuts="Control+K Meta+K"
      className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-border bg-input px-2.5 text-muted transition-colors hover:border-brand-blue hover:text-fg"
    >
      <LuSearch className="size-[18px]" aria-hidden="true" />
      <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] leading-none xl:inline">{shortcut}</kbd>
    </button>
  );
}

/** Gắn một lần trong layout: lắng nghe phím tắt và hiện bảng lệnh */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  // chỗ đang focus trước khi mở, để đóng xong trả focus về đó (vd. nút kính lúp)
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const remember = () => {
      if (!document.querySelector('[role="dialog"][aria-modal="true"]')) {
        lastFocus.current = document.activeElement as HTMLElement | null;
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        remember();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => {
      remember();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => lastFocus.current?.focus?.({ preventScroll: true })}>
      {open && <PaletteDialog key="palette" onClose={() => setOpen(false)} />}
    </AnimatePresence>
  );
}

type Group = "navigate" | "projects" | "actions" | "links" | "assistant";

type Command = {
  id: string;
  group: Group;
  label: Text;
  icon: ReactNode;
  hint?: ReactNode;
  /** chữ thêm để tìm (không hiện ra) */
  keywords?: string;
  /** trả về "keep" để giữ bảng mở sau khi chạy */
  run: () => void | "keep";
};

const groups: { key: Group; label: Text }[] = [
  { key: "navigate", label: ui.palette.groupNavigate },
  { key: "projects", label: ui.palette.groupProjects },
  { key: "actions", label: ui.palette.groupActions },
  { key: "links", label: ui.palette.groupLinks },
  { key: "assistant", label: ui.ask.launcher },
];

/** đợi bảng lệnh đóng hẳn (và trả focus xong) rồi mới mở Terminal / khung chat */
const afterClose = (action: () => void) => {
  window.setTimeout(action, 260);
};

const sectionIcons: Record<string, IconType> = {
  home: LuHouse,
  about: LuUserRound,
  skills: LuCodeXml,
  services: LuLayers,
  projects: LuFolderGit2,
  education: LuGraduationCap,
  github: LuActivity,
  contact: LuMail,
};

/** Các mục trên trang chủ theo đúng thứ tự trên trang */
const sections: { id: string; label: Text }[] = [
  ...navLinks.slice(0, 5).map((link) => ({ id: link.href.slice(1), label: link.label })),
  { id: "education", label: ui.palette.education },
  { id: "github", label: ui.palette.github },
  ...navLinks.slice(5).map((link) => ({ id: link.href.slice(1), label: link.label })),
];

/** tách thành các từ (bỏ dấu câu) để so khớp theo đầu từ */
function wordsOf(value: string) {
  return normalize(value)
    .split(/[^a-z0-9#+]+/)
    .filter(Boolean);
}

function textOf(text: Text) {
  return typeof text === "string" ? text : `${text.en} ${text.vi}`;
}

function Icon({ as: Component }: { as: IconType }) {
  return <Component className="size-[18px]" aria-hidden="true" />;
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const lang = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const isMac = useIsMac();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // khóa cuộn trang phía sau trong lúc mở
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const commands = useMemo<Command[]>(() => {
    const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const goToSection = (id: string) => {
      if (pathname !== "/") return router.push(`/#${id}`);
      if (id === "home") return window.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" });
      document.getElementById(id)?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth" });
    };

    const navigate: Command[] = sections.map(({ id, label }) => ({
      id: `section-${id}`,
      group: "navigate",
      label,
      icon: <Icon as={sectionIcons[id] ?? LuHouse} />,
      hint: <span className="font-mono">#{id}</span>,
      run: () => goToSection(id),
    }));

    const projects: Command[] = profile.projects.map((project: Project) => ({
      id: `project-${project.slug}`,
      group: "projects",
      label: project.title,
      icon: <TechIcon name={project.coverIcon} className="size-[18px]" />,
      hint: `${project.categories[0]}, ${project.year}`,
      keywords: `${project.tags.join(" ")} ${project.categories.join(" ")} ${project.slug}`,
      run: () => router.push(`/projects/${project.slug}`),
    }));

    const resume = profile.resumeUrl ? pick(profile.resumeUrl, lang) : "";
    const actions: Command[] = [
      {
        id: "ask",
        group: "actions",
        label: ui.ask.open,
        icon: <Icon as={LuSparkles} />,
        hint: "AI",
        keywords: "ai chat hoi tro ly assistant gemini question cau hoi",
        run: () => afterClose(() => openAsk()),
      },
      {
        id: "terminal",
        group: "actions",
        label: ui.terminal.open,
        icon: <Icon as={LuSquareTerminal} />,
        hint: <span className="font-mono">`</span>,
        keywords: "terminal console cli shell command line dong lenh",
        run: () => afterClose(openTerminal),
      },
      {
        id: "lang",
        group: "actions",
        label: ui.palette.switchLang,
        icon: <Icon as={LuLanguages} />,
        hint: lang === "en" ? "VI" : "EN",
        keywords: "language ngon ngu english vietnamese tieng viet tieng anh",
        run: () => {
          setLang(lang === "en" ? "vi" : "en");
          return "keep";
        },
      },
      {
        id: "theme",
        group: "actions",
        label: isDark ? ui.nav.lightMode : ui.nav.darkMode,
        icon: <Icon as={isDark ? LuSun : LuMoon} />,
        keywords: "theme dark light giao dien sang toi mode",
        run: () => {
          // vòng tròn lan ra từ nút sáng/tối đang hiện trên menu, không có thì từ giữa màn hình
          const toggle = [...document.querySelectorAll<HTMLElement>("[data-theme-toggle]")].find((el) => el.offsetParent);
          const rect = toggle?.getBoundingClientRect();
          const origin = rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : { x: innerWidth / 2, y: innerHeight / 2 };
          // chờ bảng lệnh đóng xong rồi mới đổi, để hiệu ứng không chụp dính bảng
          window.setTimeout(() => switchTheme(isDark ? "light" : "dark", setTheme, origin), 220);
        },
      },
      ...(resume
        ? [
            {
              id: "cv-download",
              group: "actions" as const,
              label: ui.hero.cv,
              icon: <Icon as={LuDownload} />,
              hint: "PDF",
              keywords: "cv resume pdf tai download",
              run: () => {
                const link = document.createElement("a");
                link.href = resume;
                link.download = "";
                link.click();
              },
            },
          ]
        : []),
      {
        id: "cv-page",
        group: "actions",
        label: ui.palette.viewCv,
        icon: <Icon as={LuFileText} />,
        hint: "/cv",
        keywords: "cv resume in print",
        run: () => router.push("/cv"),
      },
      {
        id: "copy-email",
        group: "actions",
        label: copied ? ui.palette.copied : ui.palette.copyEmail,
        icon: <Icon as={copied ? LuCheck : LuCopy} />,
        hint: profile.email,
        keywords: "email mail copy chep lien he contact",
        run: () => {
          navigator.clipboard
            ?.writeText(profile.email)
            .then(() => {
              setCopied(true);
              window.setTimeout(onClose, 900);
            })
            .catch(() => {});
          return "keep";
        },
      },
      {
        id: "write-email",
        group: "actions",
        label: ui.palette.writeEmail,
        icon: <Icon as={LuSend} />,
        keywords: "email mail gui send contact lien he",
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      },
    ];

    const links: Command[] = profile.socials
      .filter((social) => !social.href.startsWith("mailto:"))
      .map((social) => ({
        id: `link-${social.label}`,
        group: "links",
        label: social.label,
        icon: <TechIcon name={social.icon} className="size-[18px]" />,
        hint: <LuArrowUpRight className="size-4" aria-hidden="true" />,
        keywords: new URL(social.href).hostname.replace(/^www\./, ""),
        run: () => {
          window.open(social.href, "_blank", "noopener,noreferrer");
        },
      }));

    return [...navigate, ...projects, ...actions, ...links];
  }, [lang, isDark, copied, pathname, router, setTheme, onClose]);

  // lọc theo chữ gõ: mỗi từ gõ vào phải khớp với đầu một từ của mục (gõ "du an" ra "Dự án"),
  // mục có tên bắt đầu bằng chữ gõ lên trước
  const visible = useMemo(() => {
    const words = wordsOf(query);
    if (words.length === 0) return commands;
    const first = words.join(" ");
    const scored = commands
      .map((command) => {
        const label = wordsOf(pick(command.label, lang)).join(" ");
        // tên nhóm cũng tìm được: gõ "dự án" ra cả mục Dự án lẫn từng dự án
        const group = groups.find((item) => item.key === command.group)?.label ?? "";
        const haystack = wordsOf(`${textOf(command.label)} ${command.keywords ?? ""} ${textOf(group)}`);
        if (!words.every((word) => haystack.some((candidate) => candidate.startsWith(word)))) return null;
        return { command, score: label.startsWith(first) ? 0 : label.includes(first) ? 1 : 2 };
      })
      .filter((item): item is { command: Command; score: number } => item !== null);
    // giữ thứ tự nhóm, trong mỗi nhóm xếp theo độ khớp
    const matches = groups.flatMap(({ key }) =>
      scored
        .filter((item) => item.command.group === key)
        .sort((a, b) => a.score - b.score)
        .map((item) => item.command),
    );
    // luôn có thêm dòng "Hỏi AI: <chữ vừa gõ>" ở cuối, không tìm thấy gì thì nó nằm đầu
    const question = query.trim().slice(0, 500);
    matches.push({
      id: "ask-query",
      group: "assistant",
      label: { en: `Ask AI: “${question}”`, vi: `Hỏi AI: “${question}”` },
      icon: <Icon as={LuSparkles} />,
      hint: "AI",
      run: () => afterClose(() => openAsk(question)),
    });
    return matches;
  }, [commands, query, lang]);

  const current = visible[Math.min(active, visible.length - 1)];

  // giữ dòng đang chọn luôn nằm trong khung khi dùng phím mũi tên
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function runCommand(command: Command | undefined) {
    if (!command) return;
    const result = command.run();
    if (result !== "keep") onClose();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    const count = visible.length;
    if (event.key === "ArrowDown" && count) {
      event.preventDefault();
      setActive((index) => (index + 1) % count);
    } else if (event.key === "ArrowUp" && count) {
      event.preventDefault();
      setActive((index) => (index - 1 + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCommand(current);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab") {
      // giữ focus trong bảng
      event.preventDefault();
    }
  }

  const positions = new Map(visible.map((command, position) => [command.id, position]));

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-[#020611]/60 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={pick(ui.palette.open, lang)}
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="card fixed top-[10vh] left-1/2 z-[81] flex max-h-[80vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl shadow-[0_40px_120px_-30px_var(--glow-blue)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <LuSearch className="size-5 shrink-0 text-brand-blue" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-autocomplete="list"
            aria-activedescendant={current ? `command-${current.id}` : undefined}
            aria-label={pick(ui.palette.placeholder, lang)}
            placeholder={pick(ui.palette.placeholder, lang)}
            spellCheck={false}
            autoComplete="off"
            className="command-input h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted/70"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-border px-1.5 py-1 font-mono text-[11px] leading-none text-muted transition-colors hover:text-fg"
          >
            Esc
          </button>
        </div>

        <div ref={listRef} id="command-list" role="listbox" className="flex-1 overflow-y-auto overscroll-contain p-2">
          {visible.every((command) => command.id === "ask-query") && (
            <div className="px-4 py-10 text-center">
              <p className="font-semibold">
                <T v={ui.palette.empty} /> “{query}”
              </p>
              <p className="mt-1 text-sm text-muted">
                <T v={ui.palette.emptyHint} />
              </p>
            </div>
          )}

          {groups.map((group) => {
            const items = visible.filter((command) => command.group === group.key);
            if (items.length === 0) return null;
            return (
              <div key={group.key} role="group" aria-labelledby={`command-group-${group.key}`} className="mb-1 last:mb-0">
                <p id={`command-group-${group.key}`} className="px-3 pt-2.5 pb-1.5 text-xs font-semibold text-muted">
                  <T v={group.label} />
                </p>
                {items.map((command) => {
                  const itemIndex = positions.get(command.id) ?? 0;
                  const isActive = command === current;
                  return (
                    <div
                      key={command.id}
                      id={`command-${command.id}`}
                      role="option"
                      aria-selected={isActive}
                      data-index={itemIndex}
                      onPointerMove={() => setActive(itemIndex)}
                      onClick={() => runCommand(command)}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive ? "text-fg" : "text-fg/85"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="command-active"
                          className="absolute inset-0 rounded-xl border border-brand-blue/30 bg-chip"
                          transition={{ type: "spring", stiffness: 600, damping: 42 }}
                        />
                      )}
                      <span
                        className={`relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                          isActive ? "bg-brand text-white" : "bg-input text-brand-blue"
                        }`}
                      >
                        {command.icon}
                      </span>
                      <span className="relative min-w-0 flex-1 truncate font-semibold">
                        <T v={command.label} />
                      </span>
                      {command.hint && (
                        <span className="relative hidden max-w-[45%] shrink-0 truncate text-xs text-muted sm:block">
                          {command.hint}
                        </span>
                      )}
                      <LuCornerDownLeft
                        className={`relative size-4 shrink-0 text-brand-blue transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                        aria-hidden="true"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="hidden items-center gap-5 border-t border-border px-4 py-2.5 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <Key>
              <LuArrowUp className="size-3" aria-hidden="true" />
            </Key>
            <Key>
              <LuArrowDown className="size-3" aria-hidden="true" />
            </Key>
            <T v={ui.palette.move} />
          </span>
          <span className="flex items-center gap-1.5">
            <Key>Enter</Key>
            <T v={ui.palette.run} />
          </span>
          <span className="flex items-center gap-1.5">
            <Key>Esc</Key>
            <T v={ui.palette.close} />
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Key>{isMac ? "⌘" : "Ctrl"}</Key>
            <Key>K</Key>
          </span>
        </div>
      </motion.div>
    </>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded border border-border bg-input px-1 font-mono text-[10px] leading-none text-fg">
      {children}
    </kbd>
  );
}
