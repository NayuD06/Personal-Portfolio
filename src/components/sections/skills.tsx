import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { icons } from "@/lib/icons";
import { SectionHeading } from "../ui/section-heading";
import { SpotlightCard } from "../ui/spotlight-card";
import { Stagger, StaggerItem } from "../ui/reveal";
import { TechIcon } from "../ui/tech-icon";

/** Ô nào rộng gấp đôi trên lưới bento (theo thứ tự trong profile.skills).
 *  8 ô: màn rộng 3 cột = ô đầu rộng + 2 hàng 3 ô; màn vừa 2 cột = ô đầu và ô cuối rộng. */
const spans: Record<number, string> = {
  0: "sm:col-span-2",
  7: "sm:col-span-2 lg:col-span-1",
};
/** Ô hiện icon lớn mờ ở góc (ô rộng trên mọi màn hình) */
const featured = new Set([0]);

export function Skills() {
  // Nhân đôi danh sách để dải logo chạy liền mạch
  const marquee = [...profile.techMarquee, ...profile.techMarquee];

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="skills" title={ui.skills.title} subtitle={ui.skills.subtitle} />

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.skills.map((skill, i) => {
            const wide = featured.has(i);
            return (
              <StaggerItem key={pick(skill.name, "en")} className={`h-full ${spans[i] ?? ""}`}>
                <SpotlightCard className="relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
                  {wide && (
                    <TechIcon
                      name={skill.icon}
                      className="pointer-events-none absolute -right-6 -bottom-8 size-44 text-brand-blue/[0.07] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-chip text-brand-blue transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg]">
                      <TechIcon name={skill.icon} className="size-6" />
                    </div>
                    <h3 className="text-lg leading-snug font-bold">
                      <T v={skill.name} />
                    </h3>
                  </div>
                  <p className={`mt-4 text-sm leading-relaxed text-muted ${wide ? "max-w-md" : ""}`}>
                    <T v={skill.description} />
                  </p>
                  <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                    {skill.tools.map((tool) => (
                      <li
                        key={tool}
                        title={icons[tool].label}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-input px-2.5 py-1.5 text-xs font-medium"
                      >
                        <TechIcon name={tool} brandColor className="size-3.5" />
                        {icons[tool].label}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
        <p className="mb-5 text-sm font-semibold text-muted">
          <T v={ui.skills.marquee} />
        </p>
      </div>
      <div className="marquee overflow-hidden">
        <ul className="marquee-track flex w-max gap-4">
          {marquee.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= profile.techMarquee.length}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-input px-5 py-2.5 text-sm font-medium"
            >
              <TechIcon name={name} brandColor className="size-5" />
              {icons[name].label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
