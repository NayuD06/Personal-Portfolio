"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { LuArrowUpRight } from "react-icons/lu";
import { profile, type Project, type ProjectCategory } from "@/data/profile";
import { ProjectCover } from "../ui/project-cover";
import { SectionHeading } from "../ui/section-heading";
import { SpotlightCard } from "../ui/spotlight-card";

type Filter = "All" | ProjectCategory;

const filters: Filter[] = [
  "All",
  ...Array.from(new Set(profile.projects.flatMap((p) => p.categories as ProjectCategory[]))),
];

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const projects: Project[] =
    filter === "All"
      ? profile.projects
      : profile.projects.filter((p) => (p.categories as ProjectCategory[]).includes(filter));

  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="blob absolute top-1/3 -left-40 -z-10 size-96 rounded-full bg-brand-blue/15 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Recent Projects"
          subtitle="A selection of what I've built recently, from AI-powered learning platforms to DevOps pipelines. All source code is on GitHub."
        />

        <div role="group" aria-label="Filter projects" className="mb-12 flex flex-wrap justify-center gap-2">
          {filters.map((item) => {
            const active = item === filter;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={active}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-white" : "border border-border text-muted hover:text-fg"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="project-filter"
                    className="bg-brand absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            );
          })}
        </div>

        <motion.ul layout className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project, i) => (
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

function ProjectCard({ project }: { project: Project }) {
  return (
    <SpotlightCard className="flex h-full flex-col p-4">
      <ProjectCover project={project} />

      <div className="flex flex-1 flex-col px-1 pt-5 pb-1">
        <h3 className="text-xl font-bold">
          {project.title} <span className="font-semibold text-muted">({project.year})</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-chip px-3 py-1 text-xs font-medium text-chip-fg">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand shine inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <FaGithub className="size-4" aria-hidden="true" />
              GitHub
              <span className="sr-only"> repository for {project.title}</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Live Demo
              <LuArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> of {project.title}</span>
            </a>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
