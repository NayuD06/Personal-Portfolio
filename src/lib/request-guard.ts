// Kiểm tra chung cho các API (/api/ask, /api/contact): đọc JSON an toàn, lọc ký tự lạ, chặn trang khác gọi ké.

/** IP người gửi (Vercel đặt sẵn header x-forwarded-for) */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Trình duyệt đang ở trang web khác mà gọi API này (chặn để không bị dùng ké) */
export function fromOtherSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return true;
  }
}

/** Đọc JSON gửi lên. Không phải JSON, không phải object hoặc lớn quá maxBytes thì trả null. */
export async function readJson(request: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return null;
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return null;
  let text: string;
  try {
    text = await request.text();
  } catch {
    return null;
  }
  if (new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Làm sạch chữ người dùng gửi: bỏ ký tự điều khiển, ký tự vô hình và ký tự đảo chiều chữ
 * (hay dùng để giấu lệnh, kể cả giấu lệnh cho AI). multiline: giữ xuống dòng và tab.
 */
export function cleanText(value: unknown, multiline = false) {
  if (typeof value !== "string") return "";
  const control = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]+/g;
  return value
    .replace(control, multiline ? "" : " ")
    .replace(/[​‌‎‏‪-‮⁠-⁤⁦-⁩﻿]/g, "")
    .replace(/[\u{E0000}-\u{E007F}]/gu, "")
    .normalize("NFC")
    .trim();
}
