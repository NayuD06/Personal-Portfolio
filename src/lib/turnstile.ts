import { createHmac, timingSafeEqual } from "node:crypto";

// Cloudflare Turnstile (chống bot, miễn phí): kiểm tra mã "người thật" mà trình duyệt gửi kèm.
// Cần TURNSTILE_SECRET_KEY trên server và NEXT_PUBLIC_TURNSTILE_SITE_KEY cho trình duyệt (xem README, mục "Chống bot").
// Thiếu một trong hai key thì bỏ qua bước này, form và trợ lý AI vẫn chạy như cũ.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/**
 * "pass": mã hợp lệ. "fail": thiếu mã hoặc mã sai, từ chối.
 * "skip": chưa bật Turnstile, hoặc không gọi được Cloudflare (cho qua để khách không bị kẹt, nhưng không cấp cookie).
 */
export async function verifyTurnstile(token: unknown, ip: string): Promise<"pass" | "fail" | "skip"> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !turnstileEnabled()) return "skip";
  if (typeof token !== "string" || !token || token.length > 2048) return "fail";
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) console.warn("[turnstile] mã không hợp lệ", result["error-codes"]);
    return result.success === true ? "pass" : "fail";
  } catch (error) {
    console.error("[turnstile] không gọi được Cloudflare, tạm cho qua", error);
    return "skip";
  }
}

// Trợ lý AI: xác minh một lần rồi cấp cookie ký bằng khóa bí mật, dùng được 2 giờ, để các câu hỏi sau không phải chờ xác minh lại.
const COOKIE = "human";
const TTL_SECONDS = 2 * 60 * 60;

const sign = (value: string) => createHmac("sha256", process.env.TURNSTILE_SECRET_KEY ?? "").update(`human:${value}`).digest("base64url");

export function humanCookie() {
  const expires = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  return `${COOKIE}=${expires}.${sign(expires)}; Path=/api; Max-Age=${TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function hasHumanCookie(request: Request) {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [expires, signature] = raw.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
