import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FaGithub } from "react-icons/fa6";
import { LuArrowLeft, LuArrowRight, LuArrowUpRight, LuCheck } from "react-icons/lu";
import { Gallery } from "@/components/project/gallery";
import { Footer } from "@/components/sections/footer";
import { SubpageHeader } from "@/components/subpage-header";
import { ProjectCover } from "@/components/ui/project-cover";
import { Reveal } from "@/components/ui/reveal";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { TechIcon } from "@/components/ui/tech-icon";
import { profile, type Project } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T, type Text } from "@/lib/i18n";
import { iconForLabel } from "@/lib/icons";

const projects: Project[] = profile.projects;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  const title = `${project.title} | ${profile.name}`;
  const description = pick(project.description, "en");
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", url: `/projects/${project.slug}`, title, description, siteName: profile.name },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const address = (project.liveUrl ?? project.githubUrl ?? "").replace(/^https?:\/\//, "");

  return (
    <>
      <ScrollProgress />
      <SubpageHeader />
      <main id="main" className="overflow-x-clip">
        {/* Đầu trang: tên, mô tả ngắn, link và ảnh lớn */}
        <section className="relative isolate pt-10 pb-16 sm:pt-14 sm:pb-24">
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
          />
          <div aria-hidden="true" className="blob absolute -top-32 right-0 -z-10 size-[26rem] rounded-full bg-brand-blue/20 blur-[120px]" />

          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <Link
                href="/#projects"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand-blue"
              >
                <LuArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                <T v={ui.project.back} />
              </Link>
            </Reveal>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-14">
              <Reveal delay={0.05}>
                <p className="font-mono text-sm text-brand-blue">
                  projects<span className="text-muted">/</span>
                  {project.slug}
                </p>
                <h1 className="mt-3 text-4xl leading-[1.05] font-black tracking-tight text-balance sm:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted sm:text-lg">
                  <T v={project.description} />
                </p>
              </Reveal>

              <Reveal delay={0.15} className="flex flex-col gap-6 lg:items-end">
                <ul className="flex flex-wrap gap-2 text-xs font-semibold lg:justify-end">
                  <li className="rounded-md border border-border px-2.5 py-1 text-muted">{project.year}</li>
                  {project.categories.map((category) => (
                    <li key={category} className="rounded-md border border-border px-2.5 py-1 text-muted">
                      {category}
                    </li>
                  ))}
                  {project.context && (
                    <li className="rounded-md bg-chip px-2.5 py-1 text-chip-fg">
                      <T v={project.context} />
                    </li>
                  )}
                </ul>
                <ProjectLinks project={project} />
              </Reveal>
            </div>

            <Reveal from="scale" delay={0.2} className="mt-12 sm:mt-16">
              <div className="card relative overflow-hidden rounded-2xl shadow-[0_40px_100px_-40px_var(--glow-blue)]">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 truncate rounded-md bg-chip px-3 py-1 font-mono text-[11px] text-muted">{address}</span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={`Screenshot of ${project.title}`}
                      fill
                      priority
                      sizes="(min-width: 1152px) 1088px, 92vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <ProjectCover project={project} bare />
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Nội dung: vấn đề, cách làm, tính năng + cột thông tin */}
        <section className="pb-20 sm:pb-28">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <div className="space-y-16">
              <Block title={ui.project.problem}>
                <p className="max-w-[65ch] text-lg leading-relaxed text-muted">
                  <T v={project.problem} />
                </p>
              </Block>

              <Block title={ui.project.approach}>
                <ul className="max-w-[65ch] space-y-5">
                  {project.approach.map((point) => (
                    <li key={pick(point, "en")} className="relative pl-7 leading-relaxed text-muted">
                      <span aria-hidden="true" className="bg-brand absolute top-[0.55em] left-0 size-2.5 rounded-[3px]" />
                      <T v={point} />
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title={ui.project.features}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li key={pick(feature, "en")} className="card flex items-start gap-3 rounded-xl p-4 text-sm leading-relaxed">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-chip text-brand-blue">
                        <LuCheck className="size-3.5" aria-hidden="true" />
                      </span>
                      <T v={feature} />
                    </li>
                  ))}
                </ul>
              </Block>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal from="right" className="card rounded-2xl p-6">
                <h2 className="text-lg font-extrabold">
                  <T v={ui.project.info} />
                </h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <Info label={ui.project.year}>{project.year}</Info>
                  <Info label={ui.project.type}>{project.categories.join(", ")}</Info>
                </dl>
                <h3 className="mt-6 text-sm text-muted">
                  <T v={ui.project.stack} />
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => {
                    const icon = iconForLabel(tag);
                    return (
                      <li
                        key={tag}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs font-medium"
                      >
                        {icon && <TechIcon name={icon} brandColor className="size-3.5" />}
                        {tag}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 border-t border-border pt-6">
                  <ProjectLinks project={project} stacked />
                </div>
              </Reveal>
            </aside>
          </div>
        </section>

        {project.gallery && project.gallery.length > 0 && (
          <section className="section-wash py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <Reveal>
                <h2 className="mb-10 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  <T v={ui.project.gallery} />
                </h2>
              </Reveal>
              <Gallery shots={project.gallery} title={project.title} />
            </div>
          </section>
        )}

        {/* Dự án trước / tiếp theo */}
        <nav aria-label="Projects" className="border-t border-border py-14 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 sm:px-8">
            <PagerLink project={prev} label={ui.project.prev} direction="prev" />
            <PagerLink project={next} label={ui.project.next} direction="next" />
          </div>
        </nav>
      </main>
      <Footer base="/" />
    </>
  );
}

function Block({ title, children }: { title: Text; children: ReactNode }) {
  return (
    <Reveal>
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
        <T v={title} />
      </h2>
      {children}
    </Reveal>
  );
}

function Info({ label, children }: { label: Text; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">
        <T v={label} />
      </dt>
      <dd className="text-right font-semibold">{children}</dd>
    </div>
  );
}

function ProjectLinks({ project, stacked = false }: { project: Project; stacked?: boolean }) {
  const layout = stacked ? "flex flex-col gap-3" : "flex flex-wrap gap-3 lg:justify-end";
  const size = stacked ? "w-full justify-center px-5 py-3" : "px-5 py-3";
  return (
    <div className={layout}>
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-brand shine inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white shadow-[0_12px_30px_-12px_var(--glow-sky)] transition-transform hover:scale-[1.03] ${size}`}
        >
          <T v={ui.projects.live} />
          <LuArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl border border-border bg-input text-sm font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue ${size}`}
        >
          <FaGithub className="size-4" aria-hidden="true" />
          <T v={ui.projects.code} />
        </a>
      )}
    </div>
  );
}

function PagerLink({ project, label, direction }: { project: Project; label: Text; direction: "prev" | "next" }) {
  const isNext = direction === "next";
  const Arrow = isNext ? LuArrowRight : LuArrowLeft;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group card flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-brand-blue sm:p-6 ${
        isNext ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue transition-transform group-hover:scale-110">
        <Arrow className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-muted">
          <T v={label} />
        </span>
        <span className="mt-1 block truncate text-lg font-bold">{project.title}</span>
      </span>
    </Link>
  );
}
