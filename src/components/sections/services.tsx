import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { pick, T } from "@/lib/i18n";
import { SectionHeading } from "../ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "../ui/reveal";
import { TechIcon } from "../ui/tech-icon";

export function Services() {
  return (
    <section id="services" className="section-wash relative py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading tag="services" title={ui.services.title} subtitle={ui.services.subtitle} />

        <Reveal from="scale">
          <Stagger className="card grid overflow-hidden rounded-3xl shadow-[0_30px_80px_-40px_var(--glow-blue)] sm:grid-cols-2">
            {profile.services.map((service) => (
              <StaggerItem
                key={pick(service.title, "en")}
                className="group relative flex gap-5 border-border p-6 transition-colors duration-300 not-last:border-b hover:bg-chip sm:p-8 sm:odd:border-r sm:[&:nth-last-child(2)]:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="bg-brand absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                />
                <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-input text-brand-blue transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">
                  <TechIcon name={service.icon} className="size-6 stroke-[1.7]" />
                </div>
                <div>
                  <h3 className="text-lg leading-snug font-bold">
                    <T v={service.title} />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <T v={service.description} />
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>
      </div>
    </section>
  );
}
