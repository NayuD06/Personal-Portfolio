import { profile } from "@/data/profile";
import { linkProps } from "@/lib/site";
import { navLinks, ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { CurrentYear } from "../ui/current-year";
import { TechIcon } from "../ui/tech-icon";

/** base: "/" khi dùng ở trang con, để các link #mục quay về trang chủ */
export function Footer({ base = "" }: { base?: string }) {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-sky/60 to-transparent" />
      <div className={`mx-auto max-w-6xl px-5 pt-14 sm:px-8 lg:pb-8 ${base ? "pb-10" : "pb-32"}`}>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href={`${base}#home`} className="inline-flex items-center gap-3">
              <span className="bg-brand grid size-10 place-items-center rounded-xl font-heading text-sm font-black text-white">
                {profile.initials}
              </span>
              <span className="font-heading text-xl font-extrabold">{profile.name}</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              <T v={ui.footer.tagline} />
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={`${base}${link.href}`} className="text-muted transition-colors hover:text-brand-blue">
                    <T v={link.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="space-y-2.5 text-sm">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  {...linkProps(social.href)}
                  className="inline-flex items-center gap-2.5 text-muted transition-colors hover:text-brand-blue"
                >
                  <TechIcon name={social.icon} className="size-4" />
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>
            © <CurrentYear /> {profile.name}. <T v={ui.footer.rights} />
          </p>
          <p>
            <T v={ui.footer.builtWith} />
          </p>
        </div>
      </div>
    </footer>
  );
}
