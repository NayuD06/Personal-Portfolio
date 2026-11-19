import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaGithub } from "react-icons/fa6";
import { LuArrowLeft, LuDownload, LuGlobe, LuMail, LuMapPin, LuPrinter } from "react-icons/lu";
import { PrintButton } from "@/components/cv/print-button";
import { SubpageHeader } from "@/components/subpage-header";
import { ResumeLink } from "@/components/ui/resume-link";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T, type Text } from "@/lib/i18n";
import { icons } from "@/lib/icons";

export const metadata: Metadata = {
  title: "CV",
  description: pick(profile.intro, "en"),
  alternates: { canonical: "/cv" },
  openGraph: {
    type: "profile",
    url: "/cv",
    title: `CV | ${profile.name}`,
    description: pick(profile.intro, "en"),
    siteName: profile.name,
  },
};

// Màu cố định (không theo giao diện sáng/tối) để bản in và PDF luôn giống nhau
const ink = "text-[#0b1730]";
const muted = "text-[#4a5873]";
const accent = "text-[#1d4ed8]";

/**
 * CV một trang A4, dựng hoàn toàn từ src/data/profile.ts.
 * Sửa nội dung ở profile.ts thì CV đổi theo; bấm "In" rồi chọn "Lưu dưới dạng PDF" để xuất file mới.
 */
export default function CvPage() {
  const github = profile.socials.find((social) => social.icon === "github");

  return (
    // một thẻ bao ngoài: Next.js cuộn tới thẻ này khi chuyển trang, nên trang luôn mở ở đầu
    <div>
      <SubpageHeader />
      <main id="main" className="cv-screen px-3 py-8 sm:py-12">
        <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand-blue"
          >
            <LuArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <T v={ui.cv.back} />
          </Link>
          <div className="flex flex-wrap gap-2">
            <PrintButton className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue">
              <LuPrinter className="size-4" aria-hidden="true" />
              <T v={ui.cv.print} />
            </PrintButton>
            <ResumeLink className="bg-brand shine inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
              <LuDownload className="size-4" aria-hidden="true" />
              <T v={ui.cv.download} />
            </ResumeLink>
          </div>
        </div>
        <p className="mx-auto mb-6 max-w-[210mm] text-xs text-muted print:hidden">
          <T v={ui.cv.tip} />
        </p>

        <article
          className={`cv-sheet mx-auto flex flex-col bg-white font-sans text-[9pt] leading-[1.45] shadow-[0_30px_80px_-30px_rgb(15_30_60/0.45)] ${ink}`}
        >
          {/* Đầu CV */}
          <header className="flex items-center justify-between gap-[8mm] px-[13mm] pt-[11mm] pb-[7mm]">
            <div className="min-w-0">
              <h1 className="font-heading text-[26pt] leading-none font-black tracking-tight">{profile.name}</h1>
              <p className={`mt-[2.5mm] text-[12pt] font-bold ${accent}`}>
                <T v={profile.roles[0]} />
              </p>
              {profile.availability && (
                <p className={`mt-[1.5mm] text-[9pt] ${muted}`}>
                  <T v={profile.availability} />
                </p>
              )}
            </div>
            {profile.avatar && (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={200}
                height={200}
                className="size-[27mm] shrink-0 rounded-[5mm] object-cover"
              />
            )}
          </header>
          <div aria-hidden="true" className="bg-brand h-[1.4mm]" />

          <div className="grid flex-1 grid-cols-[63mm_1fr]">
            {/* Cột trái: liên hệ, học vấn, kỹ năng */}
            <aside className="space-y-[6.5mm] bg-[#eef3fc] px-[8mm] py-[8mm]">
              <CvSection title={ui.cv.contact}>
                <ul className="space-y-[1.8mm] text-[8.5pt]">
                  <ContactRow icon={<LuMail />} href={`mailto:${profile.email}`}>
                    {profile.email}
                  </ContactRow>
                  {github && (
                    <ContactRow icon={<FaGithub />} href={github.href}>
                      {github.href.replace(/^https?:\/\//, "")}
                    </ContactRow>
                  )}
                  {profile.website && (
                    <ContactRow icon={<LuGlobe />} href={`https://${profile.website}`}>
                      {profile.website}
                    </ContactRow>
                  )}
                  <ContactRow icon={<LuMapPin />}>
                    <T v={profile.location} />
                  </ContactRow>
                </ul>
              </CvSection>

              <CvSection title={ui.cv.education}>
                <ul className="space-y-[3.5mm]">
                  {profile.education.map((school) => (
                    <li key={school.short}>
                      <p className="leading-snug font-bold">
                        <T v={school.school} />
                      </p>
                      <p className="text-[8.5pt]">
                        <T v={school.program} />
                      </p>
                      <p className={`text-[8pt] ${muted}`}>
                        <T v={school.period} />, <T v={school.status} />
                      </p>
                    </li>
                  ))}
                </ul>
              </CvSection>

              <CvSection title={ui.cv.skills}>
                <ul className="space-y-[2.6mm]">
                  {profile.skills.map((skill) => (
                    <li key={pick(skill.name, "en")}>
                      <p className="text-[8.5pt] leading-snug font-bold">
                        <T v={skill.name} />
                      </p>
                      <p className={`text-[8pt] leading-snug ${muted}`}>
                        {skill.tools.map((tool) => icons[tool].label).join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </CvSection>
            </aside>

            {/* Cột phải: giới thiệu, dự án */}
            <div className="space-y-[6.5mm] px-[9mm] py-[8mm]">
              <CvSection title={ui.cv.profile}>
                <div className="space-y-[2mm]">
                  {profile.about.map((paragraph) => (
                    <p key={pick(paragraph, "en")}>
                      <T v={paragraph} />
                    </p>
                  ))}
                </div>
              </CvSection>

              <CvSection title={ui.cv.projects}>
                <ul className="space-y-[3.6mm]">
                  {profile.projects.map((project) => (
                    <li key={project.slug} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-[4mm]">
                        <p className="text-[10.5pt] font-bold">
                          {project.githubUrl ? <a href={project.githubUrl}>{project.title}</a> : project.title}
                        </p>
                        <p className={`shrink-0 text-[8pt] ${muted}`}>{project.year}</p>
                      </div>
                      <p className={`text-[8pt] font-semibold ${accent}`}>{project.tags.join(", ")}</p>
                      <p className="mt-[0.8mm]">
                        <T v={project.description} />
                      </p>
                      {project.liveUrl && (
                        <p className={`mt-[0.5mm] text-[8pt] ${muted}`}>
                          Demo: <a href={project.liveUrl}>{project.liveUrl.replace(/^https?:\/\//, "")}</a>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CvSection>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function CvSection({ title, children }: { title: Text; children: ReactNode }) {
  return (
    <section>
      <h2 className={`mb-[2.5mm] flex items-center gap-[2.5mm] font-heading text-[10.5pt] font-extrabold ${accent}`}>
        <T v={title} />
        <span aria-hidden="true" className="h-px flex-1 bg-[#c7d6f5]" />
      </h2>
      {children}
    </section>
  );
}

function ContactRow({ icon, href, children }: { icon: ReactNode; href?: string; children: ReactNode }) {
  const content = (
    <>
      <span aria-hidden="true" className={`mt-[0.6mm] shrink-0 text-[9pt] ${accent}`}>
        {icon}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-start gap-[2mm]">
          {content}
        </a>
      ) : (
        <span className="flex items-start gap-[2mm]">{content}</span>
      )}
    </li>
  );
}
