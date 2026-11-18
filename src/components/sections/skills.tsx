import { profile } from "@/data/profile";
import { icons } from "@/lib/icons";
import { SectionHeading } from "../ui/section-heading";
import { SpotlightCard } from "../ui/spotlight-card";
import { Stagger, StaggerItem } from "../ui/reveal";
import { TechIcon } from "../ui/tech-icon";

export function Skills() {
  // Nhân đôi danh sách để dải logo chạy liền mạch
  const marquee = [...profile.techMarquee, ...profile.techMarquee];

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Skills & Technologies"
          subtitle="The languages, frameworks and tools I use to build fast, reliable and well-tested applications."
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profile.skills.map((skill) => (
            <StaggerItem key={skill.name} className="h-full">
              <SpotlightCard className="flex h-full items-start gap-5 p-5 sm:flex-col sm:items-center sm:gap-0 sm:px-7 sm:py-9 sm:text-center">
                <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-chip text-brand-blue transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] sm:mb-6 sm:size-16">
                  <TechIcon name={skill.icon} className="size-8 sm:size-9" />
                </div>
                <div>
                  <h3 className="text-lg font-bold sm:text-xl">{skill.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted sm:mt-3">{skill.description}</p>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="marquee mt-20 overflow-hidden" aria-label="Other tools I use">
        <ul className="marquee-track flex w-max gap-4">
          {marquee.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= profile.techMarquee.length}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-input px-5 py-2.5 text-sm font-medium"
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
