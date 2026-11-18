import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

// Ảnh xem trước khi chia sẻ link (Facebook, Zalo, LinkedIn...), tạo lúc build.
export const alt = `${profile.name}, ${profile.roles[0]}`;
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
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "#eef3ff",
          background:
            "radial-gradient(circle at 15% 20%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 90% 90%, rgba(56,189,248,0.3), transparent 45%), #04070d",
        }}
      >
        <div style={{ fontSize: 44, color: "#9fb0cf" }}>{profile.greeting}</div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            backgroundImage: "linear-gradient(90deg, #2563eb, #60a5fa, #38bdf8)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {profile.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 48, fontWeight: 700 }}>{profile.roles[0]}</div>
        <div style={{ display: "flex", marginTop: 40, width: 120, height: 8, borderRadius: 8, background: "linear-gradient(90deg, #2563eb, #38bdf8)" }} />
      </div>
    ),
    size,
  );
}
