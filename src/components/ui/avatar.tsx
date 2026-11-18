import Image from "next/image";
import { profile } from "@/data/profile";

/** Ảnh đại diện. Chưa có ảnh thì hiện chữ viết tắt trên nền gradient. */
export function Avatar({ sizes, priority = false }: { sizes: string; priority?: boolean }) {
  if (profile.avatar) {
    return (
      <Image
        src={profile.avatar}
        alt={profile.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_25%,#1e3a8a,#060b16_60%,#0c2a4a)]">
      <div className="bg-grid absolute inset-0 opacity-60 [--grid-line:rgb(148_163_184/0.12)]" />
      <span className="text-gradient animate-gradient relative font-heading text-[clamp(4rem,14vw,8rem)] leading-none font-black tracking-tighter">
        {profile.initials}
      </span>
      <span className="absolute bottom-[18%] font-mono text-xs tracking-widest text-white/50">
        {"</>"}
      </span>
    </div>
  );
}
