import { profile } from "@/data/profile";
import { SectionHeading } from "../ui/section-heading";
import { SpotlightCard } from "../ui/spotlight-card";
import { Stagger, StaggerItem } from "../ui/reveal";
import { TechIcon } from "../ui/tech-icon";

export function Services() {
  return (
    <section id="services" className="section-wash relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          title="Services I Provide"
          subtitle="What I can build for you, from the first database table to a deployed, monitored product."
        />

        <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {profile.services.map((service) => (
            <StaggerItem key={service.title} className="h-full">
              <SpotlightCard className="flex h-full flex-col items-center px-3 py-6 text-center sm:px-5 sm:py-8">
                <div className="mb-5 text-brand-blue transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">
                  <TechIcon name={service.icon} className="size-9 stroke-[1.6] sm:size-11" />
                </div>
                <h3 className="text-[15px] leading-snug font-bold sm:text-lg">{service.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-3 sm:text-[13px]">{service.description}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
