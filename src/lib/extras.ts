// Mở Terminal, khung chat AI và báo tìm thấy bí mật từ bất kỳ đâu (menu, bảng lệnh Ctrl + K, terminal...).
// Phần hiển thị nằm ở src/components/extras/, gắn một lần trong layout.

export const OPEN_TERMINAL = "open-terminal";
export const OPEN_ASK = "open-ask";
export const SECRET_FOUND = "secret-found";

export type SecretId = "konami" | "logo" | "sudo" | "matrix" | "console" | "shake" | "rmrf" | "nightowl" | "pixel" | "snake";
/** Thứ tự hiện trên thẻ thành tích và trong lệnh `secrets` của Terminal */
export const secretIds: SecretId[] = ["konami", "logo", "sudo", "matrix", "console", "shake", "rmrf", "nightowl", "pixel", "snake"];

export function openTerminal() {
  window.dispatchEvent(new Event(OPEN_TERMINAL));
}

/** Mở khung chat, có thể kèm sẵn một câu hỏi để gửi luôn */
export function openAsk(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_ASK, { detail: question }));
}

export function foundSecret(id: SecretId) {
  // lưu ngay, để hai bí mật tìm ra cùng lúc thì cái trước không bị mất
  saveSecret(id);
  window.dispatchEvent(new CustomEvent(SECRET_FOUND, { detail: id }));
}

let audio: AudioContext | undefined;

/**
 * Tạo sẵn bộ phát âm thanh ngay trong lúc người xem bấm chuột (Safari chỉ cho phát tiếng nếu bật lên trong lúc bấm).
 * Dùng cho tiếng hét của màn jumpscare.
 */
export function primeAudio() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    // trình duyệt không hỗ trợ: màn jumpscare vẫn chạy, chỉ không có tiếng
  }
}

export function getAudio() {
  return audio;
}

const STORAGE_KEY = "secrets-found";

/** Các bí mật người xem đã tìm thấy (lưu trong trình duyệt) */
export function readSecrets(): SecretId[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? secretIds.filter((id) => saved.includes(id)) : [];
  } catch {
    return [];
  }
}

export function saveSecret(id: SecretId): SecretId[] {
  const found = readSecrets();
  if (!found.includes(id)) found.push(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // trình duyệt chặn lưu trữ: vẫn hiện hiệu ứng, chỉ không nhớ
  }
  return found;
}
