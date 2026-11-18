"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ui } from "@/data/ui";
import type { ContributionDay } from "@/lib/github";
import { pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

type Props = { weeks: (ContributionDay | null)[][] };

// Kích thước ô và khoảng cách lấy từ biến CSS --cell, --gap (ô to hơn trên màn hình rộng)
const CELL = "var(--cell)";
const GAP = "var(--gap)";
const levelColor = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)"];

/** Lưới đóng góp GitHub 12 tháng: cột là tuần, hàng là ngày. Rê chuột vào ô để xem số lượt. */
export function ContributionGraph({ weeks }: Props) {
  const lang = useLang();
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Trên điện thoại: cuộn sẵn tới tuần gần nhất
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  // Nhãn tháng phía trên: đặt ở tuần đầu tiên của mỗi tháng, cách nhau ít nhất 3 tuần
  const months: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, index) => {
    const first = week.find((day) => day !== null);
    if (!first) return;
    const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      const previous = months[months.length - 1];
      if (!previous || index - previous.index >= 3) {
        months.push({ index, label: lang === "vi" ? `T${month + 1}` : monthFormat.format(new Date(`${first.date}T00:00:00Z`)) });
      }
      lastMonth = month;
    }
  });

  const dayLabels = lang === "vi" ? ["", "T2", "", "T4", "", "T6", ""] : ["", "Mon", "", "Wed", "", "Fri", ""];

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-date]");
    const box = boxRef.current;
    if (!cell || !box) return setTip(null);
    const count = Number(cell.dataset.count);
    const date = dateFormat.format(new Date(`${cell.dataset.date}T00:00:00Z`));
    const word = pick(count === 1 ? ui.github.contributionOne : ui.github.contributionMany, lang);
    const cellRect = cell.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    setTip({
      text: `${count} ${word} ${date}`,
      x: cellRect.left - boxRect.left + cellRect.width / 2,
      y: cellRect.top - boxRect.top,
    });
  }

  return (
    <motion.div
      ref={boxRef}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px 0px" }}
      className="relative [--cell:11px] [--gap:3px] lg:[--cell:14px] lg:[--gap:4px]"
    >
      <div ref={scrollRef} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
        {/* hiện dần từ trái sang phải; theo dõi khung ngoài vì clip-path làm trình duyệt coi phần tử như bị ẩn */}
        <motion.div
          variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0% 0 0)" } }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-max gap-2"
          aria-hidden="true"
        >
          <div className="grid pt-5 text-[10px] text-muted" style={{ gridTemplateRows: `repeat(7, ${CELL})`, rowGap: GAP }}>
            {dayLabels.map((label, i) => (
              <span key={i} className="leading-[var(--cell)]">
                {label}
              </span>
            ))}
          </div>
          <div>
            <div className="relative h-5 text-[10px] text-muted">
              {months.map((month) => (
                <span key={month.index} className="absolute top-0 whitespace-nowrap" style={{ left: `calc(${month.index} * (${CELL} + ${GAP}))` }}>
                  {month.label}
                </span>
              ))}
            </div>
            <div className="flex" style={{ gap: GAP }} onPointerMove={handleMove} onPointerLeave={() => setTip(null)}>
              {weeks.map((week, w) => (
                <div key={w} className="grid" style={{ gridTemplateRows: `repeat(7, ${CELL})`, rowGap: GAP }}>
                  {week.map((day, d) =>
                    day ? (
                      <span
                        key={day.date}
                        data-date={day.date}
                        data-count={day.count}
                        className="rounded-[3px] transition-transform duration-150 hover:scale-125"
                        style={{ width: CELL, height: CELL, background: levelColor[day.level] }}
                      />
                    ) : (
                      <span key={`empty-${d}`} style={{ width: CELL, height: CELL }} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-[var(--card-from)] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted" aria-hidden="true">
        {pick(ui.github.less, lang)}
        {levelColor.map((color) => (
          <span key={color} className="rounded-[3px]" style={{ width: CELL, height: CELL, background: color }} />
        ))}
        {pick(ui.github.more, lang)}
      </div>
    </motion.div>
  );
}
