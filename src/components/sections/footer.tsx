import { navLinks, profile } from "@/data/profile";
import { CurrentYear } from "../ui/current-year";
import { TechIcon } from "../ui/tech-icon";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <a href="#home" className="text-gradient animate-gradient font-heading text-2xl font-extrabold">
            {profile.brand}
          </a>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-muted transition-colors hover:text-brand-blue">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex gap-3">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid size-10 place-items-center rounded-lg bg-brand-blue text-white transition-all hover:-translate-y-1 hover:bg-brand-red"
                >
                  <TechIcon name={social.icon} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 h-px bg-gradient-to-r from-transparent via-brand-red/50 to-transparent" />
        <p className="mt-6 text-center text-sm text-muted">
          Copyright © <CurrentYear /> {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
