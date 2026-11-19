"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { LuTrophy, LuX } from "react-icons/lu";
import { ui } from "@/data/ui";
import { saveSecret, secretIds, type SecretId } from "@/lib/extras";
import { pick, T } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";
import { profile } from "@/data/profile";
import { Jumpscare } from "./jumpscare";

// Easter egg: hiệu ứng rồi hiện thẻ thành tích.
// Mã Konami và lệnh sudo: "nhảy siêu tốc" (các vì sao kéo vệt từ giữa màn hình ra). Bấm logo 5 lần: màn jumpscare.
// Gõ "duyan": mưa code. Lắc chuột hoặc điện thoại: cả trang rung, các mảng rơi xuống rồi tự lắp lại.
// Console, rm -rf / và cú đêm thì chỉ hiện thẻ (hiệu ứng nằm ở Console và Terminal).
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

const RAIN = 4200;
const glyphs = "01{}[]<>/\\=+*#$%&;:ĐƯƠĂÂÊÔDUYAN".split("");

/** Mưa code: từng cột ký tự rơi xuống, đầu cột sáng trắng, đuôi xanh mờ dần, giữa màn hình hiện tên */
function CodeRain({ onEnd }: { onEnd: () => void }) {
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

    const size = width < 640 ? 14 : 18;
    const columns = Math.ceil(width / size);
    // mỗi cột bắt đầu ở một độ cao khác nhau phía trên màn hình, rơi với tốc độ riêng
    const drops = Array.from({ length: columns }, () => -Math.random() * (height / size));
    const speeds = Array.from({ length: columns }, () => 0.35 + Math.random() * 0.55);
    const glyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
    context.font = `${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    context.textBaseline = "top";

    const start = performance.now();
    let last = start;
    let frame = 0;
    const draw = (now: number) => {
      const t = (now - start) / RAIN;
      const step = Math.min(3, (now - last) / 16.7);
      last = now;
      // phủ một lớp tối mỏng mỗi khung hình: chữ cũ mờ dần thành vệt, trang phía sau tối dần
      context.fillStyle = "rgba(2, 6, 23, 0.14)";
      context.fillRect(0, 0, width, height);
      for (let column = 0; column < columns; column++) {
        const y = Math.floor(drops[column]) * size;
        const x = column * size;
        if (y >= 0) {
          context.fillStyle = "#38bdf8";
          context.fillText(glyph(), x, y - size);
          context.fillStyle = "#e0f2fe";
          context.fillText(glyph(), x, y);
        }
        drops[column] += speeds[column] * step;
        // rơi hết màn hình thì bắt đầu lại từ trên (gần cuối thì thôi để mưa tạnh dần)
        if (y > height && t < 0.75 && Math.random() > 0.96) drops[column] = 0;
      }
      if (t < 1) frame = requestAnimationFrame(draw);
      else onEnd();
    };
    frame = requestAnimationFrame(draw);
    const skip = (event: KeyboardEvent) => event.key === "Escape" && onEnd();
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", skip);
    };
  }, [onEnd]);

  return (
    <div role="presentation" onClick={onEnd} className="rain fixed inset-0 z-[90] cursor-pointer print:hidden">
      <canvas ref={canvasRef} aria-hidden="true" className="size-full" />
      <p aria-hidden="true" className="rain-word pointer-events-none absolute inset-0 grid place-items-center font-mono text-[clamp(2.5rem,10vw,7rem)] font-bold tracking-[0.2em] text-[#e0f2fe]">
        {profile.name.toUpperCase()}
      </p>
    </div>
  );
}

const QUAKE = 3100;

/**
 * Động đất: cả trang rung lên, rồi từng mảng đang thấy trên màn hình (tiêu đề, thẻ, đoạn chữ...) rơi xuống,
 * xoay lung tung, một lúc sau bay ngược lên đúng chỗ cũ. Chỉ dùng animation của trình duyệt, không đổi DOM.
 */
function Quake({ onEnd }: { onEnd: () => void }) {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return onEnd();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const screen = vw * vh;

    // chọn mảnh: khối nào chiếm quá nhiều màn hình thì tách vào trong, nhỏ quá hoặc chỉ để trang trí thì bỏ qua
    const pieces: HTMLElement[] = [];
    const visit = (element: Element) => {
      for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement) || pieces.length >= 40 || child.getAttribute("aria-hidden") === "true") continue;
        const rect = child.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) * Math.max(0, Math.min(rect.right, vw) - Math.max(rect.left, 0));
        if (visible === 0) continue;
        if (visible > screen * 0.3) {
          if (child.children.length > 0) visit(child);
        } else if (visible > screen * 0.004) pieces.push(child);
      }
    };
    visit(main);

    const animations: Animation[] = [
      main.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: "translate(-10px, 4px) rotate(-0.4deg)" },
          { transform: "translate(9px, -5px) rotate(0.4deg)" },
          { transform: "translate(-7px, -3px)" },
          { transform: "translate(6px, 5px) rotate(0.3deg)" },
          { transform: "translate(0, 0)" },
        ],
        { duration: 110, iterations: 5 },
      ),
    ];
    for (const piece of pieces) {
      const rect = piece.getBoundingClientRect();
      const fallen = `translate(${(Math.random() - 0.5) * 160}px, ${vh - rect.top + 80 + Math.random() * 140}px) rotate(${(Math.random() - 0.5) * 70}deg)`;
      const fallStart = 550 + Math.random() * 450;
      const fallEnd = fallStart + 650 + Math.random() * 250;
      const riseStart = 2000 + Math.random() * 300;
      const at = (ms: number) => ms / QUAKE;
      animations.push(
        piece.animate(
          [
            { transform: "none", offset: 0 },
            // rơi nhanh dần như bị trọng lực kéo
            { transform: "none", offset: at(fallStart), easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
            { transform: fallen, offset: at(fallEnd) },
            // bay về, hơi lố một chút rồi khớp vào chỗ cũ
            { transform: fallen, offset: at(riseStart), easing: "cubic-bezier(0.2, 0.9, 0.3, 1.2)" },
            { transform: "none", offset: at(riseStart + 700) },
            { transform: "none", offset: 1 },
          ],
          { duration: QUAKE, composite: "add" },
        ),
      );
    }
    const done = window.setTimeout(onEnd, QUAKE);
    return () => {
      window.clearTimeout(done);
      for (const animation of animations) animation.cancel();
    };
  }, [onEnd]);

  return null;
}

/** Bí mật nào có hiệu ứng riêng trước khi hiện thẻ */
const effects: Partial<Record<SecretId, ComponentType<{ onEnd: () => void }>>> = {
  konami: Starfield,
  sudo: Starfield,
  logo: Jumpscare,
  matrix: CodeRain,
  shake: Quake,
};

export default function Warp({ id, onClose }: { id: SecretId; onClose: () => void }) {
  const lang = useLang();
  // lưu lại bí mật vừa tìm thấy (component này chỉ chạy trên trình duyệt)
  const [found] = useState<SecretId[]>(() => saveSecret(id));
  const Effect = effects[id];
  const [flying, setFlying] = useState(() => Boolean(Effect) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
      {flying && Effect && <Effect onEnd={endFlight} />}
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
                      className={`h-1.5 w-4 rounded-full ${found.includes(secretId) ? "bg-brand" : "bg-[var(--border)]"}`}
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
