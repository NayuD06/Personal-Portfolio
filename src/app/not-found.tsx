import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowLeft, LuFolderGit2, LuSatellite } from "react-icons/lu";
import { NotFoundSearch, NotFoundTerminal } from "@/components/not-found-parts";
import { Footer } from "@/components/sections/footer";
import { SubpageHeader } from "@/components/subpage-header";
import { TechIcon } from "@/components/ui/tech-icon";
import { ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import type { IconName } from "@/lib/icons";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/** Icon công nghệ bay quanh số 0 */
const orbiting: IconName[] = ["react", "nextjs", "typescript"];

/**
 * Trang 404: số "404" với số 0 là một quỹ đạo có icon công nghệ bay quanh,
 * một vệ tinh lạc ra ngoài (trang bị lạc), khung terminal hiện đường link vừa mở.
 * Animation nằm trong globals.css (nhóm .nf-*), tự tắt khi máy bật giảm chuyển động.
 */
export default function NotFound() {
  return (
    <div>
      <SubpageHeader />
      <main id="main" className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_50%_35%,#000_20%,transparent_70%)]"
        />
        <div aria-hidden="true" className="blob absolute -top-24 left-1/2 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-brand-blue/20 blur-[120px]" />

        <section className="mx-auto flex min-h-[calc(100svh-4.1rem)] max-w-6xl flex-col items-center justify-center px-5 py-14 text-center sm:px-8">
          {/* 4 [quỹ đạo] 4 */}
          <div aria-hidden="true" className="enter-avatar flex items-center justify-center gap-1 select-none sm:gap-4">
            <span className="nf-bob">
              <span className="text-gradient animate-gradient block font-heading text-[7rem] leading-none font-black sm:text-[11rem]">4</span>
            </span>

            <div className="relative grid size-[7rem] place-items-center [--r:3.6rem] sm:size-[11rem] sm:[--r:5.6rem]">
              <span className="nf-ring absolute inset-[16%]" />
              <span className="absolute inset-[16%] rounded-full shadow-[0_0_60px_-6px_var(--glow-blue)]" />
              <span className="absolute size-[calc(var(--r)*2)] rounded-full border border-dashed border-brand-blue/40" />

              <div className="nf-orbit absolute inset-0">
                {orbiting.map((name, i) => (
                  <div
                    key={name}
                    className="absolute top-1/2 left-1/2"
                    style={
                      {
                        "--a": `${(360 / orbiting.length) * i + 30}deg`,
                        transform: "translate(-50%, -50%) rotate(var(--a)) translateX(var(--r)) rotate(calc(var(--a) * -1))",
                      } as CSSProperties
                    }
                  >
                    <div className="nf-orbit-item grid size-8 place-items-center rounded-lg border border-brand-blue/40 bg-[var(--card-from)] shadow-[0_0_20px_-4px_var(--glow-blue)] sm:size-10 sm:rounded-xl">
                      <TechIcon name={name} brandColor className="size-4 sm:size-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* vệ tinh trôi khỏi quỹ đạo */}
              <span className="nf-lost absolute top-[6%] right-[2%] text-brand-sky">
                <LuSatellite className="size-6 sm:size-7" />
              </span>
            </div>

            <span className="nf-bob [animation-delay:-2.5s]">
              <span className="text-gradient animate-gradient block font-heading text-[7rem] leading-none font-black sm:text-[11rem]">4</span>
            </span>
          </div>

          <h1 style={{ "--i": 3 } as CSSProperties} className="enter mt-8 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            <T v={ui.notFound.title} />
          </h1>
          <p style={{ "--i": 4 } as CSSProperties} className="enter mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            <T v={ui.notFound.body} />
          </p>

          <div style={{ "--i": 5 } as CSSProperties} className="enter mt-8 flex w-full justify-center">
            <NotFoundTerminal />
          </div>

          <div style={{ "--i": 6 } as CSSProperties} className="enter mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-brand-strong shine group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--glow-sky)] transition-transform hover:scale-[1.03]"
            >
              <LuArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              <T v={ui.notFound.home} />
            </Link>
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-6 py-3.5 font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              <LuFolderGit2 className="size-4" aria-hidden="true" />
              <T v={ui.notFound.projects} />
            </Link>
            <NotFoundSearch />
          </div>
        </section>
      </main>
      <Footer base="/" />
    </div>
  );
}
