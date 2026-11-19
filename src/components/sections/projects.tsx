"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import { profile, type Project, type ProjectCategory } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { ProjectCover } from "../ui/project-cover";
import { Reveal } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";
import { SpotlightCard } from "../ui/spotlight-card";

type Filter = "All" | ProjectCategory;

const projects: Project[] = profile.projects;
const filters: Filter[] = ["All", ...Array.from(new Set(projects.flatMap((p) => p.categories)))];
const featured = projects.filter((p) => p.featured);

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const showFeatured = filter === "All";
  const grid = showFeatured ? projects.filter((p) => !p.featured) : projects.filter((p) => p.categories.includes(filter));

  return (
    // "isolate": giữ đốm sáng nền (-z-10, có animation) trong mục này. Thiếu nó, trình duyệt phải tách cả phần trang
    // phía trên đốm sáng thành một lớp vẽ riêng to bằng cả trang, nên cuộn và bấm gì cũng nặng hơn.
    <section id="projects" className="relative isolate py-24 sm:py-32">
      <div aria-hidden="true" className="blob glow absolute top-1/3 -left-40 -z-10 size-96 [--glow-a:10.8%] [--glow-blur:120px] [--glow-c:var(--brand-blue)]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="projects" title={ui.projects.title} subtitle={ui.projects.subtitle} />

        <FilterBar filter={filter} onChange={setFilter} />

        <AnimatePresence initial={false}>
          {showFeatured && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              // chừa 0,5rem hai bên để viền focus của nút sát mép không bị cắt
              className="-mx-2 overflow-hidden px-2"
            >
              <ul className="grid gap-20 pb-20 sm:gap-24 sm:pb-24">
                {featured.map((project, i) => (
                  <li key={project.title}>
                    <FeaturedProject project={project} flip={i % 2 === 1} />
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {showFeatured && grid.length > 0 && (
          <Reveal>
            <h3 className="mb-8 flex items-center gap-4 text-2xl font-extrabold">
              <T v={ui.projects.more} />
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </h3>
          </Reveal>
        )}

        <motion.ul layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {grid.map((project, i) => (
              <motion.li
                key={project.title}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/** Dự án nổi bật: ảnh lớn trong khung trình duyệt, chữ ở bên cạnh, đổi bên xen kẽ. */

/** Các nút lọc dự án. Tách riêng để khi đổi ngôn ngữ chỉ phần này vẽ lại (nhãn đọc màn hình), không phải cả mục Dự án. */
function FilterBar({ filter, onChange }: { filter: Filter; onChange: (filter: Filter) => void }) {
  const lang = useLang();
  return (
    <div role="group" aria-label={pick(ui.projects.filter, lang)} className="mb-14 flex flex-wrap gap-2">
      {filters.map((item) => {
        const active = item === filter;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-pressed={active}
            className={`relative rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
              active ? "text-white" : "border border-border text-muted hover:text-fg"
            }`}
          >
            {active && (
              <motion.span
                layoutId="project-filter"
                className="bg-brand-strong absolute inset-0 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{item === "All" ? <T v={ui.projects.all} /> : item}</span>
          </button>
        );
      })}
    </div>
  );
}

function FeaturedProject({ project, flip }: { project: Project; flip: boolean }) {
  const address = (project.liveUrl ?? project.githubUrl ?? "").replace(/^https?:\/\//, "");

  return (
    <article className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      <Reveal from={flip ? "right" : "left"} className={flip ? "lg:order-2" : ""}>
        <Link
          href={`/projects/${project.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="group card relative block overflow-hidden rounded-2xl shadow-[0_30px_80px_-35px_var(--glow-blue)]"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate rounded-md bg-chip px-3 py-1 font-mono text-[11px] text-muted">{address}</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            {project.image ? (
              <Image
                src={project.image}
                alt={`Screenshot of ${project.title}`}
                fill
                sizes="(min-width: 1024px) 620px, 92vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <ProjectCover project={project} bare />
            )}
          </div>
        </Link>
      </Reveal>

      <Reveal from={flip ? "left" : "right"} delay={0.1}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-md bg-chip px-2.5 py-1 text-chip-fg">
            <T v={ui.projects.featured} />
          </span>
          <span className="rounded-md border border-border px-2.5 py-1 text-muted">{project.year}</span>
          {project.categories.map((category) => (
            <span key={category} className="rounded-md border border-border px-2.5 py-1 text-muted">
              {category}
            </span>
          ))}
        </div>
        <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-brand-blue">
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 leading-relaxed text-muted">
          <T v={project.description} />
        </p>
        <p className="mt-5 text-sm font-semibold">
          <T v={ui.projects.builtWith} />
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-lg bg-chip px-3 py-1 text-xs font-medium text-chip-fg">
              {tag}
            </li>
          ))}
        </ul>
        <ProjectLinks project={project} />
      </Reveal>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <SpotlightCard className="flex h-full flex-col p-4">
      <ProjectCover project={project} />

      <div className="flex flex-1 flex-col px-1 pt-5 pb-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">
            <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-brand-blue">
              {project.title}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <T v={project.description} />
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-lg bg-chip px-2.5 py-1 text-xs font-medium text-chip-fg">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <ProjectLinks project={project} compact />
        </div>
      </div>
    </SpotlightCard>
  );
}

function ProjectLinks({ project, compact = false }: { project: Project; compact?: boolean }) {
  const size = compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm";
  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "pt-6" : "pt-7"}`}>
      <Link
        href={`/projects/${project.slug}`}
        className={`bg-brand-strong shine group/details inline-flex items-center gap-1.5 rounded-xl font-semibold text-white transition-transform hover:scale-105 ${size}`}
      >
        <T v={ui.projects.details} />
        <LuArrowRight className="size-4 transition-transform group-hover/details:translate-x-0.5" aria-hidden="true" />
        <span className="sr-only">: {project.title}</span>
      </Link>
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl border border-border bg-input font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue ${size}`}
        >
          <FaGithub className="size-4" aria-hidden="true" />
          <T v={ui.projects.code} />
          <span className="sr-only">: {project.title}</span>
        </a>
      )}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-input font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue ${size}`}
        >
          <T v={ui.projects.live} />
          <LuArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">: {project.title}</span>
        </a>
      )}
    </div>
  );
}
