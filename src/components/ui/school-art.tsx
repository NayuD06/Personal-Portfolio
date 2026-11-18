"use client";

import { motion, useReducedMotion, type MotionValue, type Variants } from "motion/react";

// Hình minh họa cho mục Học vấn khi chưa có ảnh trường.
// Các nét tự vẽ ra khi cuộn tới (nhận trạng thái "hidden"/"show" từ thẻ cha).

const ease = [0.22, 1, 0.36, 1] as const;

/** Nét vẽ dần: delay và thời gian tính bằng giây. Người dùng bật "giảm chuyển động" thì hiện luôn. */
function useDraw() {
  const reduce = useReducedMotion();
  return (delay = 0, duration = 1.1): Variants =>
    reduce
      ? { hidden: { pathLength: 1, opacity: 1 }, show: { pathLength: 1, opacity: 1 } }
      : {
          hidden: { pathLength: 0, opacity: 0 },
          show: {
            pathLength: 1,
            opacity: 1,
            transition: { pathLength: { delay, duration, ease }, opacity: { delay, duration: 0.01 } },
          },
        };
}

const fadeIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { delay, type: "spring", stiffness: 260, damping: 20 } },
});

const line = {
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Backdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--bg-alt),var(--bg))]" />
      <div className="bg-grid absolute inset-0 [background-size:32px_32px]" />
      <div className="absolute -top-16 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand-blue/20 blur-3xl" />
    </>
  );
}

/** Tòa nhà trường và con đường có xe buýt chạy qua (hợp với trường Giao thông vận tải). */
export function CampusArt({ y }: { y?: MotionValue<number> }) {
  const draw = useDraw();
  const reduce = useReducedMotion();
  const columns = [170, 194, 218, 262, 286, 310];
  const windows = [74, 98, 122, 344, 368, 392].flatMap((x) => [186, 212].map((wy) => ({ x, y: wy })));

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Backdrop />
      <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {/* trăng và sao, trôi chậm hơn khi cuộn */}
        <motion.g style={{ y }}>
          <motion.circle variants={fadeIn(0.9)} cx="396" cy="70" r="24" className="fill-brand-sky/15 stroke-brand-sky" strokeWidth={2} />
          {[
            [70, 52],
            [118, 30],
            [300, 40],
            [446, 128],
            [36, 120],
          ].map(([cx, cy], i) => (
            <motion.circle key={cx} variants={fadeIn(1 + i * 0.08)} cx={cx} cy={cy} r="2" className="fill-brand-sky/70" />
          ))}
        </motion.g>

        {/* cây hai bên */}
        {[36, 444].map((cx, i) => (
          <g key={cx}>
            <motion.path variants={draw(0.5 + i * 0.1, 0.6)} d={`M${cx} 262 V236`} {...line} className="stroke-brand-sky" />
            <motion.circle variants={draw(0.6 + i * 0.1, 0.8)} cx={cx} cy="222" r="16" {...line} className="fill-brand-sky/10 stroke-brand-sky" />
          </g>
        ))}

        {/* hai dãy nhà bên */}
        <motion.rect variants={draw(0.2)} x="60" y="172" width="90" height="90" rx="3" {...line} className="fill-chip stroke-brand-blue" />
        <motion.rect variants={draw(0.3)} x="330" y="172" width="90" height="90" rx="3" {...line} className="fill-chip stroke-brand-blue" />
        {windows.map((w, i) => (
          <motion.rect
            key={`${w.x}-${w.y}`}
            variants={fadeIn(0.9 + i * 0.04)}
            x={w.x}
            y={w.y}
            width="14"
            height="12"
            rx="2"
            className={i % 3 === 1 ? "fill-brand-sky/80" : "fill-brand-blue/35"}
          />
        ))}

        {/* tòa nhà chính */}
        <motion.rect variants={draw(0)} x="150" y="140" width="180" height="110" {...line} className="fill-bg stroke-brand-blue" />
        <motion.path variants={draw(0.25)} d="M138 140 L240 92 L342 140 Z" {...line} className="fill-chip stroke-brand-blue" />
        <motion.path variants={draw(0.45, 0.7)} d="M146 152 H334" {...line} className="stroke-brand-blue/60" />
        <motion.circle variants={draw(0.6, 0.6)} cx="240" cy="122" r="8" {...line} className="stroke-brand-sky" />
        {columns.map((x, i) => (
          <motion.path key={x} variants={draw(0.5 + i * 0.07, 0.6)} d={`M${x} 160 V240`} {...line} strokeWidth={4} className="stroke-brand-blue/70" />
        ))}
        <motion.path variants={draw(0.75, 0.7)} d="M226 250 V214 a14 14 0 0 1 28 0 V250" {...line} className="fill-brand-sky/15 stroke-brand-sky" />
        <motion.path variants={draw(0.85, 0.6)} d="M140 250 H340 M130 258 H350" {...line} className="stroke-brand-blue/70" />

        {/* cột cờ */}
        <motion.path variants={draw(0.9, 0.4)} d="M240 92 V58" {...line} className="stroke-brand-blue" />
        <motion.path variants={fadeIn(1.2)} d="M241 58 h24 l-7 7 l7 7 h-24 Z" className="fill-brand-sky" />

        {/* mặt đất và con đường */}
        <motion.path variants={draw(0.1, 1.4)} d="M0 262 H480" {...line} className="stroke-brand-blue/50" />
        <rect x="0" y="286" width="480" height="56" className="fill-brand-blue/[0.07]" />
        <motion.path variants={draw(0.2, 1.4)} d="M0 286 H480 M0 342 H480" {...line} className="stroke-brand-blue/40" />
        <motion.path
          d="M0 314 H480"
          {...line}
          strokeDasharray="18 14"
          className="stroke-brand-sky/60"
          animate={reduce ? undefined : { strokeDashoffset: [0, -64] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />

        {/* xe buýt chạy ngang (ẩn khi người dùng bật giảm chuyển động) */}
        {!reduce && (
          <motion.g
            initial={{ x: -110 }}
            animate={{ x: 600 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 1.4 }}
          >
            <rect x="0" y="292" width="74" height="30" rx="7" className="fill-brand-blue" />
            <rect x="6" y="298" width="12" height="10" rx="2" className="fill-white/85" />
            <rect x="22" y="298" width="12" height="10" rx="2" className="fill-white/85" />
            <rect x="38" y="298" width="12" height="10" rx="2" className="fill-white/85" />
            <rect x="56" y="298" width="12" height="16" rx="2" className="fill-brand-sky" />
            <circle cx="16" cy="324" r="5" className="fill-bg stroke-brand-blue" strokeWidth={3} />
            <circle cx="58" cy="324" r="5" className="fill-bg stroke-brand-blue" strokeWidth={3} />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

/** Màn hình code, điện thoại và các đường mạch: học lập trình web và di động. */
export function CodeArt({ y }: { y?: MotionValue<number> }) {
  const draw = useDraw();
  const reduce = useReducedMotion();

  // từng đoạn code: [x, y, độ dài, màu]
  const code: [number, number, number, string][] = [
    [92, 104, 54, "fill-brand-blue"],
    [154, 104, 84, "fill-brand-sky/50"],
    [108, 122, 112, "fill-muted/40"],
    [108, 140, 62, "fill-brand-sky"],
    [178, 140, 66, "fill-brand-blue/50"],
    [124, 158, 124, "fill-muted/40"],
    [124, 176, 84, "fill-brand-blue"],
    [108, 194, 44, "fill-muted/40"],
    [92, 212, 30, "fill-brand-blue"],
  ];

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Backdrop />
      <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {/* đường mạch */}
        <motion.path variants={draw(0.6, 1)} d="M70 200 H40 V250 H0" {...line} className="stroke-brand-blue/50" />
        <motion.path variants={draw(0.7, 1)} d="M70 120 H28 V70" {...line} className="stroke-brand-sky/50" />
        <motion.path variants={draw(0.8, 1)} d="M370 92 H430 V30" {...line} className="stroke-brand-blue/50" />
        {[
          [40, 250],
          [28, 70],
          [430, 30],
        ].map(([cx, cy], i) => (
          <motion.circle key={cx} variants={fadeIn(1.4 + i * 0.1)} cx={cx} cy={cy} r="5" className="fill-bg stroke-brand-sky" strokeWidth={2} />
        ))}

        {/* bàn và chân màn hình */}
        <motion.path variants={draw(0, 1.2)} d="M20 290 H460" {...line} className="stroke-brand-blue/50" />
        <motion.path variants={draw(0.3, 0.6)} d="M204 246 L196 280 H244 L236 246" {...line} className="fill-chip stroke-brand-blue" />

        {/* màn hình */}
        <motion.rect variants={draw(0)} x="70" y="50" width="300" height="196" rx="14" {...line} className="fill-bg stroke-brand-blue" />
        <motion.path variants={draw(0.3, 0.8)} d="M70 80 H370" {...line} className="stroke-brand-blue/40" />
        {["fill-blue-800", "fill-brand-blue", "fill-brand-sky"].map((c, i) => (
          <motion.circle key={c} variants={fadeIn(0.5 + i * 0.08)} cx={88 + i * 14} cy="65" r="4" className={c} />
        ))}
        <motion.rect variants={fadeIn(0.7)} x="140" y="60" width="72" height="10" rx="5" className="fill-chip" />

        {/* các dòng code gõ dần */}
        {code.map(([x, cy, w, c], i) => (
          <motion.rect
            key={`${x}-${cy}`}
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: 1, transition: { delay: 0.6 + i * 0.12, duration: 0.45, ease } },
            }}
            style={{ originX: 0 }}
            x={x}
            y={cy}
            width={w}
            height="8"
            rx="4"
            className={c}
          />
        ))}
        <motion.rect
          x="130"
          y="207"
          width="8"
          height="13"
          rx="1.5"
          className="fill-brand-sky"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />

        {/* điện thoại nổi bên phải */}
        <motion.g style={{ y }}>
          <motion.g
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
          <motion.rect variants={draw(0.5)} x="334" y="128" width="80" height="146" rx="16" {...line} className="fill-bg stroke-brand-sky" />
          <motion.path variants={draw(0.9, 0.4)} d="M362 141 H386" {...line} className="stroke-brand-sky/60" />
          <motion.rect variants={fadeIn(1.1)} x="344" y="154" width="60" height="38" rx="8" className="fill-brand-blue/30" />
          <motion.rect variants={fadeIn(1.2)} x="344" y="202" width="44" height="7" rx="3.5" className="fill-muted/40" />
          <motion.rect variants={fadeIn(1.25)} x="344" y="216" width="56" height="7" rx="3.5" className="fill-muted/40" />
          <motion.rect variants={fadeIn(1.3)} x="344" y="236" width="60" height="18" rx="9" className="fill-brand-blue" />
          </motion.g>
        </motion.g>

        {/* huy hiệu </> */}
        <motion.g variants={fadeIn(1.5)}>
          <rect x="18" y="20" width="58" height="34" rx="10" className="fill-brand-blue" />
          <text x="47" y="43" textAnchor="middle" className="fill-white font-mono text-[15px] font-bold">
            {"</>"}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
