"use client";

import { useEffect, useState } from "react";
import { getAudio } from "@/lib/extras";

// Easter egg bấm logo 5 lần: BÙM ngay lập tức, gương mặt ma lao ra đè lên trang, rung màn hình, tiếng hét,
// rồi trả lại trang như cũ sau khoảng 1,6 giây.
// Mặt ma vẽ bằng SVG, tiếng hét tạo bằng Web Audio, không dùng ảnh hay file âm thanh bên ngoài.
// Bấm bất kỳ đâu hoặc Esc để bỏ qua. Máy bật giảm chuyển động thì không hiện màn này (chỉ hiện thẻ thành tích).

const TOTAL = 1600;
/** Bấm chuột trong khoảng này chưa tính là bỏ qua (tránh lần bấm thứ 6 quá tay tắt luôn màn hù) */
const GUARD = 450;

/** Tiếng hét: vài sóng răng cưa trượt từ cao xuống thấp, rung nhanh, méo tiếng, thêm tiếng rít và một nhịp trống trầm */
function scream(context: AudioContext) {
  const now = context.currentTime;
  const end = now + 1.35;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(context.destination);

  const shaper = context.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / curve.length - 1;
    curve[i] = ((3 + 300) * x * 20 * (Math.PI / 180)) / (Math.PI + 300 * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.connect(master);

  const sources: AudioScheduledSourceNode[] = [];
  for (const [frequency, detune] of [
    [920, 0],
    [1380, 12],
    [610, -14],
  ]) {
    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.42, end);
    oscillator.detune.value = detune * 10;
    const wobble = context.createOscillator();
    const depth = context.createGain();
    wobble.frequency.value = 34;
    depth.gain.value = frequency * 0.07;
    wobble.connect(depth).connect(oscillator.frequency);
    oscillator.connect(shaper);
    sources.push(oscillator, wobble);
  }

  const noise = context.createBufferSource();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 1.3), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2200;
  band.Q.value = 0.7;
  noise.connect(band).connect(shaper);
  sources.push(noise);

  const boom = context.createOscillator();
  const boomGain = context.createGain();
  boom.frequency.setValueAtTime(90, now);
  boom.frequency.exponentialRampToValueAtTime(30, now + 0.5);
  boomGain.gain.setValueAtTime(0.9, now);
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  boom.connect(boomGain).connect(context.destination);
  sources.push(boom);

  for (const source of sources) {
    source.start(now);
    source.stop(end);
  }
  return () => {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(0.0001, context.currentTime);
    boomGain.gain.cancelScheduledValues(context.currentTime);
    boomGain.gain.setValueAtTime(0.0001, context.currentTime);
  };
}

/** Răng nhọn, dài ngắn không đều (cố định để lần nào cũng giống nhau) */
const upper = [26, 38, 22, 44, 30, 48, 34, 46, 24, 40, 28, 36];
const lower = [20, 30, 24, 36, 18, 34, 28, 38, 22, 32, 26, 20];

function teeth(lengths: number[], fromX: number, toX: number, baseY: (x: number) => number, direction: 1 | -1) {
  const step = (toX - fromX) / lengths.length;
  return lengths
    .map((length, index) => {
      const x = fromX + step * index + step / 2;
      const y = baseY(x);
      const half = step * 0.48;
      const tip = x + (index % 2 ? 2 : -2);
      return `M${x - half} ${y} L${tip} ${y + direction * length} L${x + half} ${y} Z`;
    })
    .join(" ");
}

/** Gương mặt ma: đầu hốc hác chìm vào bóng tối, hốc mắt sâu với đồng tử sáng rực, vệt đen chảy xuống, miệng há dài đầy răng nhọn */
function Face() {
  const top = (x: number) => 334 + ((x - 200) / 64) ** 2 * 6;
  const bottom = (x: number) => 458 - ((x - 200) / 60) ** 2 * 18;
  return (
    <svg viewBox="0 0 400 500" className="h-full w-auto" aria-hidden="true">
      <defs>
        <radialGradient id="js-skin" cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor="#2b3f6b" />
          <stop offset="0.42" stopColor="#111d3a" />
          <stop offset="0.75" stopColor="#050913" stopOpacity="0.85" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="js-socket">
          <stop offset="0.55" stopColor="#000" />
          <stop offset="1" stopColor="#03060f" />
        </radialGradient>
        <radialGradient id="js-glow">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.25" stopColor="#bae6fd" />
          <stop offset="0.6" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="js-throat" cx="50%" cy="85%" r="60%">
          <stop offset="0" stopColor="#0c1d44" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <filter id="js-soft">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="js-blur">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* đầu hốc hác, cằm nhọn */}
      <path
        d="M200 10 C 290 10 350 80 352 180 C 354 250 330 300 318 340 C 300 400 262 470 200 492 C 138 470 100 400 82 340 C 70 300 46 250 48 180 C 50 80 110 10 200 10 Z"
        fill="url(#js-skin)"
      />
      {/* má hóp */}
      <ellipse cx="104" cy="318" rx="30" ry="60" fill="#000" opacity="0.7" filter="url(#js-blur)" />
      <ellipse cx="296" cy="318" rx="30" ry="60" fill="#000" opacity="0.7" filter="url(#js-blur)" />
      {/* vết nứt */}
      <path d="M200 12 L188 58 L206 92 L192 136 M122 62 L146 104 L132 146 M286 74 L264 118 L282 150" stroke="#38bdf8" strokeOpacity="0.28" strokeWidth="2" fill="none" />

      {/* hốc mắt sâu, lệch nhau một chút */}
      <path d="M66 192 C 76 128 172 118 192 192 C 198 238 172 274 132 276 C 94 274 62 242 66 192 Z" fill="url(#js-socket)" filter="url(#js-soft)" />
      <path d="M334 186 C 322 124 230 120 208 194 C 202 242 230 270 270 272 C 308 270 338 238 334 186 Z" fill="url(#js-socket)" filter="url(#js-soft)" />
      {/* vệt đen chảy từ mắt xuống */}
      <path d="M118 272 C 114 300 122 332 112 380 M140 276 C 142 296 136 316 140 338 M262 270 C 266 300 258 336 268 386 M284 266 C 282 290 290 306 286 330" stroke="#000" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* đồng tử sáng rực */}
      <circle cx="134" cy="206" r="30" fill="url(#js-glow)" filter="url(#js-blur)" />
      <circle cx="266" cy="204" r="30" fill="url(#js-glow)" filter="url(#js-blur)" />
      <circle cx="134" cy="206" r="5.5" fill="#fff" />
      <circle cx="266" cy="204" r="5.5" fill="#fff" />

      {/* lỗ mũi */}
      <path d="M188 282 C 180 298 182 310 194 312 Z M212 282 C 220 298 218 310 206 312 Z" fill="#000" />

      {/* miệng há dài */}
      <path d="M128 334 C 150 316 250 316 272 334 C 286 384 262 474 200 480 C 138 474 114 384 128 334 Z" fill="url(#js-throat)" />
      <path d={teeth(upper, 136, 264, top, 1)} fill="#dbeafe" />
      <path d={teeth(lower, 148, 252, bottom, -1)} fill="#bfdbfe" />
    </svg>
  );
}

export function Jumpscare({ onEnd }: { onEnd: () => void }) {
  const [shownAt] = useState(() => performance.now());

  useEffect(() => {
    let stop: (() => void) | undefined;
    // hét ngay khi mặt ma hiện ra (đợi một nhịp để chế độ dev của React không phát hai lần)
    const impact = window.setTimeout(() => {
      const context = getAudio();
      if (context) {
        try {
          stop = scream(context);
        } catch {
          // trình duyệt chặn âm thanh: vẫn có hình
        }
      }
    }, 0);
    const done = window.setTimeout(onEnd, TOTAL);
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEnd();
    };
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(impact);
      window.clearTimeout(done);
      window.removeEventListener("keydown", skip);
      stop?.();
    };
  }, [onEnd]);

  return (
    <div role="presentation" onClick={() => performance.now() - shownAt > GUARD && onEnd()} className="js-root fixed inset-0 z-[95] cursor-pointer overflow-hidden print:hidden">
      <span aria-hidden="true" className="js-dim absolute inset-0 bg-black" />
      <div className="js-face absolute inset-0 grid place-items-center">
        <div className="js-shake h-[min(96vh,140vw)]">
          <Face />
        </div>
      </div>
      {/* tối dần ra mép màn hình */}
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#000_80%)]" />
      <span aria-hidden="true" className="js-flash absolute inset-0 bg-[#e0f2fe]" />
      <span aria-hidden="true" className="js-noise absolute inset-0" />
    </div>
  );
}
