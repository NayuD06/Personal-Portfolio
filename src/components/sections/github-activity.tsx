import { FaGithub } from "react-icons/fa6";
import { LuBookMarked, LuCalendarDays, LuCodeXml, LuGitCommitHorizontal, LuStar } from "react-icons/lu";
import { ui } from "@/data/ui";
import { getGitHubData } from "@/lib/github";
import { T, type Text } from "@/lib/i18n";
import { ContributionGraph } from "../ui/contribution-graph";
import { CountUp } from "../ui/count-up";
import { LanguageBars } from "../ui/language-bars";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { SectionHeading } from "../ui/section-heading";

/** Ngày dạng "17 thg 11, 2026" / "Nov 17, 2026" cho cả hai ngôn ngữ */
function formatDate(iso: string): Text {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" };
  const date = new Date(iso);
  return {
    en: new Intl.DateTimeFormat("en-US", options).format(date),
    vi: new Intl.DateTimeFormat("vi-VN", options).format(date),
  };
}

export async function GitHubActivity() {
  const data = await getGitHubData();

  const stats = [
    { icon: LuBookMarked, value: String(data.publicRepos), label: ui.github.repos, count: true },
    { icon: LuStar, value: String(data.stars), label: ui.github.stars, count: true },
    data.contributions
      ? { icon: LuGitCommitHorizontal, value: String(data.contributions.total), label: ui.github.contributions, count: true }
      : { icon: LuCodeXml, value: String(data.languageCount), label: ui.github.languagesUsed, count: true },
    { icon: LuCalendarDays, value: String(data.sinceYear), label: ui.github.since, count: false },
  ];

  return (
    <section id="github" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="github" title={ui.github.title} subtitle={ui.github.subtitle} />

        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label, count }) => (
            <StaggerItem key={label.en} className="card flex items-center gap-4 rounded-2xl p-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col-reverse">
                <span className="text-xs leading-snug text-muted sm:text-sm">
                  <T v={label} />
                </span>
                <span className="font-heading text-2xl font-black sm:text-3xl">{count ? <CountUp value={value} /> : value}</span>
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-4">
          <div className="card rounded-2xl p-5 sm:p-7">
            {data.contributions ? (
              <>
                <h3 className="mb-5 text-lg font-bold">
                  <span className="text-gradient">{data.contributions.total.toLocaleString("en-US")}</span>{" "}
                  <T v={ui.github.graphTitle} />
                </h3>
                <ContributionGraph weeks={data.contributions.weeks} />
              </>
            ) : (
              <p className="text-sm text-muted">
                <T v={ui.github.graphUnavailable} />{" "}
                <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue hover:underline">
                  <T v={ui.github.viewProfile} />
                </a>
              </p>
            )}
          </div>
        </Reveal>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
          <Reveal from="left" className="card rounded-2xl p-5 sm:p-7">
            <h3 className="text-lg font-bold">
              <T v={ui.github.languages} />
            </h3>
            <p className="mt-1 mb-6 text-xs text-muted">
              <T v={ui.github.languagesNote} />
            </p>
            <LanguageBars languages={data.languages} />
          </Reveal>

          <Reveal from="right" className="card rounded-2xl p-5 sm:p-7">
            <h3 className="mb-4 text-lg font-bold">
              <T v={ui.github.recent} />
            </h3>
            <ul className="divide-y divide-border">
              {data.recent.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group -mx-3 flex items-start gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-chip"
                  >
                    <FaGithub className="mt-0.5 size-4 shrink-0 text-muted transition-colors group-hover:text-brand-blue" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold transition-colors group-hover:text-brand-blue">{repo.name}</span>
                      {repo.description && (
                        <span className="mt-0.5 line-clamp-1 block text-sm text-muted">{repo.description}</span>
                      )}
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        {repo.language && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-brand-blue" aria-hidden="true" />
                            {repo.language}
                          </span>
                        )}
                        {repo.stars > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <LuStar className="size-3" aria-hidden="true" />
                            {repo.stars}
                          </span>
                        )}
                        <span>
                          <T v={ui.github.updated} /> <T v={formatDate(repo.pushedAt)} />
                        </span>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            <T v={ui.github.dataNote} /> <T v={formatDate(data.updatedAt)} />.
          </p>
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-input px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            <FaGithub className="size-4" aria-hidden="true" />
            <T v={ui.github.viewProfile} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
