"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { LuArrowUp } from "react-icons/lu";
import { pick } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { ui } from "@/data/ui";

export function BackToTop() {
  const { scrollY } = useScroll();
  const lang = useLang();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 700));

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          data-quake
          href="#home"
          aria-label={pick(ui.nav.toTop, lang)}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
          // điện thoại / máy tính bảng: ẩn đi, vì nút "Trang chủ" ở thanh menu dưới đáy đã làm việc này (đỡ che nội dung)
          className="bg-brand fixed right-5 bottom-[5.25rem] z-40 hidden size-12 place-items-center rounded-2xl text-white shadow-[0_10px_30px_-8px_var(--glow-blue)] lg:grid"
        >
          <LuArrowUp className="size-5" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
