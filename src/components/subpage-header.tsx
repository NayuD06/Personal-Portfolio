import Link from "next/link";
import { profile } from "@/data/profile";
import { CommandTrigger } from "./command-palette";
import { TerminalTrigger } from "./extras/triggers";
import { LangToggle } from "./ui/lang-toggle";
import { ThemeToggle } from "./ui/theme-toggle";
import { LogoMark } from "./ui/logo-mark";

/** Thanh trên cùng của các trang con (chi tiết dự án, CV): logo về trang chủ, đổi ngôn ngữ và giao diện. */
export function SubpageHeader() {
  return (
    <header data-quake className="sticky top-0 z-50 border-b border-border bg-[var(--nav)] backdrop-blur-xl print:hidden">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link href="/" data-logo className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <LogoMark className="size-10 shadow-[0_8px_24px_-10px_var(--glow-sky)] transition-transform duration-300 group-hover:-rotate-6" />
          <span className="truncate font-heading text-lg font-extrabold tracking-tight">{profile.name}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <CommandTrigger />
          <TerminalTrigger />
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
