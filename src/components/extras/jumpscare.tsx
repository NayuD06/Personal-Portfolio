"use client";

import { useEffect, useState } from "react";
import { ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { getAudio } from "@/lib/extras";

// Easter egg bấm logo 5 lần: BÙM ngay lập tức. Gương mặt trắng bệch lao vào màn hình theo ba nhịp
// (mỗi nhịp một cú giật kèm chớp trắng, nhịp cuối sát tới mức hai hốc mắt chiếm cả màn hình), giữa các nhịp
// thì co giật và nghiêng đầu từ từ, rồi tối sập lại với dòng chữ ma nhấp nháy trong tiếng nhiễu,
// sau khoảng 2,3 giây trả lại trang như cũ.
// Chớp sáng giữ dưới 3 lần mỗi giây để an toàn cho người nhạy cảm với ánh sáng nhấp nháy.
// Mặt ma vẽ bằng SVG, âm thanh tạo bằng Web Audio, không dùng ảnh hay file âm thanh bên ngoài.
// Thời gian từng nhịp trong CSS (nhóm .js-* ở globals.css) khớp với HITS bên dưới.
// Bấm bất kỳ đâu hoặc Esc để bỏ qua. Máy bật giảm chuyển động thì không hiện màn này (chỉ hiện thẻ thành tích).

const TOTAL = 2300;
/** Bấm chuột trong khoảng này chưa tính là bỏ qua (tránh lần bấm thứ 6 quá tay tắt luôn màn hù) */
const GUARD = 450;
/** Ba cú giật (giây): mặt hiện ra, lao gần hơn, lao sát mặt người xem */
const HITS = [0, 0.38, 1.12];
/** Lúc mặt ma biến mất, chỉ còn bóng tối, chữ và tiếng nhiễu */
const BLACKOUT = 1.32;

function noiseBuffer(context: AudioContext, seconds: number) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Âm thanh: tiếng hét giống giọng người (sóng răng cưa lọc qua các dải tần của nguyên âm "a", rung giọng, méo tiếng),
 * hợp âm chói kiểu phim kinh dị, mỗi cú giật thêm một tiếng nổ trầm và tiếng xé, cuối cùng là tiếng nhiễu TV rè rè.
 */
function scream(context: AudioContext) {
  const now = context.currentTime;
  const sources: AudioScheduledSourceNode[] = [];
  const gains: GainNode[] = [];
  const play = (source: AudioScheduledSourceNode, start: number, stop: number) => {
    source.start(now + start);
    source.stop(now + stop);
    sources.push(source);
  };

  // nén lại cho to mà không vỡ tiếng
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 6;
  compressor.ratio.value = 10;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.18;
  const master = context.createGain();
  master.gain.value = 0.85;
  compressor.connect(master).connect(context.destination);
  gains.push(master);

  const drive = context.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / curve.length - 1;
    curve[i] = ((1 + 60) * x) / (1 + 60 * Math.abs(x));
  }
  drive.curve = curve;
  drive.oversample = "2x";
  drive.connect(compressor);

  // 1. tiếng hét: cao vọt lên rồi kéo dài, mỗi cú giật gắt hơn, tắt phụt khi màn hình tối
  const voice = context.createGain();
  voice.gain.setValueAtTime(0.0001, now);
  voice.gain.exponentialRampToValueAtTime(0.9, now + 0.015);
  for (const hit of HITS.slice(1)) {
    voice.gain.setValueAtTime(0.55, now + hit - 0.02);
    voice.gain.exponentialRampToValueAtTime(1.2, now + hit + 0.02);
  }
  voice.gain.setValueAtTime(1, now + BLACKOUT - 0.03);
  voice.gain.exponentialRampToValueAtTime(0.0001, now + BLACKOUT + 0.04);
  gains.push(voice);
  for (const [frequency, gain, Q] of [
    [820, 1, 7],
    [1180, 0.7, 8],
    [2900, 0.35, 10],
  ]) {
    const formant = context.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.value = frequency;
    formant.Q.value = Q;
    const level = context.createGain();
    level.gain.value = gain * 3;
    voice.connect(formant).connect(level).connect(drive);
  }
  for (const detune of [0, 14, -11]) {
    const vocal = context.createOscillator();
    vocal.type = "sawtooth";
    vocal.detune.value = detune;
    vocal.frequency.setValueAtTime(420, now);
    vocal.frequency.exponentialRampToValueAtTime(760, now + 0.22);
    vocal.frequency.setValueAtTime(700, now + HITS[1]);
    vocal.frequency.exponentialRampToValueAtTime(880, now + HITS[1] + 0.1);
    vocal.frequency.exponentialRampToValueAtTime(640, now + HITS[2] - 0.05);
    vocal.frequency.exponentialRampToValueAtTime(980, now + HITS[2] + 0.06);
    vocal.frequency.exponentialRampToValueAtTime(520, now + BLACKOUT);
    // rung giọng
    const vibrato = context.createOscillator();
    const depth = context.createGain();
    vibrato.frequency.value = 9 + detune / 10;
    depth.gain.value = 38;
    vibrato.connect(depth).connect(vocal.frequency);
    vocal.connect(voice);
    play(vocal, 0, BLACKOUT + 0.1);
    play(vibrato, 0, BLACKOUT + 0.1);
  }
  // hơi thở khàn trong tiếng hét
  const breath = context.createBufferSource();
  breath.buffer = noiseBuffer(context, BLACKOUT + 0.1);
  const breathLevel = context.createGain();
  breathLevel.gain.value = 0.35;
  breath.connect(breathLevel).connect(voice);
  play(breath, 0, BLACKOUT + 0.1);

  // 2. hợp âm chói: các nốt cách nhau nửa cung, vang lên ở cú giật đầu và cú cuối
  for (const hit of [HITS[0], HITS[2]]) {
    const stab = context.createGain();
    stab.gain.setValueAtTime(0.0001, now + hit);
    stab.gain.exponentialRampToValueAtTime(0.5, now + hit + 0.01);
    stab.gain.exponentialRampToValueAtTime(0.0001, now + hit + 0.7);
    stab.connect(drive);
    gains.push(stab);
    for (const frequency of [110, 116.5, 123.5, 233, 247]) {
      const note = context.createOscillator();
      note.type = "square";
      note.frequency.value = frequency;
      note.connect(stab);
      play(note, hit, hit + 0.75);
    }
  }

  // 3. mỗi cú giật: tiếng nổ trầm tụt xuống và tiếng xé ngắn
  for (const hit of HITS) {
    const boom = context.createOscillator();
    const boomLevel = context.createGain();
    boom.frequency.setValueAtTime(130, now + hit);
    boom.frequency.exponentialRampToValueAtTime(32, now + hit + 0.45);
    boomLevel.gain.setValueAtTime(0.0001, now + hit);
    boomLevel.gain.exponentialRampToValueAtTime(1, now + hit + 0.008);
    boomLevel.gain.exponentialRampToValueAtTime(0.0001, now + hit + 0.55);
    boom.connect(boomLevel).connect(compressor);
    play(boom, hit, hit + 0.6);
    gains.push(boomLevel);

    const tear = context.createBufferSource();
    tear.buffer = noiseBuffer(context, 0.16);
    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 1800;
    const tearLevel = context.createGain();
    tearLevel.gain.setValueAtTime(0.9, now + hit);
    tearLevel.gain.exponentialRampToValueAtTime(0.0001, now + hit + 0.15);
    tear.connect(high).connect(tearLevel).connect(drive);
    play(tear, hit, hit + 0.16);
    gains.push(tearLevel);
  }

  // 4. tiếng nhiễu TV rè rè, chập chờn trong lúc tối, nhỏ dần
  const staticEnd = 2.05;
  const hiss = context.createBufferSource();
  hiss.buffer = noiseBuffer(context, staticEnd - BLACKOUT);
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3200;
  band.Q.value = 0.6;
  const hissLevel = context.createGain();
  hissLevel.gain.setValueAtTime(0.0001, now + BLACKOUT);
  hissLevel.gain.exponentialRampToValueAtTime(0.32, now + BLACKOUT + 0.03);
  hissLevel.gain.exponentialRampToValueAtTime(0.0001, now + staticEnd);
  const flutter = context.createOscillator();
  const flutterDepth = context.createGain();
  flutter.type = "square";
  flutter.frequency.value = 13;
  flutterDepth.gain.value = 0.16;
  flutter.connect(flutterDepth).connect(hissLevel.gain);
  hiss.connect(band).connect(hissLevel).connect(compressor);
  play(hiss, BLACKOUT, staticEnd);
  play(flutter, BLACKOUT, staticEnd);
  gains.push(hissLevel);

  return () => {
    const t = context.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(0, t);
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // đã dừng
      }
    }
  };
}

/** Răng nhọn, dài ngắn không đều (cố định để lần nào cũng giống nhau) */
const upper = [30, 44, 26, 52, 34, 58, 40, 54, 28, 48, 32, 42];
const lower = [24, 36, 28, 44, 22, 40, 34, 46, 26, 38, 30, 24];

function teeth(lengths: number[], fromX: number, toX: number, baseY: (x: number) => number, direction: 1 | -1) {
  const step = (toX - fromX) / lengths.length;
  return lengths
    .map((length, index) => {
      const x = fromX + step * index + step / 2;
      const y = baseY(x);
      const half = step * 0.5;
      const tip = x + (index % 2 ? 2.5 : -2.5);
      return `M${x - half} ${y} L${tip} ${y + direction * length} L${x + half} ${y} Z`;
    })
    .join(" ");
}

/**
 * Gương mặt ma: da trắng bệch xám ngắt, gân thâm quanh mắt, hai hốc mắt đen sâu hoắm chỉ còn đốm sáng nhỏ,
 * vệt đen chảy dài, miệng há toạc tới cằm đầy răng nhọn ố vàng.
 */
/** Giọt chảy: thân thon dần, đầu dưới tròn như giọt mực */
function drip(x: number, y: number, length: number, width: number) {
  const end = y + length;
  return `M${x - width} ${y} C${x - width} ${y + length * 0.5} ${x - width * 0.4} ${end - length * 0.2} ${x - width * 0.7} ${end} A${width * 0.75} ${width * 0.75} 0 0 0 ${x + width * 0.7} ${end} C${x + width * 0.4} ${end - length * 0.2} ${x + width * 0.3} ${y + length * 0.4} ${x + width} ${y} Z`;
}

const DRIPS = [
  [100, 250, 160, 5],
  [118, 255, 70, 3.5],
  [150, 258, 46, 3],
  [250, 255, 52, 3],
  [282, 252, 82, 4],
  [300, 248, 172, 5.5],
]
  .map(([x, y, length, width]) => drip(x, y, length, width))
  .join(" ");

const HEAD = "M200 8 C 292 8 352 80 354 184 C 356 256 332 306 320 348 C 302 412 262 486 200 512 C 138 486 98 412 80 348 C 68 306 44 256 46 184 C 48 80 108 8 200 8 Z";

function Face() {
  const top = (x: number) => 322 + ((x - 200) / 70) ** 2 * 9;
  const bottom = (x: number) => 470 - ((x - 200) / 64) ** 2 * 20;
  return (
    <svg viewBox="0 0 400 520" className="h-full w-auto" aria-hidden="true">
      <defs>
        <radialGradient id="js-skin" cx="50%" cy="36%" r="62%">
          <stop offset="0" stopColor="#eef2f6" />
          <stop offset="0.35" stopColor="#c3ccd6" />
          <stop offset="0.62" stopColor="#6b7684" />
          <stop offset="0.82" stopColor="#1c222b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* bóng đổ từ dưới cằm lên như bị rọi đèn từ trên */}
        <linearGradient id="js-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="js-socket">
          <stop offset="0.6" stopColor="#000" />
          <stop offset="0.85" stopColor="#0b0f15" />
          <stop offset="1" stopColor="#3b4450" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="js-glow">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="js-throat" cx="50%" cy="80%" r="65%">
          <stop offset="0" stopColor="#111" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <filter id="js-soft">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="js-blur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="js-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id="js-clip">
          <path d={HEAD} />
        </clipPath>
      </defs>

      {/* đầu dài, hốc hác, cằm nhọn; phủ thêm lớp da sần và bóng tối phía dưới */}
      <path d={HEAD} fill="url(#js-skin)" />
      <g clipPath="url(#js-clip)">
        <path d={HEAD} fill="#000" filter="url(#js-rough)" />
        <path d={HEAD} fill="url(#js-shade)" />
        {/* má hóp, thái dương lõm */}
        <ellipse cx="102" cy="322" rx="32" ry="66" fill="#000" opacity="0.75" filter="url(#js-blur)" />
        <ellipse cx="298" cy="322" rx="32" ry="66" fill="#000" opacity="0.75" filter="url(#js-blur)" />
        <ellipse cx="66" cy="170" rx="18" ry="50" fill="#000" opacity="0.5" filter="url(#js-blur)" />
        <ellipse cx="334" cy="170" rx="18" ry="50" fill="#000" opacity="0.5" filter="url(#js-blur)" />
        {/* vết nứt trên trán */}
        <path d="M200 10 L186 56 L206 94 L190 140 M120 60 L146 104 L130 150 M288 72 L264 118 L284 154" stroke="#1f2937" strokeOpacity="0.7" strokeWidth="2.2" fill="none" />

        {/* quầng thâm và gân quanh mắt */}
        <ellipse cx="132" cy="214" rx="78" ry="72" fill="#1e293b" opacity="0.55" filter="url(#js-blur)" />
        <ellipse cx="268" cy="212" rx="78" ry="72" fill="#1e293b" opacity="0.55" filter="url(#js-blur)" />
        <path
          d="M60 214 C 48 236 52 262 40 282 M74 262 C 70 286 80 300 72 326 M200 168 C 206 150 198 136 204 118 M338 224 C 352 246 346 266 360 288 M322 262 C 330 284 320 302 330 326"
          stroke="#334155"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />

        {/* hốc mắt đen sâu hoắm, lệch nhau một chút */}
        <path d="M60 196 C 70 122 178 112 196 196 C 202 248 172 286 128 288 C 88 286 54 250 60 196 Z" fill="url(#js-socket)" filter="url(#js-soft)" />
        <path d="M340 190 C 326 120 226 116 204 198 C 198 250 228 282 272 284 C 312 282 346 246 340 190 Z" fill="url(#js-socket)" filter="url(#js-soft)" />
        {/* vệt đen chảy ra từ trong hốc mắt */}
        <path d={DRIPS} fill="#000" opacity="0.92" />
        {/* đốm sáng nhỏ ở giữa hốc mắt */}
        <circle cx="130" cy="212" r="20" fill="url(#js-glow)" filter="url(#js-soft)" />
        <circle cx="270" cy="208" r="20" fill="url(#js-glow)" filter="url(#js-soft)" />
        <circle cx="130" cy="212" r="3.5" fill="#fff" />
        <circle cx="270" cy="208" r="3.5" fill="#fff" />

        {/* mũi gần như không còn, chỉ hai khe đen */}
        <path d="M190 268 C 181 284 183 297 195 300 Z M210 268 C 219 284 217 297 205 300 Z" fill="#000" />

        {/* miệng há toạc tới cằm, hai khóe miệng rách ngược lên tận má */}
        <path d="M126 337 C 108 334 92 322 78 298 C 94 318 110 328 126 331 Z M274 337 C 292 334 308 322 322 298 C 306 318 290 328 274 331 Z" fill="#000" />
        <path d="M124 336 C 150 318 250 318 276 336 C 292 390 266 488 200 496 C 134 488 108 390 124 336 Z" fill="url(#js-throat)" />
        <path d="M124 336 C 150 318 250 318 276 336" stroke="#0f172a" strokeWidth="6" fill="none" />
        <path d={teeth(upper, 132, 268, top, 1)} fill="#e9e4d4" />
        <path d={teeth(lower, 144, 256, bottom, -1)} fill="#d9d2bd" />
      </g>
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
    <div
      role="presentation"
      onClick={() => performance.now() - shownAt > GUARD && onEnd()}
      className="js-root fixed inset-0 z-[95] overflow-hidden bg-black print:hidden"
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="js-lunge">
          <div className="js-twitch h-[min(100vh,150vw)]">
            <Face />
          </div>
        </div>
      </div>
      {/* tối dần ra mép màn hình */}
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000_78%)]" />
      {/* chữ ma nhấp nháy trong bóng tối */}
      <p aria-hidden="true" className="js-words absolute inset-0 grid place-items-center px-6 text-center">
        <span className="js-words-text">
          <T v={ui.secrets.logo.whisper} />
        </span>
      </p>
      <span aria-hidden="true" className="js-flash absolute inset-0 bg-[#f1f5f9]" />
      <span aria-hidden="true" className="js-noise absolute inset-0" />
      <span aria-hidden="true" className="js-scan absolute inset-0" />
    </div>
  );
}
