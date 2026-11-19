"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { foundSecret } from "@/lib/extras";
import { pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { Avatar } from "./avatar";

/** Ảnh pixel 8-bit ở mặt sau (64 x 64 điểm ảnh, phóng to bằng CSS cho nét vuông vức) */
const PIXEL_SRC = "/avatar-8bit.png";

/**
 * Ảnh đại diện ở đầu trang. Easter egg: nhấp đúp (chạm hai lần trên điện thoại, hoặc Tab tới rồi nhấn Enter / Space)
 * thì ảnh lật ngược như lá bài, mặt sau là mình phiên bản pixel 8-bit. Làm lại lần nữa thì lật về.
 * Máy bật "giảm chuyển động" thì đổi ảnh ngay, không xoay.
 */
export function AvatarFlip({ sizes }: { sizes: string }) {
  const lang = useLang();
  const [flipped, setFlipped] = useState(false);
  const lastClick = useRef(0);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) foundSecret("pixel");
  };

  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={pick(ui.hero.photo, lang).replace("{name}", profile.name)}
      onClick={(event) => {
        // nhấn Enter / Space trên bàn phím: lật luôn (event.detail = 0)
        if (event.detail === 0) return flip();
        // chuột / ngón tay: chỉ lật khi bấm hai lần liên tiếp (dưới 0,4 giây)
        if (event.timeStamp - lastClick.current < 400) {
          lastClick.current = 0;
          flip();
        } else {
          lastClick.current = event.timeStamp;
        }
      }}
      // viền focus bo theo khung ảnh (quy tắc :focus-visible chung không đặt bo góc cho nút này)
      style={{ borderRadius: "2.5rem" }}
      className="avatar-flip relative block size-full touch-manipulation select-none"
    >
      <span className="avatar-flip-inner relative block size-full">
        {/* mặt trước: ảnh thật */}
        <span className="avatar-face bg-brand absolute inset-0 rounded-[2.5rem] p-[3px] shadow-[0_0_80px_-10px_var(--glow-blue)]">
          <span className="relative block size-full overflow-hidden rounded-[calc(2.5rem-3px)] bg-bg">
            <Avatar sizes={sizes} priority />
          </span>
        </span>
        {/* mặt sau: ảnh pixel 8-bit, có vạch quét như màn hình máy chơi game cũ */}
        <span className="avatar-face avatar-back bg-brand absolute inset-0 rounded-[2.5rem] p-[3px] shadow-[0_0_80px_-10px_var(--glow-blue)]">
          <span className="relative block size-full overflow-hidden rounded-[calc(2.5rem-3px)] bg-[#060c1a]">
            <Image
              src={PIXEL_SRC}
              alt={pick(ui.hero.pixelAlt, lang).replace("{name}", profile.name)}
              fill
              unoptimized
              sizes={sizes}
              className="pixelated object-cover"
            />
            <span aria-hidden="true" className="avatar-scan absolute inset-0" />
            {/* nhãn chỉ để trang trí: chữ vẽ bằng CSS (::before) nên không lẫn vào tên nút mà trình đọc màn hình đọc */}
            <span aria-hidden="true" className="absolute top-3 left-3 rounded-md bg-[#020617]/80 px-2 py-1 font-mono text-[10px] leading-none font-bold tracking-[0.2em] text-[#93c5fd] sm:top-4 sm:left-4 sm:text-[11px]">
              <span className="l-en css-text" data-text={ui.hero.pixelBadge.en} />
              <span className="l-vi css-text" data-text={ui.hero.pixelBadge.vi} />
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
