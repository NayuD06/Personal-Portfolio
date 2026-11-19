"use client";

import { LuSquareTerminal } from "react-icons/lu";
import { ui } from "@/data/ui";
import { openTerminal } from "@/lib/extras";
import { pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

/** Nút >_ trên thanh menu: mở chế độ Terminal. Hiện ở mọi cỡ màn hình, kể cả điện thoại (không có phím ` để mở). */
export function TerminalTrigger() {
  const lang = useLang();
  return (
    <button
      type="button"
      onClick={openTerminal}
      aria-label={`${pick(ui.terminal.open, lang)} (\`)`}
      title={pick(ui.terminal.open, lang)}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-input text-muted transition-colors hover:border-brand-blue hover:text-fg"
    >
      <LuSquareTerminal className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
