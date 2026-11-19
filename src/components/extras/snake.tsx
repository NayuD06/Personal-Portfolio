"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent } from "react";
import { LuArrowDown, LuArrowLeft, LuArrowRight, LuArrowUp, LuPause, LuPlay, LuX } from "react-icons/lu";
import { foundSecret } from "@/lib/extras";
import { pick, T, type Lang, type Text } from "@/lib/i18n";

// Easter egg: gõ `snake` trong Terminal để chơi rắn săn mồi ngay trong cửa sổ dòng lệnh.
// Phím mũi tên hoặc W A S D để đi, Space để tạm dừng, Esc để thoát. Điện thoại: vuốt trên bàn chơi hoặc bấm các nút mũi tên.
// Rắn đi xuyên tường (như Snake II trên Nokia), chỉ thua khi tự cắn vào mình. Ăn càng nhiều càng nhanh.

const COLS = 21;
const ROWS = 15;
const START_SPEED = 150; // mili giây cho mỗi bước
const MIN_SPEED = 70;
const BEST_KEY = "snake-best";
/** Mở ván mới thì ván cũ (nếu còn) tự kết thúc, để mỗi lúc chỉ có một ván */
const START_EVENT = "snake-start";

type Point = { x: number; y: number };
type Status = "ready" | "playing" | "paused" | "over" | "exited";

const directions: Record<string, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyToDirection: Record<string, keyof typeof directions> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
};

const text = {
  title: { en: "Snake", vi: "Rắn săn mồi" },
  score: { en: "score", vi: "điểm" },
  best: { en: "best", vi: "kỷ lục" },
  start: { en: "Press an arrow key or W A S D to start", vi: "Nhấn phím mũi tên hoặc W A S D để bắt đầu" },
  startTouch: { en: "Swipe or tap an arrow to start", vi: "Vuốt hoặc bấm mũi tên để bắt đầu" },
  paused: { en: "Paused. Press Space to continue", vi: "Tạm dừng. Nhấn Space để chơi tiếp" },
  pausedFocus: { en: "Paused. Click here to continue", vi: "Tạm dừng. Bấm vào đây để chơi tiếp" },
  over: { en: "Game over! Enter to play again, Esc to exit", vi: "Thua rồi! Enter để chơi lại, Esc để thoát" },
  overTouch: { en: "Game over! Tap to play again", vi: "Thua rồi! Chạm để chơi lại" },
  keys: { en: "←↑↓→ / WASD move · Space pause · Esc exit", vi: "←↑↓→ / WASD để đi · Space tạm dừng · Esc thoát" },
  label: {
    en: "Snake game. Use the arrow keys or W A S D to move, Space to pause, Escape to exit.",
    vi: "Trò chơi rắn săn mồi. Dùng phím mũi tên hoặc W A S D để di chuyển, Space để tạm dừng, Escape để thoát.",
  },
  pause: { en: "Pause", vi: "Tạm dừng" },
  resume: { en: "Resume", vi: "Chơi tiếp" },
  exit: { en: "Exit game", vi: "Thoát game" },
  up: { en: "Up", vi: "Lên" },
  down: { en: "Down", vi: "Xuống" },
  left: { en: "Left", vi: "Trái" },
  right: { en: "Right", vi: "Phải" },
  started: { en: "Game started.", vi: "Bắt đầu." },
  ate: { en: "Score {n}.", vi: "Được {n} điểm." },
  overSay: {
    en: "Game over. Final score {n}. Press Enter to play again or Escape to exit.",
    vi: "Thua rồi. Tổng điểm {n}. Nhấn Enter để chơi lại hoặc Escape để thoát.",
  },
  pausedSay: { en: "Paused.", vi: "Đã tạm dừng." },
  resumedSay: { en: "Resumed.", vi: "Chơi tiếp." },
  record: { en: "New best!", vi: "Kỷ lục mới!" },
  summary: { en: "Snake: you scored {n} (best {b}). Type snake to play again.", vi: "Rắn săn mồi: bạn được {n} điểm (kỷ lục {b}). Gõ snake để chơi lại." },
} satisfies Record<string, Text>;

/** bấm nút bằng chuột / ngón tay thì focus vẫn ở bàn chơi (không tự tạm dừng, phím mũi tên vẫn chạy) */
const keepBoardFocus = (event: { preventDefault: () => void }) => event.preventDefault();

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // trình duyệt chặn lưu trữ: vẫn chơi được, chỉ không nhớ kỷ lục
  }
}

function freshSnake(): Point[] {
  const y = Math.floor(ROWS / 2);
  return [
    { x: 6, y },
    { x: 5, y },
    { x: 4, y },
  ];
}

function randomFood(snake: Point[]): Point {
  const taken = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

export function SnakeGame({ lang, onExit }: { lang: Lang; onExit: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  // component này chỉ chạy trên trình duyệt (Terminal tải với ssr: false) nên đọc được localStorage ngay
  const [best, setBest] = useState(readBest);
  const [say, setSay] = useState("");
  const [cell, setCell] = useState(16);
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [focused, setFocused] = useState(true);
  const awarded = useRef(false);
  const id = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const game = useRef({
    snake: freshSnake(),
    dir: directions.right,
    queue: [] as Point[],
    food: { x: 14, y: Math.floor(ROWS / 2) },
    score: 0,
    speed: START_SPEED,
    status: "ready" as Status,
  });

  const announce = useCallback((message: Text, n?: number) => {
    // thêm khoảng trắng đổi qua lại để trình đọc màn hình đọc cả khi câu giống lần trước
    setSay((previous) => pick(message, lang).replace("{n}", String(n ?? 0)) + (previous.endsWith(" ") ? "" : " "));
  }, [lang]);

  const setGameStatus = useCallback((next: Status) => {
    game.current.status = next;
    setStatus(next);
  }, []);

  // vẽ bàn chơi lên canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = COLS * cell;
    const height = ROWS * cell;
    if (canvas.width !== width * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = "#040814";
    context.fillRect(0, 0, width, height);
    // chấm lưới mờ
    context.fillStyle = "rgba(96, 165, 250, 0.12)";
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) context.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);

    const { snake, food, dir } = game.current;
    // mồi: viên kim cương xanh trời phát sáng
    context.save();
    context.shadowColor = "#38bdf8";
    context.shadowBlur = cell * 0.8;
    context.fillStyle = "#7dd3fc";
    const fx = food.x * cell + cell / 2;
    const fy = food.y * cell + cell / 2;
    const r = cell * 0.36;
    context.beginPath();
    context.moveTo(fx, fy - r);
    context.lineTo(fx + r, fy);
    context.lineTo(fx, fy + r);
    context.lineTo(fx - r, fy);
    context.closePath();
    context.fill();
    context.restore();

    // thân rắn: đầu sáng nhất, nhạt dần về đuôi
    const head = [224, 242, 254];
    const tail = [29, 78, 216];
    snake.forEach((part, index) => {
      const t = snake.length > 1 ? index / (snake.length - 1) : 0;
      const color = index === 0 ? head : [96, 165, 250].map((c, i) => Math.round(c + (tail[i] - c) * t));
      context.fillStyle = `rgb(${color.join(",")})`;
      const inset = index === 0 ? 1 : 2;
      context.fillRect(part.x * cell + inset, part.y * cell + inset, cell - inset * 2, cell - inset * 2);
    });
    // mắt
    const h = snake[0];
    context.fillStyle = "#040814";
    const eye = Math.max(2, Math.round(cell / 7));
    const cx = h.x * cell + cell / 2;
    const cy = h.y * cell + cell / 2;
    const ox = dir.y !== 0 ? cell / 4.5 : 0;
    const oy = dir.x !== 0 ? cell / 4.5 : 0;
    const fwdX = dir.x * cell * 0.15;
    const fwdY = dir.y * cell * 0.15;
    context.fillRect(cx - ox + fwdX - eye / 2, cy - oy + fwdY - eye / 2, eye, eye);
    context.fillRect(cx + ox + fwdX - eye / 2, cy + oy + fwdY - eye / 2, eye, eye);
  }, [cell]);

  const finish = useCallback(() => {
    if (!awarded.current) {
      awarded.current = true;
      foundSecret("snake");
    }
  }, []);

  const exit = useCallback(() => {
    if (game.current.status === "exited") return;
    setGameStatus("exited");
    finish();
    onExit();
  }, [finish, onExit, setGameStatus]);

  const restart = useCallback(() => {
    const snake = freshSnake();
    game.current = { ...game.current, snake, dir: directions.right, queue: [], food: randomFood(snake), score: 0, speed: START_SPEED };
    setScore(0);
    setGameStatus("ready");
    draw();
  }, [draw, setGameStatus]);

  /** đổi hướng (bỏ qua nếu quay đầu 180 độ); đang chờ thì bắt đầu chơi luôn */
  const steer = useCallback(
    (name: keyof typeof directions) => {
      const g = game.current;
      if (g.status === "exited" || g.status === "over") return;
      const wanted = directions[name];
      const last = g.queue[g.queue.length - 1] ?? g.dir;
      if (wanted.x === -last.x && wanted.y === -last.y) {
        // chưa chạy mà bấm hướng ngược lại: quay đầu rắn rồi đi hướng đó luôn
        if (g.status !== "ready") return;
        g.snake = [...g.snake].reverse();
        g.dir = wanted;
      }
      if (wanted.x === last.x && wanted.y === last.y && g.status === "playing") return;
      if (g.queue.length < 2) g.queue.push(wanted);
      if (g.status === "ready" || g.status === "paused") {
        if (g.status === "ready") announce(text.started);
        else announce(text.resumedSay);
        setGameStatus("playing");
      }
    },
    [announce, setGameStatus],
  );

  const togglePause = useCallback(() => {
    const g = game.current;
    if (g.status === "playing") {
      setGameStatus("paused");
      announce(text.pausedSay);
    } else if (g.status === "paused") {
      setGameStatus("playing");
      announce(text.resumedSay);
    }
  }, [announce, setGameStatus]);

  // lúc mở: lấy kỷ lục, đặt mồi, focus vào bàn chơi, báo các ván cũ dừng lại
  useEffect(() => {
    id.current = Date.now() + Math.random();
    window.dispatchEvent(new CustomEvent(START_EVENT, { detail: id.current }));
    const onOther = (event: Event) => {
      if ((event as CustomEvent<number>).detail !== id.current && game.current.status !== "exited") {
        game.current.status = "exited";
        setStatus("exited");
      }
    };
    window.addEventListener(START_EVENT, onOther);
    game.current.food = randomFood(game.current.snake);
    boxRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener(START_EVENT, onOther);
  }, []);

  // ô vừa với bề ngang terminal (trên điện thoại nhỏ lại)
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      const width = box.parentElement?.clientWidth ?? box.clientWidth;
      setCell(Math.max(11, Math.min(22, Math.floor((width - 4) / COLS))));
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (box.parentElement) observer.observe(box.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(draw, [draw]);

  // vòng lặp game
  useEffect(() => {
    if (status !== "playing") return;
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    const step = () => {
      const g = game.current;
      if (g.queue.length) g.dir = g.queue.shift()!;
      const head = g.snake[0];
      const next = { x: (head.x + g.dir.x + COLS) % COLS, y: (head.y + g.dir.y + ROWS) % ROWS };
      const eating = next.x === g.food.x && next.y === g.food.y;
      const body = eating ? g.snake : g.snake.slice(0, -1);
      if (body.some((p) => p.x === next.x && p.y === next.y)) {
        // tự cắn vào mình: thua
        setGameStatus("over");
        const record = g.score > readBest();
        if (record) {
          saveBest(g.score);
          setBest(g.score);
        }
        announce(text.overSay, g.score);
        finish();
        return false;
      }
      g.snake = [next, ...body];
      if (eating) {
        g.score += 1;
        g.speed = Math.max(MIN_SPEED, START_SPEED - g.score * 4);
        g.food = randomFood(g.snake);
        setScore(g.score);
        announce(text.ate, g.score);
      }
      return true;
    };
    const loop = (now: number) => {
      acc += now - last;
      last = now;
      while (acc >= game.current.speed) {
        acc -= game.current.speed;
        if (!step()) {
          draw();
          return;
        }
      }
      draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    // chuyển tab khác thì tự tạm dừng
    const onHidden = () => {
      if (document.hidden && game.current.status === "playing") {
        setGameStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [status, draw, announce, finish, setGameStatus]);

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    // bộ gõ tiếng Việt có lúc che phím thật: đọc vị trí phím (KeyW, ArrowUp...)
    const code = event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : event.code.toLowerCase();
    const direction = keyToDirection[key] ?? keyToDirection[code];
    const g = game.current;
    if (direction) {
      event.preventDefault();
      steer(direction);
    } else if (key === " " || key === "p") {
      event.preventDefault();
      if (g.status === "over") restart();
      else togglePause();
    } else if (key === "enter") {
      event.preventDefault();
      if (g.status === "over") restart();
      else if (g.status === "paused") togglePause();
    } else if (key === "escape" || key === "q") {
      event.preventDefault();
      event.stopPropagation();
      exit();
    }
  }

  function onTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    const point = event.touches[0];
    swipe.current = point ? { x: point.clientX, y: point.clientY } : null;
  }

  function onTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const start = swipe.current;
    const point = event.changedTouches[0];
    swipe.current = null;
    if (!start || !point) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
      // chạm nhẹ: thua rồi thì chơi lại, đang dừng thì chơi tiếp
      if (game.current.status === "over") restart();
      else if (game.current.status === "paused") togglePause();
      return;
    }
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  }

  if (status === "exited") {
    return (
      <p className="text-[#7d8db0]">
        <span aria-hidden="true">🐍 </span>
        {pick(text.summary, lang).replace("{n}", String(score)).replace("{b}", String(Math.max(best, score)))}
      </p>
    );
  }

  const overlay: Text | null =
    status === "ready" ? (touch ? text.startTouch : text.start) : status === "paused" ? (focused || touch ? text.paused : text.pausedFocus) : status === "over" ? (touch ? text.overTouch : text.over) : null;

  return (
    <div className="space-y-2" data-keep-focus>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1" style={{ maxWidth: COLS * cell + 4 }}>
        <span className="font-bold text-white">
          <span aria-hidden="true">🐍 </span>
          <T v={text.title} />
        </span>
        <span className="text-[#7d8db0]">
          <T v={text.score} /> <span className="text-[#38bdf8] tabular-nums">{score}</span>
        </span>
        <span className="text-[#7d8db0]">
          <T v={text.best} /> <span className="text-[#93c5fd] tabular-nums">{Math.max(best, score)}</span>
        </span>
        {status === "over" && score > 0 && score >= best && (
          <span className="font-bold text-amber-400">
            <T v={text.record} />
          </span>
        )}
      </div>

      {/* bàn chơi: role="application" để trình đọc màn hình chuyển phím mũi tên cho game */}
      <div
        ref={boxRef}
        role="application"
        aria-roledescription={pick({ en: "game", vi: "trò chơi" }, lang)}
        aria-label={pick(text.label, lang)}
        tabIndex={0}
        data-no-gestures
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // bấm ra ngoài (vd. vào ô lệnh) thì tạm dừng
          if (game.current.status === "playing") {
            setGameStatus("paused");
            announce(text.pausedSay);
          }
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => boxRef.current?.focus({ preventScroll: true })}
        className="snake-board relative w-max touch-none rounded-lg border border-[#1e3a8a] p-[1px] shadow-[0_0_30px_-10px_rgb(56_189_248/0.5)]"
      >
        <canvas ref={canvasRef} aria-hidden="true" className="block rounded-md" style={{ width: COLS * cell, height: ROWS * cell }} />
        {overlay && (
          <p aria-hidden="true" className="absolute inset-0 grid place-items-center rounded-md bg-[#040814]/70 px-4 text-center text-[13px] leading-snug font-bold text-white">
            <T v={overlay} />
          </p>
        )}
      </div>

      {/* thông báo cho trình đọc màn hình: bắt đầu, ăn mồi, tạm dừng, thua */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {say}
      </p>

      <div className="flex flex-wrap items-center gap-2" style={{ maxWidth: COLS * cell + 4 }}>
        {touch && (
          <div role="group" aria-label={pick(text.title, lang)} className="mr-auto flex gap-1.5">
            {(["left", "up", "down", "right"] as const).map((name) => {
              const Icon = { left: LuArrowLeft, up: LuArrowUp, down: LuArrowDown, right: LuArrowRight }[name];
              return (
                <button
                  key={name}
                  type="button"
                  onMouseDown={keepBoardFocus}
                  onClick={() => steer(name)}
                  aria-label={pick(text[name], lang)}
                  className="grid size-11 place-items-center rounded-lg border border-[#1e3a8a] bg-[#0a1428] text-[#93c5fd] active:border-[#38bdf8] active:text-white"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
        {!touch && (
          <span className="mr-auto text-xs text-[#7d8db0]">
            <T v={text.keys} />
          </span>
        )}
        {(status === "playing" || status === "paused") && (
          <button
            type="button"
            onMouseDown={keepBoardFocus}
            onClick={() => {
              togglePause();
              if (game.current.status === "playing") boxRef.current?.focus({ preventScroll: true });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1e3a8a] bg-[#0a1428] px-2.5 py-1 text-xs text-[#93c5fd] transition-colors hover:border-[#38bdf8] hover:text-white"
          >
            {status === "playing" ? <LuPause className="size-3.5" aria-hidden="true" /> : <LuPlay className="size-3.5" aria-hidden="true" />}
            <T v={status === "playing" ? text.pause : text.resume} />
          </button>
        )}
        <button
          type="button"
          onMouseDown={keepBoardFocus}
          onClick={exit}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#1e3a8a] bg-[#0a1428] px-2.5 py-1 text-xs text-[#93c5fd] transition-colors hover:border-[#38bdf8] hover:text-white"
        >
          <LuX className="size-3.5" aria-hidden="true" />
          <T v={text.exit} />
        </button>
      </div>
    </div>
  );
}
