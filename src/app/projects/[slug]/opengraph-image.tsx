import { ImageResponse } from "next/og";
import { profile, type Project } from "@/data/profile";
import { pick } from "@/lib/i18n";
import { icons } from "@/lib/icons";
import { ogFonts, publicImage } from "@/lib/og";

const projects: Project[] = profile.projects;

// Ảnh chụp màn hình của các dự án, đọc một lần lúc build
const shots = new Map<string, string>();
for (const project of projects) {
  if (project.image) shots.set(project.slug, await publicImage(project.image));
}

// Ảnh xem trước khi chia sẻ link một dự án lên Facebook, Discord...
export const alt = "Project preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug) ?? projects[0];
  const shot = shots.get(project.slug);
  const [from, to] = project.coverColors;
  const description = pick(project.description, "en");
  const CoverIcon = icons[project.coverIcon].Icon;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 64px",
          color: "#eef3ff",
          background:
            "radial-gradient(circle at 10% 15%, rgba(59,130,246,0.4), transparent 45%), radial-gradient(circle at 95% 95%, rgba(56,189,248,0.25), transparent 45%), #04070d",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#60a5fa" }}>
            {profile.name} / projects
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 60,
              fontFamily: "Montserrat",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 24,
              lineHeight: 1.45,
              color: "#9fb0cf",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
            {project.tags.slice(0, 5).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 20,
                  color: "#bfdbfe",
                  background: "rgba(37,99,235,0.22)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 520,
            height: 325,
            borderRadius: 20,
            overflow: "hidden",
            border: "2px solid rgba(96,165,250,0.45)",
            boxShadow: "0 30px 80px rgba(37,99,235,0.35)",
            background: `linear-gradient(135deg, ${from}, ${to})`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {shot ? (
            <img src={shot} width={520} height={325} alt="" style={{ objectFit: "cover", objectPosition: "top" }} />
          ) : (
            <CoverIcon size={150} color="rgba(255,255,255,0.92)" />
          )}
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
