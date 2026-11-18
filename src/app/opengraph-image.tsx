import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { pick } from "@/lib/i18n";
import { ogFonts, publicImage } from "@/lib/og";

const role = pick(profile.roles[0], "en");

// Ảnh đại diện đọc một lần lúc build
const avatar = profile.avatar ? await publicImage(profile.avatar) : null;

// Ảnh xem trước khi chia sẻ link (Facebook, Zalo, Discord, Messenger...), tạo lúc build.
export const alt = `${profile.name}, ${role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          color: "#eef3ff",
          background:
            "radial-gradient(circle at 15% 20%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 90% 90%, rgba(56,189,248,0.3), transparent 45%), #04070d",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: avatar ? 640 : 1040 }}>
          <div style={{ fontSize: 34, color: "#9fb0cf" }}>Hello, I&apos;m</div>
          <div
            style={{
              fontSize: 120,
              fontFamily: "Montserrat",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              backgroundImage: "linear-gradient(90deg, #2563eb, #60a5fa, #38bdf8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {profile.name}
          </div>
          <div style={{ marginTop: 14, fontSize: 42, fontFamily: "Montserrat", fontWeight: 800 }}>{role}</div>
          <div style={{ marginTop: 18, fontSize: 26, lineHeight: 1.4, color: "#9fb0cf" }}>
            React, Next.js, NestJS, Laravel. Open to internships and freelance work.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 36 }}>
            <div style={{ display: "flex", width: 90, height: 8, borderRadius: 8, background: "linear-gradient(90deg, #2563eb, #38bdf8)" }} />
            {profile.website && <div style={{ marginLeft: 20, fontSize: 26, color: "#60a5fa" }}>{profile.website}</div>}
          </div>
        </div>
        {avatar && (
          <div
            style={{
              display: "flex",
              padding: 8,
              borderRadius: 64,
              background: "linear-gradient(135deg, #2563eb, #38bdf8)",
              boxShadow: "0 30px 80px rgba(37,99,235,0.45)",
              transform: "rotate(-3deg)",
            }}
          >
            <img src={avatar} width={360} height={360} alt="" style={{ borderRadius: 56, objectFit: "cover" }} />
          </div>
        )}
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
