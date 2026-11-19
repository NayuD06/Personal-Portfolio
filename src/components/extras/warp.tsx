"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuTrophy, LuX } from "react-icons/lu";
import { ui } from "@/data/ui";
import { saveSecret, secretIds, type SecretId } from "@/lib/extras";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { Jumpscare } from "./jumpscare";

// Easter egg: hiệu ứng rồi hiện thẻ thành tích.
// Mã Konami và lệnh sudo: "nhảy siêu tốc" (các vì sao kéo vệt từ giữa màn hình ra). Bấm logo 5 lần: màn jumpscare.
// Máy bật giảm chuyển động thì bỏ qua hiệu ứng, chỉ hiện thẻ.

const DURATION = 2400;
const colors = ["#e0f2fe", "#93c5fd", "#60a5fa", "#38bdf8", "#3b82f6"];

function Starfield({ onEnd }: { onEnd: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return onEnd();

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    const depth = Math.max(width, height);
    const count = width < 640 ? 260 : 520;
    const stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * depth,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // tăng tốc thật nhanh, giữ ở đỉnh, rồi chậm lại lúc cuối
      const speed = 4 + 70 * Math.sin(Math.PI * Math.min(1, t * 1.15));
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      for (const star of stars) {
        const previousZ = star.z;
        star.z -= speed;
        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = depth;
          continue;
        }
        const scale = 260 / star.z;
        const previousScale = 260 / previousZ;
        const x = cx + star.x * scale;
        const y = cy + star.y * scale;
        const px = cx + star.x * previousScale;
        const py = cy + star.y * previousScale;
        context.strokeStyle = star.color;
        context.globalAlpha = Math.min(1, 1.4 - star.z / depth);
        context.lineWidth = Math.min(3, 0.4 + scale * 0.9);
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(x, y);
        context.stroke();
      }
      context.globalAlpha = 1;
      if (t < 1) frame = requestAnimationFrame(draw);
      else onEnd();
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [onEnd]);

  return (
    <div aria-hidden="true" className="warp pointer-events-none fixed inset-0 z-[90]">
      <canvas ref={canvasRef} className="size-full" />
      <span className="warp-flash absolute top-1/2 left-1/2 size-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  );
}

export default function Warp({ id, onClose }: { id: SecretId; onClose: () => void }) {
  const lang = useLang();
  // lưu lại bí mật vừa tìm thấy (component này chỉ chạy trên trình duyệt)
  const [found] = useState<SecretId[]>(() => saveSecret(id));
  const [flying, setFlying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(!flying);

  const endFlight = useCallback(() => {
    setFlying(false);
    setVisible(true);
  }, []);

  // thẻ thành tích tự ẩn sau vài giây
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const secret = ui.secrets[id];
  const all = found.length === secretIds.length;
  const progress = pick(ui.secrets.progress, lang).replace("{found}", String(found.length)).replace("{total}", String(secretIds.length));

  return (
    <>
      {flying && (id === "logo" ? <Jumpscare onEnd={endFlight} /> : <Starfield onEnd={endFlight} />)}
      <AnimatePresence onExitComplete={onClose}>
        {visible && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="card fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[85] mx-auto flex max-w-md items-start gap-4 rounded-2xl p-4 shadow-[0_30px_90px_-20px_var(--glow-blue)] sm:bottom-8 print:hidden"
          >
            <span className="secret-badge bg-brand relative grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-[0_10px_30px_-8px_var(--glow-sky)]">
              <LuTrophy className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-blue">
                <T v={ui.secrets.unlocked} />
              </p>
              <p className="font-heading text-lg leading-snug font-extrabold">
                <T v={secret.title} />
              </p>
              <p className="mt-0.5 text-sm text-muted">
                <T v={secret.body} />
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="flex gap-1" aria-hidden="true">
                  {secretIds.map((secretId) => (
                    <span
                      key={secretId}
                      className={`h-1.5 w-6 rounded-full ${found.includes(secretId) ? "bg-brand" : "bg-[var(--border)]"}`}
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-muted">{progress}</span>
              </div>
              {all && (
                <p className="mt-2 text-sm font-semibold text-brand-sky">
                  <T v={ui.secrets.allFound} />
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label={pick(ui.secrets.dismiss, lang)}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-chip hover:text-fg"
            >
              <LuX className="size-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
