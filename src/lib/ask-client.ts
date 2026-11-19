import type { Lang } from "./i18n";
import { getTurnstileToken, turnstileOn } from "./turnstile-client";

// Gọi /api/ask từ trình duyệt và nhận câu trả lời từng đoạn. Dùng chung cho khung chat và lệnh "ask" trong terminal.

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Kết quả một lần hỏi: ok, hoặc lý do không trả lời được */
export type AskOutcome = "ok" | "cut" | "refusal" | "not_configured" | "rate_limited" | "busy" | "quota" | "verify" | "error" | "aborted";

export const MAX_QUESTION = 500;
/** Server chỉ đọc 9 lượt gần nhất nên chỉ gửi chừng đó */
const MAX_MESSAGES = 9;

// Đã xác minh người thật (Turnstile) thì server cấp cookie dùng 2 giờ; ghi nhớ hạn ở đây để không xác minh lại mỗi câu hỏi.
// Cookie thật là HttpOnly (JavaScript không đọc được), nên đây chỉ là đoán: server từ chối thì xác minh lại.
const VERIFIED_KEY = "ask-verified-until";
const VERIFIED_MS = 110 * 60 * 1000;

function seemsVerified() {
  try {
    return Number(localStorage.getItem(VERIFIED_KEY)) > Date.now();
  } catch {
    return false;
  }
}

function rememberVerified(on: boolean) {
  try {
    if (on) localStorage.setItem(VERIFIED_KEY, String(Date.now() + VERIFIED_MS));
    else localStorage.removeItem(VERIFIED_KEY);
  } catch {
    // trình duyệt chặn lưu trữ: lần sau xác minh lại
  }
}

const send = (messages: ChatMessage[], lang: Lang, signal?: AbortSignal, turnstileToken?: string) =>
  fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, lang, turnstileToken }),
    signal,
  });

const needsVerify = async (response: Response) =>
  response.status === 403 && ((await response.clone().json().catch(() => null)) as { error?: string } | null)?.error === "verify";

export async function askAssistant(
  messages: ChatMessage[],
  lang: Lang,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<AskOutcome> {
  const recent = messages.slice(-MAX_MESSAGES);
  let response: Response;
  try {
    const tried = turnstileOn && !seemsVerified();
    let token = tried ? await getTurnstileToken("ask") : undefined;
    if (signal?.aborted) return "aborted";
    response = await send(recent, lang, signal, token);
    // cookie hết hạn hoặc mã cũ không dùng được: lấy mã mới, thử lại một lần
    // (không lấy được mã từ đầu, vd. trình chặn quảng cáo chặn Cloudflare, thì thử lại cũng vô ích)
    if (turnstileOn && (!tried || token) && (await needsVerify(response))) {
      rememberVerified(false);
      token = await getTurnstileToken("ask");
      if (signal?.aborted) return "aborted";
      response = await send(recent, lang, signal, token);
    }
    if (token && response.ok) rememberVerified(true);
  } catch {
    return signal?.aborted ? "aborted" : "error";
  }

  if (await needsVerify(response)) return "verify";
  if (response.status === 503) return "not_configured";
  if (response.status === 429) return "rate_limited";
  if (!response.ok || !response.body) return "error";

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let outcome: AskOutcome = "error";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let event: { t: string; v?: string; code?: string };
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.t === "d" && event.v) onText(event.v);
        else if (event.t === "cut") outcome = "cut";
        else if (event.t === "refusal") outcome = "refusal";
        else if (event.t === "error") outcome = event.code === "busy" || event.code === "quota" ? event.code : "error";
        else if (event.t === "end" && outcome === "error") outcome = "ok";
      }
    }
  } catch {
    return signal?.aborted ? "aborted" : "error";
  }
  return outcome;
}
