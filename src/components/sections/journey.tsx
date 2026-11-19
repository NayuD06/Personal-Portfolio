import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuArrowUpRight, LuCodeXml, LuFlag, LuGraduationCap, LuRocket } from "react-icons/lu";
import { profile, type JourneyItem, type Project } from "@/data/profile";
import { ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { linkProps } from "@/lib/site";
import { SectionHeading } from "../ui/section-heading";

// Dòng thời gian "Hành trình": đọc từ profile.journey.
// Màn hình rộng (từ 1024px): đường dọc nằm giữa, các mốc xen kẽ hai bên: UTH bên trái, VTC Academy bên phải,
// cột mốc nằm ngay trên đường, dự án lấp vào bên còn trống. Điện thoại và máy tính bảng: một cột, đường bên trái.
// Khi cuộn, đường dọc sáng dần từ trên xuống, mốc nào đã đi qua thì sáng lên, số năm tô màu dần.
// Hiệu ứng chạy hoàn toàn bằng CSS (animation-timeline, nhóm .journey-* trong globals.css), không tốn JavaScript
// nên không làm chậm lúc tải trang. Trình duyệt chưa hỗ trợ thì hiện sẵn trạng thái đã sáng.

type Kind = JourneyItem["kind"];
type StudyItem = Exclude<JourneyItem, { kind: "project" }>;
type ProjectItem = Extract<JourneyItem, { kind: "project" }>;

const kindIcon: Record<Kind, IconType> = {
  university: LuGraduationCap,
  academy: LuCodeXml,
  project: LuRocket,
  milestone: LuFlag,
};

const kindLabel = {
  university: ui.journey.university,
  academy: ui.journey.academy,
  project: ui.journey.project,
  milestone: ui.journey.milestone,
} satisfies Record<Kind, unknown>;

const projects = new Map<string, Project>(profile.projects.map((project) => [project.slug, project]));
const items: JourneyItem[] = profile.journey.filter((item) => item.kind !== "project" || projects.has(item.project));

type Side = "left" | "right" | "center";
type Placed = { item: JourneyItem; side: Side; row: number };

/** Bên của mỗi mốc khi đường nằm giữa: UTH trái, VTC phải, cột mốc ở giữa, dự án sang bên đối diện mốc trước đó */
function sideOf(item: JourneyItem, last: "left" | "right" | undefined): Side {
  if (item.kind === "university") return "left";
  if (item.kind === "academy") return "right";
  if (item.kind === "milestone") return "center";
  return last === "left" ? "right" : "left";
}

/**
 * Xếp các mốc của một năm vào lưới 2 cột. Mỗi mốc hai bên chiếm 2 hàng, mốc sau bắt đầu sau mốc trước ít nhất 1 hàng,
 * nên hai bên so le nhau mà thứ tự từ trên xuống vẫn đúng thời gian. Cột mốc ở giữa chiếm trọn 1 hàng.
 */
function place(list: JourneyItem[]): Placed[] {
  const free = { left: 1, right: 1 };
  let prevRow = 0;
  let last: "left" | "right" | undefined;
  return list.map((item) => {
    const side = sideOf(item, last);
    let row: number;
    if (side === "center") {
      row = Math.max(prevRow + 1, free.left, free.right);
      free.left = free.right = row + 1;
    } else {
      row = Math.max(prevRow + 1, free[side]);
      free[side] = row + 2;
      last = side;
    }
    prevRow = row;
    return { item, side, row };
  });
}

/** Gom các mốc theo năm, giữ đúng thứ tự trong profile.journey */
function byYear(list: JourneyItem[]) {
  const groups: { year: number; items: JourneyItem[] }[] = [];
  for (const item of list) {
    const last = groups[groups.length - 1];
    if (last && last.year === item.year) last.items.push(item);
    else groups.push({ year: item.year, items: [item] });
  }
  return groups;
}

export function Journey() {
  if (items.length === 0) return null;

  return (
    <section id="journey" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="journey" title={ui.journey.title} subtitle={ui.journey.subtitle} />

        <Legend />

        <div className="journey relative mt-12 sm:mt-14">
          {/* đường dọc: nền mờ, phần sáng chạy theo cuộn, đốm sáng ở đầu */}
          <div aria-hidden="true" className="journey-rail absolute top-3 bottom-3 w-0.5 rounded-full bg-border">
            <div className="journey-fill absolute inset-0 origin-top rounded-full" />
            <span className="journey-head absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>

          {byYear(items).map((group) => (
            <YearGroup key={group.year} year={group.year} items={group.items} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
      <span className="sr-only">
        <T v={ui.journey.legend} />
      </span>
      {(Object.keys(kindIcon) as Kind[]).map((kind) => {
        const Icon = kindIcon[kind];
        return (
          <span key={kind} className="inline-flex items-center gap-2">
            <span className={`journey-dot journey-dot-${kind} grid size-6 place-items-center rounded-full`}>
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <T v={kindLabel[kind]} />
          </span>
        );
      })}
    </div>
  );
}

function YearGroup({ year, items }: { year: number; items: JourneyItem[] }) {
  // mỗi năm một mốc cuộn riêng để số năm tô màu dần khi đi qua các mốc của năm đó
  const timeline = `--journey-${year}`;
  return (
    <div style={{ viewTimelineName: timeline } as CSSProperties} className="relative pb-6 lg:pb-12">
      <div className="mb-6 pl-11 lg:mb-10 lg:flex lg:justify-center lg:pl-0">
        {/* nền che đường dọc để số năm nằm ngay trên đường */}
        <div className="lg:bg-bg lg:px-6 lg:py-2">
          <h3 className="relative inline-block font-heading text-5xl leading-none font-black tracking-tight md:text-6xl">
            <span className="year-outline">{year}</span>
            <span aria-hidden="true" style={{ animationTimeline: timeline } as CSSProperties} className="year-fill text-gradient absolute inset-0">
              {year}
            </span>
          </h3>
        </div>
      </div>

      <ol className="journey-grid flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-x-20 lg:gap-y-6">
        {place(items).map(({ item, side, row }, index) => (
          <Stop key={`${item.year}-${index}`} item={item} side={side} row={row} />
        ))}
      </ol>
    </div>
  );
}

function Stop({ item, side, row }: { item: JourneyItem; side: Side; row: number }) {
  return (
    <li data-side={side} style={{ "--row": row } as CSSProperties} className="journey-stop relative pl-11">
      <Node kind={item.kind} />
      <div className="journey-body">
        {item.kind === "project" ? (
          <ProjectStop item={item} />
        ) : item.kind === "milestone" ? (
          <MilestoneStop item={item} />
        ) : (
          <StudyStop item={item} />
        )}
      </div>
    </li>
  );
}

function Node({ kind }: { kind: Kind }) {
  const Icon = kindIcon[kind];
  return (
    <span
      aria-hidden="true"
      className={`journey-dot journey-node journey-dot-${kind} absolute top-3 left-0 z-10 grid size-6 place-items-center rounded-full`}
    >
      {/* gạch ngang nối thẻ với đường giữa (chỉ hiện khi đường nằm giữa) */}
      <span className="journey-tick absolute top-1/2 hidden h-px -translate-y-1/2" />
      <Icon className="size-3.5" />
      {/* lớp sáng phủ lên khi đã đi qua */}
      <span className="journey-dot-lit absolute -inset-px grid place-items-center rounded-full">
        <Icon className="size-3.5" />
      </span>
    </span>
  );
}

function DateLine({ item, label, className = "" }: { item: JourneyItem; label?: ReactNode; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs font-semibold text-brand-blue ${className}`}>
      <T v={item.date} />
      {label}
    </p>
  );
}

function StudyStop({ item }: { item: StudyItem }) {
  return (
    <article className="card rounded-2xl p-5 shadow-[0_18px_50px_-30px_var(--glow-blue)] sm:p-6">
      <DateLine
        item={item}
        label={
          <span className="rounded-full bg-chip px-2 py-0.5 font-sans text-[11px] tracking-normal text-chip-fg">
            <T v={kindLabel[item.kind]} />
          </span>
        }
      />
      <h4 className="mt-2.5 text-lg leading-snug font-bold sm:text-xl">
        <T v={item.title} />
      </h4>
      {item.place && (
        <p className="mt-1 text-sm text-muted">
          <T v={item.place} />
        </p>
      )}
      <p className="mt-3 max-w-[68ch] text-[0.95rem] leading-relaxed text-muted">
        <T v={item.description} />
      </p>
      {item.tags && item.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag, index) => (
            <li key={index} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-fg/80">
              <T v={tag} />
            </li>
          ))}
        </ul>
      )}
      {item.link && (
        <a
          href={item.link.href}
          {...linkProps(item.link.href)}
          className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
        >
          <T v={item.link.label} />
          <LuArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

function MilestoneStop({ item }: { item: StudyItem }) {
  // màn hình rộng: khung nhỏ nằm giữa đường, nền đặc để che đường phía sau
  return (
    <div className="py-2 lg:rounded-2xl lg:border lg:border-dashed lg:border-border lg:bg-bg lg:px-6 lg:pt-6 lg:pb-4 lg:text-center">
      <DateLine item={item} className="lg:justify-center" />
      <h4 className="mt-1.5 text-base font-bold sm:text-lg">
        <T v={item.title} />
      </h4>
      <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted lg:mx-auto">
        <T v={item.description} />
      </p>
    </div>
  );
}

function ProjectStop({ item }: { item: ProjectItem }) {
  const project = projects.get(item.project)!;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card group block rounded-2xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_var(--glow-blue)] sm:p-5"
    >
      <DateLine
        item={item}
        label={
          project.context ? (
            <span className="font-sans text-[11px] tracking-normal text-muted">
              <T v={project.context} />
            </span>
          ) : undefined
        }
      />
      <div className="mt-2 flex items-start justify-between gap-3">
        <h4 className="text-base leading-snug font-bold sm:text-lg">{project.title}</h4>
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-blue">
          <span className="hidden sm:inline">
            <T v={ui.journey.viewProject} />
          </span>
          <LuArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 max-w-[68ch] text-sm leading-relaxed text-muted">
        <T v={item.note ?? project.description} />
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 4).map((tag) => (
          <li key={tag} className="rounded-md bg-chip px-2 py-0.5 font-mono text-[11px] text-chip-fg">
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
