import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Sổ lưu bút: lưu lời nhắn trong Upstash Redis (gói miễn phí, thêm từ tab Storage của Vercel, xem README).
// Gọi thẳng REST API của Upstash nên không cần cài thêm gói nào.
// Vercel tự thêm KV_REST_API_URL / KV_REST_API_TOKEN khi nối database; tạo database bên Upstash thì dùng tên UPSTASH_REDIS_REST_*.

import type { GuestbookEntry } from "./guestbook-shared";

export type { GuestbookEntry };

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY = "guestbook";
/** Giữ tối đa 500 lời nhắn mới nhất */
const KEEP = 500;

export const guestbookReady = Boolean(URL_ && TOKEN);

type Result = { result?: unknown; error?: string };

/** Gửi nhiều lệnh Redis trong một lần gọi */
async function redis(commands: (string | number)[][]): Promise<unknown[]> {
  const response = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const results = (await response.json()) as Result[];
  const failed = results.find((item) => item.error);
  if (failed) throw new Error(`Upstash: ${failed.error}`);
  return results.map((item) => item.result);
}

function parse(raw: unknown): GuestbookEntry | null {
  if (typeof raw !== "string") return null;
  try {
    const entry = JSON.parse(raw) as GuestbookEntry;
    return typeof entry.id === "string" && typeof entry.name === "string" && typeof entry.message === "string" && typeof entry.at === "number"
      ? entry
      : null;
  } catch {
    return null;
  }
}

export async function listEntries(limit = 60): Promise<GuestbookEntry[]> {
  const [raw] = await redis([["LRANGE", KEY, 0, limit - 1]]);
  return (Array.isArray(raw) ? raw : []).map(parse).filter((entry): entry is GuestbookEntry => entry !== null);
}

/** Băm địa chỉ IP / nội dung để đếm lượt và chặn tin trùng mà không lưu IP thật */
export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

/**
 * Đếm lượt gửi của một người (theo IP đã băm): tối đa 3 lời nhắn trong 10 phút và 10 lời nhắn một ngày.
 * Đếm trong Redis nên đúng cả khi Vercel chạy nhiều máy chủ cùng lúc.
 */
export async function tooManyPosts(ipHash: string) {
  const short = `${KEY}:rl:10m:${ipHash}`;
  const day = `${KEY}:rl:1d:${ipHash}`;
  // SET ... NX tạo bộ đếm kèm thời hạn nếu chưa có, INCR giữ nguyên thời hạn đó
  const [, shortCount, , dayCount] = await redis([
    ["SET", short, 0, "EX", 600, "NX"],
    ["INCR", short],
    ["SET", day, 0, "EX", 86400, "NX"],
    ["INCR", day],
  ]);
  return Number(shortCount) > 3 || Number(dayCount) > 10;
}

/** Chặn gửi lại đúng một nội dung trong vòng 1 giờ (bot hay spam lặp lại) */
export async function isDuplicate(message: string) {
  const [set] = await redis([["SET", `${KEY}:dup:${hash(message.toLowerCase())}`, "1", "EX", 3600, "NX"]]);
  return set !== "OK";
}

export async function addEntry(entry: GuestbookEntry) {
  await redis([
    ["LPUSH", KEY, JSON.stringify(entry)],
    ["LTRIM", KEY, 0, KEEP - 1],
  ]);
}

export async function removeEntry(id: string) {
  const [raw] = await redis([["LRANGE", KEY, 0, KEEP - 1]]);
  const match = (Array.isArray(raw) ? raw : []).find((item) => parse(item)?.id === id);
  if (typeof match !== "string") return false;
  await redis([["LREM", KEY, 1, match]]);
  return true;
}

/** Mã quản lý (GUESTBOOK_ADMIN_KEY) để xóa lời nhắn ngay trên trang */
export function isAdmin(key: string | null) {
  const expected = process.env.GUESTBOOK_ADMIN_KEY;
  if (!expected || !key || expected.length < 8) return false;
  const a = Buffer.from(hash(key));
  const b = Buffer.from(hash(expected));
  return timingSafeEqual(a, b);
}
