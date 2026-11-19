"use client";

import { useEffect, useState } from "react";
import { ui } from "@/data/ui";
import { T } from "@/lib/i18n";
import { getAudio } from "@/lib/extras";

// Easter egg bấm logo 5 lần: BÙM ngay lập tức. Gương mặt trắng bệch lao vào màn hình theo ba nhịp
// (mỗi nhịp một cú giật kèm chớp trắng, nhịp cuối sát tới mức hai hốc mắt chiếm cả màn hình), giữa các nhịp
// thì co giật và nghiêng đầu từ từ, rồi tối sập lại với dòng chữ ma nhấp nháy và tiếng thở sát bên tai,
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
/** Lúc mặt ma biến mất, chỉ còn bóng tối, chữ và tiếng thở */
const BLACKOUT = 1.32;
/** Âm lượng tổng: tăng hoặc giảm số này để chỉnh to nhỏ (0,8 nhỏ hơn bản tiếng hét cũ khoảng 10 dB) */
const VOLUME = 0.8;

function noiseBuffer(context: AudioContext, seconds: number) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Tiếng vang của một căn phòng rộng, tạo bằng nhiễu tắt dần (cho âm thanh nghe xa xăm, lạnh lẽo) */
function impulse(context: AudioContext, seconds: number) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5;
  }
  return buffer;
}

/**
 * Âm thanh (không còn tiếng hét): mỗi cú giật là một tiếng "BRÀM" trầm kiểu trailer phim kinh dị kèm tiếng chuông kim loại
 * lệch tông rung rền, trước mỗi cú giật có tiếng gió hút lên, giữa chừng là nhịp tim. Khi màn hình tối thì có tiếng thở
 * khò khè sát bên tai trái và vài nốt hộp nhạc lệch tông. Tất cả đi qua tiếng vang phòng rộng, âm lượng vừa phải.
 */
function haunt(context: AudioContext) {
  const now = context.currentTime;
  const sources: AudioScheduledSourceNode[] = [];
  const play = (source: AudioScheduledSourceNode, start: number, stop: number) => {
    source.start(now + start);
    source.stop(now + stop);
    sources.push(source);
  };
  /** Bật nhanh rồi tắt dần */
  const envelope = (gain: AudioParam, start: number, peak: number, attack: number, release: number) => {
    gain.setValueAtTime(0.0001, now + start);
    gain.exponentialRampToValueAtTime(peak, now + start + attack);
    gain.exponentialRampToValueAtTime(0.0001, now + start + attack + release);
  };
  const oscillator = (type: OscillatorType, frequency: number) => {
    const node = context.createOscillator();
    node.type = type;
    node.frequency.value = frequency;
    return node;
  };
  const gain = (value = 1) => {
    const node = context.createGain();
    node.gain.value = value;
    return node;
  };
  const filter = (type: BiquadFilterType, frequency: number, Q = 1) => {
    const node = context.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = Q;
    return node;
  };
  const noise = (seconds: number) => {
    const node = context.createBufferSource();
    node.buffer = noiseBuffer(context, seconds);
    return node;
  };

  // đường ra: nén nhẹ cho đều tiếng, âm lượng tổng vừa phải
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 10;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.25;
  const master = gain(VOLUME);
  compressor.connect(master).connect(context.destination);
  // "bus" đi thẳng ra loa và gửi thêm một phần vào tiếng vang
  const reverb = context.createConvolver();
  reverb.buffer = impulse(context, 2.4);
  reverb.connect(gain(0.5)).connect(compressor);
  const bus = gain();
  bus.connect(compressor);
  bus.connect(reverb);

  HITS.forEach((hit, index) => {
    const strength = index === 1 ? 0.6 : 1;

    // 1. tiếng BRÀM: chùm sóng răng cưa thật trầm, lệch tông nhau, mở bộ lọc bật lên rồi đóng lại, hơi tụt cao độ
    const braamFilter = filter("lowpass", 140, 3);
    braamFilter.frequency.setValueAtTime(140, now + hit);
    braamFilter.frequency.exponentialRampToValueAtTime(1800, now + hit + 0.07);
    braamFilter.frequency.exponentialRampToValueAtTime(170, now + hit + 0.95);
    const braam = gain(0);
    envelope(braam.gain, hit, 0.5 * strength, 0.012, 0.95);
    braamFilter.connect(braam).connect(bus);
    for (const frequency of [49, 51.9, 73.4, 104]) {
      const voice = oscillator("sawtooth", frequency);
      voice.frequency.setValueAtTime(frequency, now + hit);
      voice.frequency.exponentialRampToValueAtTime(frequency * 0.94, now + hit + 1);
      voice.connect(braamFilter);
      play(voice, hit, hit + 1.05);
    }

    // tiếng dội trầm dưới chân
    const sub = oscillator("sine", 80);
    sub.frequency.setValueAtTime(80, now + hit);
    sub.frequency.exponentialRampToValueAtTime(34, now + hit + 0.5);
    const subLevel = gain(0);
    envelope(subLevel.gain, hit, 0.35 * strength, 0.006, 0.55);
    sub.connect(subLevel).connect(compressor);
    play(sub, hit, hit + 0.6);

    // 2. chuông kim loại lệch tông (các họa âm không hòa hợp, hai nốt gần nhau tạo tiếng rung rền)
    const bell = gain(0);
    envelope(bell.gain, hit, 0.22 * strength, 0.004, 1.3);
    bell.connect(bus);
    for (const [ratio, amount] of [
      [1, 1],
      [1.012, 0.6],
      [1.47, 0.7],
      [2.09, 0.5],
      [2.56, 0.35],
      [3.39, 0.25],
    ]) {
      const partial = oscillator("sine", 196 * ratio);
      partial.frequency.setValueAtTime(196 * ratio, now + hit);
      partial.frequency.exponentialRampToValueAtTime(196 * ratio * 0.97, now + hit + 1.3);
      partial.connect(gain(amount)).connect(bell);
      play(partial, hit, hit + 1.35);
    }
  });

  // 3. tiếng gió hút lên ngay trước cú giật thứ hai và thứ ba
  for (const [from, to] of [
    [0.14, HITS[1]],
    [0.76, HITS[2]],
  ]) {
    const air = noise(to - from + 0.06);
    const sweep = filter("bandpass", 250, 1.4);
    sweep.frequency.setValueAtTime(250, now + from);
    sweep.frequency.exponentialRampToValueAtTime(2800, now + to);
    const level = gain(0);
    level.gain.setValueAtTime(0.0001, now + from);
    level.gain.exponentialRampToValueAtTime(0.5, now + to - 0.005);
    level.gain.exponentialRampToValueAtTime(0.0001, now + to + 0.04);
    air.connect(sweep).connect(level).connect(bus);
    play(air, from, to + 0.06);
  }

  // 4. nhịp tim thình thịch trong lúc mặt ma nhìn chằm chằm
  for (const [at, amount] of [
    [0.6, 0.55],
    [0.74, 0.4],
  ]) {
    const beat = oscillator("triangle", 62);
    beat.frequency.setValueAtTime(62, now + at);
    beat.frequency.exponentialRampToValueAtTime(44, now + at + 0.16);
    const level = gain(0);
    envelope(level.gain, at, amount, 0.008, 0.16);
    beat.connect(filter("lowpass", 600)).connect(level).connect(compressor);
    play(beat, at, at + 0.2);
  }

  // 5. khi tối sập: tiếng thở ra khò khè sát bên tai trái
  const breathStart = BLACKOUT + 0.04;
  const breathEnd = 2.25;
  const breath = noise(breathEnd - breathStart);
  const throat = filter("bandpass", 1500, 1.1);
  throat.frequency.setValueAtTime(1500, now + breathStart);
  throat.frequency.exponentialRampToValueAtTime(650, now + breathEnd);
  const breathLevel = gain(0);
  breathLevel.gain.setValueAtTime(0.0001, now + breathStart);
  breathLevel.gain.exponentialRampToValueAtTime(0.5, now + breathStart + 0.25);
  breathLevel.gain.exponentialRampToValueAtTime(0.28, now + breathStart + 0.55);
  breathLevel.gain.exponentialRampToValueAtTime(0.0001, now + breathEnd);
  // rung nhẹ cho nghe khàn
  const rasp = oscillator("sine", 19);
  const raspDepth = gain(0.12);
  rasp.connect(raspDepth).connect(breathLevel.gain);
  const nearEar = context.createStereoPanner();
  nearEar.pan.value = -0.6;
  breath.connect(filter("highpass", 300)).connect(throat).connect(breathLevel).connect(nearEar).connect(compressor);
  play(breath, breathStart, breathEnd);
  play(rasp, breathStart, breathEnd);

  // vài nốt hộp nhạc cao, lệch nhau nửa cung, vọng lại trong phòng trống
  for (const [at, frequency] of [
    [1.4, 1318.5],
    [1.62, 1396.9],
    [1.86, 1244.5],
  ]) {
    const note = gain(0);
    envelope(note.gain, at, 0.12, 0.003, 0.42);
    note.connect(bus);
    for (const [ratio, amount] of [
      [1, 1],
      [2.003, 0.3],
    ]) {
      const tone = oscillator("sine", frequency * ratio);
      tone.connect(gain(amount)).connect(note);
      play(tone, at, at + 0.45);
    }
  }

  return () => {
    // tắt êm trong 0,08 giây cho khỏi nghe tiếng "bụp"
    const t = context.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.08);
    for (const source of sources) {
      try {
        source.stop(t + 0.1);
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
    // phát âm thanh ngay khi mặt ma hiện ra (đợi một nhịp để chế độ dev của React không phát hai lần)
    const impact = window.setTimeout(() => {
      const context = getAudio();
      if (context) {
        try {
          stop = haunt(context);
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
