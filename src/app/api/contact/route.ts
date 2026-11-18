import { profile } from "@/data/profile";
import { renderContactEmail, type ContactFields } from "@/lib/contact-email";

// Nhận tin nhắn từ form liên hệ và gửi về email của bạn qua Resend (https://resend.com).
// Cần biến môi trường RESEND_API_KEY (xem .env.example). Chưa có thì trả 503,
// form sẽ tự chuyển sang mở ứng dụng email của người xem như trước.

type Fields = ContactFields;

const maxLength: Record<keyof Fields, number> = {
  name: 100,
  email: 200,
  phone: 40,
  company: 120,
  message: 5000,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const read = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");

  // Ô ẩn "website": người thật không thấy nên để trống, bot điền vào thì bỏ qua nhưng vẫn báo thành công
  if (read("website")) return Response.json({ ok: true });

  const fields: Fields = {
    name: read("name"),
    email: read("email"),
    phone: read("phone"),
    company: read("company"),
    message: read("message"),
  };
  const tooLong = (Object.keys(fields) as (keyof Fields)[]).some((key) => fields[key].length > maxLength[key]);
  if (!fields.name || !fields.message || !emailPattern.test(fields.email) || tooLong) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const lang = read("lang");
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
