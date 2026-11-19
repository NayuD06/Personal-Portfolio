import type { Lang } from "./i18n";

// Gọi /api/ask từ trình duyệt và nhận câu trả lời từng đoạn. Dùng chung cho khung chat và lệnh "ask" trong terminal.

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Kết quả một lần hỏi: ok, hoặc lý do không trả lời được */
export type AskOutcome = "ok" | "cut" | "refusal" | "not_configured" | "rate_limited" | "busy" | "quota" | "error" | "aborted";

export const MAX_QUESTION = 500;

export async function askAssistant(
  messages: ChatMessage[],
  lang: Lang,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<AskOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, lang }),
      signal,
    });
  } catch {
    return signal?.aborted ? "aborted" : "error";
  }

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
