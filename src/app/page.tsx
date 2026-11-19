import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { BackToTop } from "@/components/ui/back-to-top";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Services } from "@/components/sections/services";
import { Projects } from "@/components/sections/projects";
import { Education } from "@/components/sections/education";
import { Journey } from "@/components/sections/journey";
import { GitHubActivity } from "@/components/sections/github-activity";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { pick, T } from "@/lib/i18n";
import { ui } from "@/data/ui";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";

// Dữ liệu có cấu trúc (schema.org) để Google hiểu trang này nói về ai
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  ...(profile.avatar && { image: `${siteUrl}${profile.avatar}` }),
  jobTitle: pick(profile.roles[0], "en"),
  description: pick(profile.intro, "en"),
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressCountry: "VN" },
  sameAs: profile.socials.filter((social) => !social.href.startsWith("mailto:")).map((social) => social.href),
  alumniOf: profile.education.map((school) => ({
    "@type": "EducationalOrganization",
    name: pick(school.school, "en"),
    ...(school.website && { url: school.website }),
  })),
  knowsAbout: profile.skills.map((skill) => pick(skill.name, "en")),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main"
        className="sr-only rounded-full bg-brand-strong px-5 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
      >
        <T v={ui.skipToContent} />
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Projects />
        <Education />
        <Journey />
        <GitHubActivity />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
