import { profile } from "@/data/profile";
import { renderContactEmail, type ContactFields } from "@/lib/contact-email";
import { cleanText, clientIp, fromOtherSite, readJson } from "@/lib/request-guard";
import { verifyTurnstile } from "@/lib/turnstile";

// Nhận tin nhắn từ form liên hệ và gửi về email của bạn qua Resend (https://resend.com).
// Cần biến môi trường RESEND_API_KEY (xem .env.example). Chưa có thì trả 503,
// form sẽ tự chuyển sang mở ứng dụng email của người xem như trước.
// Chống spam: ô ẩn bẫy bot, giới hạn số tin mỗi IP và Cloudflare Turnstile (khi đã đặt key, xem src/lib/turnstile.ts).

type Fields = ContactFields;

const maxLength: Record<keyof Fields, number> = {
  name: 100,
  email: 200,
  phone: 40,
  company: 120,
  message: 5000,
};

// Chỉ nhận email dạng thường (chữ, số, . _ % + -), để không chèn được "?cc=..." vào link trả lời trong email
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
/** Dữ liệu gửi lên lớn hơn mức này là bất thường, bỏ qua không đọc */
const MAX_BODY = 16 * 1024;

// Giới hạn mỗi địa chỉ IP 5 tin trong 10 phút (đếm trong bộ nhớ, đủ để chặn spam đơn giản)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 1000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "not_configured" }, { status: 503 });
  if (fromOtherSite(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const body = await readJson(request, MAX_BODY);
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  // Ô ẩn "website": người thật không thấy nên để trống, bot điền vào thì bỏ qua nhưng vẫn báo thành công
  if (cleanText(body.website)) return Response.json({ ok: true });

  const fields: Fields = {
    name: cleanText(body.name).replace(/\s+/g, " "),
    email: cleanText(body.email),
    phone: cleanText(body.phone),
    company: cleanText(body.company).replace(/\s+/g, " "),
    message: cleanText(body.message, true),
  };
  const tooLong = (Object.keys(fields) as (keyof Fields)[]).some((key) => fields[key].length > maxLength[key]);
  if (!fields.name || !fields.message || !emailPattern.test(fields.email) || tooLong) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const ip = clientIp(request);
  if ((await verifyTurnstile(body.turnstileToken, ip)) === "fail") return Response.json({ error: "verify" }, { status: 403 });
  if (tooMany(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const lang = body.lang === "vi" ? "vi" : "en";
  const { subject, html, text } = renderContactEmail(fields, { lang });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Chưa xác minh tên miền trên Resend thì chỉ gửi được bằng địa chỉ onboarding@resend.dev
      // và chỉ tới email của tài khoản Resend, nên đăng ký Resend bằng chính email nhận tin.
      from: process.env.CONTACT_FROM_EMAIL || `${profile.name} Portfolio <onboarding@resend.dev>`,
      to: [process.env.CONTACT_TO_EMAIL || profile.email],
      reply_to: fields.email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend trả lỗi", response.status, await response.text().catch(() => ""));
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
