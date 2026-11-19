import { randomUUID } from "node:crypto";
import { MAX_MESSAGE, MAX_NAME } from "@/lib/guestbook-shared";
import { addEntry, guestbookReady, hash, isAdmin, isDuplicate, listEntries, removeEntry, tooManyPosts, type GuestbookEntry } from "@/lib/guestbook";

// Sổ lưu bút: GET lấy các lời nhắn mới nhất, POST ghi lời nhắn mới, DELETE (cần mã quản lý) xóa một lời nhắn.
// Chưa nối Upstash Redis thì GET trả { ready: false } và khung sổ lưu bút báo "sắp mở".


/** Vài từ quá tục (tiếng Việt và tiếng Anh). Lời nhắn có từ này thì không nhận. */
const rude = /(^|[^\p{L}])(địt|đụ|lồn|cặc|buồi|đéo|đĩ|vcl|vkl|clmm|đmm|dmm|fuck\w*|shit\w*|bitch\w*|cunt\w*|dick|pussy|nigg\w*)(?=$|[^\p{L}])/iu;
/** Không nhận đường link (bot spam hay gửi link quảng cáo) */
const link = /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|info|xyz|top|ru|cn|io|co|vn|click|site|online|shop|link)\b)/i;

/** Bỏ ký tự điều khiển, gom khoảng trắng, tối đa 2 dòng trống liên tiếp */
function clean(value: unknown, multiline: boolean) {
  if (typeof value !== "string") return "";
  let text = value.normalize("NFC").replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  text = multiline ? text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : text.replace(/\s+/g, " ");
  return text.trim();
}

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers });
}

/** Chặn trang web khác gọi ké API này từ trình duyệt */
function fromOtherSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return true;
  }
}

export async function GET() {
  if (!guestbookReady) return json({ ready: false, entries: [] });
  try {
    const entries = await listEntries();
    // Vercel giữ bản sao 10 giây để đỡ tốn lượt gọi database; người vừa gửi thấy lời nhắn của mình ngay trên trang
    return json({ ready: true, entries }, 200, { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60" });
  } catch (error) {
    console.error("[guestbook] không đọc được Upstash", error);
    return json({ ready: true, entries: [], error: "failed" }, 500);
  }
}

export async function POST(request: Request) {
  if (!guestbookReady) return json({ error: "not_configured" }, 503);
  if (fromOtherSite(request)) return json({ error: "forbidden" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }

  const name = clean(body.name, false);
  const message = clean(body.message, true);
  const entry: GuestbookEntry = { id: randomUUID().replace(/-/g, "").slice(0, 16), name, message, at: Date.now() };

  // Bẫy bot: ô ẩn "website" bị điền, hoặc gửi chưa tới 3 giây sau khi mở trang.
  // Vẫn báo thành công để bot không biết, nhưng không lưu.
  const elapsed = Number(body.elapsed);
  if (body.website || !Number.isFinite(elapsed) || elapsed < 3000) return json({ entry }, 201);

  if ([...name].length < 1 || [...name].length > MAX_NAME || [...message].length < 2 || [...message].length > MAX_MESSAGE) {
    return json({ error: "invalid" }, 400);
  }
  if (link.test(name) || link.test(message)) return json({ error: "no_links" }, 400);
  if (rude.test(name) || rude.test(message)) return json({ error: "rude" }, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    if (await tooManyPosts(hash(`guestbook:${ip}`))) return json({ error: "rate_limited" }, 429);
    if (await isDuplicate(message)) return json({ error: "duplicate" }, 409);
    await addEntry(entry);
    return json({ entry }, 201);
  } catch (error) {
    console.error("[guestbook] không ghi được Upstash", error);
    return json({ error: "failed" }, 500);
  }
}

export async function DELETE(request: Request) {
  if (!guestbookReady) return json({ error: "not_configured" }, 503);
  if (!isAdmin(request.headers.get("x-admin-key"))) return json({ error: "forbidden" }, 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "invalid" }, 400);
  try {
    return (await removeEntry(id)) ? json({ ok: true }) : json({ error: "not_found" }, 404);
  } catch (error) {
    console.error("[guestbook] không xóa được", error);
    return json({ error: "failed" }, 500);
  }
}
