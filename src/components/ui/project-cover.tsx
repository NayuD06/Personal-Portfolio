import Image from "next/image";
import type { Project } from "@/data/profile";
import { TechIcon } from "./tech-icon";

/** Ảnh bìa dự án. Có ảnh chụp màn hình thì dùng ảnh, chưa có thì tự vẽ minh họa. */
export function ProjectCover({ project, bare = false }: { project: Project; bare?: boolean }) {
  const [from, to] = project.coverColors;
  // bare: lấp đầy khung cha (dùng trong khung trình duyệt của dự án nổi bật)
  const frame = bare ? "absolute inset-0 overflow-hidden" : "relative aspect-[16/10] overflow-hidden rounded-xl";

  if (project.image) {
    return (
      <div className={frame}>
        <Image
          src={project.image}
          alt={`Screenshot of ${project.title}`}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={frame}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="bg-grid absolute inset-0 [--grid-line:rgb(255_255_255/0.12)] [background-size:28px_28px]" />
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/20 blur-2xl transition-transform duration-700 group-hover:scale-125" />

      {/* cửa sổ ứng dụng giả lập */}
      <div className="absolute inset-x-[12%] top-[16%] bottom-[-8%] rounded-t-xl border border-white/25 bg-[#0b1426]/70 shadow-2xl backdrop-blur-sm transition-transform duration-700 group-hover:-translate-y-2">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 h-2 w-1/3 rounded-full bg-white/15" />
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-3 p-3">
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-white/20" />
            <div className="h-2 w-4/5 rounded-full bg-white/10" />
            <div className="h-2 w-3/5 rounded-full bg-white/10" />
            <div className="h-2 w-4/5 rounded-full bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-10 rounded-lg" style={{ background: `linear-gradient(90deg, ${from}88, ${to}88)` }} />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-6 rounded-md bg-white/10" />
              <div className="h-6 rounded-md bg-white/10" />
              <div className="h-6 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="grid size-16 place-items-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]">
          <TechIcon name={project.coverIcon} className="size-8" />
        </div>
      </div>
    </div>
  );
}
