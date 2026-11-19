import { askSystemPrompt } from "@/lib/ask-knowledge";

// Trợ lý AI hỏi đáp về bạn, dùng Google Gemini API gói miễn phí (https://aistudio.google.com).
// Cần biến môi trường GEMINI_API_KEY (xem README, mục "Trợ lý AI"). Chưa có thì trả 503,
// khung chat sẽ báo trợ lý chưa bật và gợi ý gửi email.
// Câu trả lời được gửi dần từng đoạn (mỗi dòng là một JSON) để chữ hiện ra ngay khi Gemini đang viết.

export const maxDuration = 60;

/**
 * Model Flash-Lite: nhanh, tiếng Việt tốt, gói miễn phí cho khoảng 500 câu hỏi một ngày mỗi model.
 * Model đầu hết lượt (hoặc bị Google gỡ) thì tự chuyển sang model sau, nên tổng cộng khoảng 1.000 câu một ngày.
 * Muốn đổi model chính thì đặt GEMINI_MODEL.
 */
const MODELS = [...new Set([process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"])];
const API_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";

const MAX_QUESTION = 500;
const MAX_ANSWER = 4000;
/** Chỉ gửi kèm vài lượt gần nhất để hiểu câu hỏi tiếp nối, không gửi cả cuộc trò chuyện dài */
const MAX_MESSAGES = 9;

// Giới hạn mỗi IP 12 câu hỏi trong 10 phút và 60 câu một ngày (đếm trong bộ nhớ của server),
// để một người không dùng hết lượt miễn phí của cả ngày.
const limits = [
  { windowMs: 10 * 60 * 1000, max: 12 },
  { windowMs: 24 * 60 * 60 * 1000, max: 60 },
];
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < limits[1].windowMs);
  const blocked = limits.some(({ windowMs, max }) => recent.filter((time) => now - time < windowMs).length >= max);
  if (!blocked) recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return blocked;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

/** Kiểm tra dữ liệu gửi lên: xen kẽ người hỏi / trợ lý, kết thúc bằng câu hỏi mới, không quá dài */
function readMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 40) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text || text.length > (role === "user" ? MAX_QUESTION : MAX_ANSWER)) return null;
    messages.push({ role, content: text });
  }
  const recent = messages.slice(-MAX_MESSAGES);
  while (recent.length && recent[0].role !== "user") recent.shift();
  const alternates = recent.every((message, index) => message.role === (index % 2 === 0 ? "user" : "assistant"));
  if (!recent.length || !alternates || recent[recent.length - 1].role !== "user") return null;
  return recent;
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

// ---------- Gemini API ----------

type Part = { text?: string; thought?: boolean };
type Chunk = {
  candidates?: { content?: { parts?: Part[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; cachedContentTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  modelVersion?: string;
};

/** Các lý do Gemini dừng vì bộ lọc an toàn: báo "không trả lời được câu này" */
const blocked = new Set(["SAFETY", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "RECITATION", "LANGUAGE"]);

/** Lỗi 429 của Google ghi rõ loại hạn mức bị vượt: theo ngày (hết lượt miễn phí hôm nay) hay theo phút (đợi một chút) */
async function quotaKind(response: Response): Promise<"day" | "minute"> {
  try {
    const { error } = (await response.json()) as { error?: { message?: string; details?: { violations?: { quotaId?: string }[] }[] } };
    const ids = (error?.details ?? []).flatMap((detail) => detail.violations ?? []).map((violation) => violation.quotaId ?? "");
    return ids.some((id) => /per_?day/i.test(id)) || /per_?day/i.test(error?.message ?? "") ? "day" : "minute";
  } catch {
    return "minute";
  }
}

/** Gửi câu hỏi, thử lần lượt từng model. Trả về kết nối đang chạy, hoặc mã lỗi để báo cho người xem. */
async function startStream(body: string, signal: AbortSignal) {
  const seen = { minute: false, day: false, server: false };
  for (const model of MODELS) {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
        body,
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      console.error(`[ask] không gọi được Gemini (${model})`, error);
      continue;
    }
    if (response.ok && response.body) return { model, response };

    if (response.status === 429) {
      const kind = await quotaKind(response);
      seen[kind] = true;
      console.warn(`[ask] ${model} hết lượt ${kind === "day" ? "hôm nay" : "trong phút này"}, thử model khác`);
    } else {
      // 404: model đã bị Google gỡ, 500/503: Google đang quá tải
      if (response.status >= 500) seen.server = true;
      console.error(`[ask] Gemini lỗi ${response.status} (${model}):`, (await response.text().catch(() => "")).slice(0, 500));
    }
  }
  // còn model chỉ bận theo phút thì báo "bận, thử lại sau ít phút"; mọi model hết lượt theo ngày thì báo "hết lượt hôm nay"
  const code = seen.minute ? "busy" : seen.day ? "quota" : seen.server ? "busy" : "failed";
  return { code };
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "not_configured" }, { status: 503 });
  if (fromOtherSite(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const messages = readMessages(body.messages);
  if (!messages) return Response.json({ error: "invalid" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  // Ngôn ngữ đang chọn trên trang, chỉ dùng khi không rõ người hỏi viết tiếng gì.
  // Đặt trong câu hỏi mới nhất (không đặt trong system prompt) để phần system luôn giống nhau: Gemini tự cache phần lặp lại.
  const pageLanguage = body.lang === "vi" ? "Vietnamese" : "English";
  const last = messages[messages.length - 1];
  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: askSystemPrompt }] },
    contents: [
      ...messages.slice(0, -1).map((message) => ({ role: message.role === "user" ? "user" : "model", parts: [{ text: message.content }] })),
      { role: "user", parts: [{ text: `<page_language>${pageLanguage}</page_language>` }, { text: last.content }] },
    ],
    // Flash-Lite mặc định suy nghĩ rất ít nên trả lời nhanh, không cần chỉnh thêm
    generationConfig: { maxOutputTokens: 2048 },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: Record<string, string>) => controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
      try {
        const started = await startStream(payload, request.signal);
        if (!started.response) {
          send({ t: "error", code: started.code });
          return;
        }

        const reader = started.response.body!.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        let finish = "";
        let refused = false;
        let usage: Chunk["usageMetadata"];
        let version = started.model;
        const read = (line: string) => {
          if (!line.startsWith("data:")) return;
          let chunk: Chunk;
          try {
            chunk = JSON.parse(line.slice(5));
          } catch {
            return;
          }
          if (chunk.promptFeedback?.blockReason) refused = true;
          const candidate = chunk.candidates?.[0];
          for (const part of candidate?.content?.parts ?? []) {
            if (part.text && !part.thought) send({ t: "d", v: part.text });
          }
          if (candidate?.finishReason) finish = candidate.finishReason;
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
          if (chunk.modelVersion) version = chunk.modelVersion;
        };
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          lines.forEach(read);
        }
        read(buffer);

        if (refused || blocked.has(finish)) send({ t: "refusal" });
        else if (finish === "MAX_TOKENS") send({ t: "cut" });
        console.info(
          `[ask] ${version} in=${usage?.promptTokenCount ?? 0} cached=${usage?.cachedContentTokenCount ?? 0} out=${usage?.candidatesTokenCount ?? 0} thinking=${usage?.thoughtsTokenCount ?? 0}`,
        );
        send({ t: "end" });
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("[ask] Gemini API lỗi", error);
          send({ t: "error", code: "failed" });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // người xem đã đóng kết nối
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
