"use client";

import { pick, type Lang } from "@/lib/i18n";
import { setLang, useLang } from "@/lib/use-lang";
import { ui } from "@/data/ui";

const options: Lang[] = ["en", "vi"];

/**
 * Nút chuyển tiếng Anh / tiếng Việt.
 * Ô màu và màu chữ đặt theo html[data-lang] trong globals.css (nhóm .lang-*), không theo state của React:
 * thuộc tính này có sẵn trước khi trang vẽ ra, nên lúc tải trang ô màu nằm yên đúng chỗ, chỉ trượt khi bấm đổi.
 */
export function LangToggle() {
  const lang = useLang();

  return (
    <div
      role="group"
      aria-label={pick(ui.nav.language, lang)}
      className="relative flex h-10 items-center rounded-full border border-border bg-input p-1 text-xs font-bold"
    >
      <span aria-hidden="true" className="lang-pill bg-brand absolute inset-y-1 left-1 w-10 rounded-full" />
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={option === lang}
          lang={option}
          className={`lang-option lang-option-${option} relative z-10 h-full w-10 rounded-full uppercase`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
