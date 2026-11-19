// Lấy mã "người thật" từ Cloudflare Turnstile trên trình duyệt, dùng cho form liên hệ và trợ lý AI.
// Chạy ẩn: đa số người xem không thấy gì, chỉ khi Cloudflare nghi ngờ mới hiện một ô nhỏ ở cuối màn hình để bấm.
// Chưa đặt NEXT_PUBLIC_TURNSTILE_SITE_KEY thì trả undefined ngay, không tải gì thêm.

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
let loading: Promise<Turnstile | undefined> | undefined;

function load() {
  if (!SITE_KEY) return Promise.resolve(undefined);
  return (loading ??= new Promise<Turnstile | undefined>((resolve) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      // bị chặn (trình chặn quảng cáo, mạng): lần sau thử tải lại
      loading = undefined;
      resolve(undefined);
    };
    document.head.appendChild(script);
  }));
}

export const turnstileOn = Boolean(SITE_KEY);

/** Tải sẵn script Cloudflare (khi mở khung chat hoặc bấm vào form) để lúc gửi không phải chờ */
export function warmTurnstile() {
  void load();
}

/** Mã dùng một lần, hoặc undefined nếu chưa bật Turnstile / không tải được / quá 60 giây chưa xong */
export async function getTurnstileToken(action: "contact" | "ask"): Promise<string | undefined> {
  const turnstile = await load();
  if (!turnstile) return undefined;
  return new Promise((resolve) => {
    const box = document.createElement("div");
    box.className = "turnstile-box";
    document.body.appendChild(box);
    let id = "";
    let settled = false;
    const finish = (token?: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      // đợi Cloudflare chạy xong callback rồi mới gỡ ô
      window.setTimeout(() => {
        try {
          turnstile.remove(id);
        } catch {
          // đã gỡ
        }
        box.remove();
      }, 0);
      resolve(token);
    };
    const timer = window.setTimeout(() => finish(undefined), 60000);
    try {
      id = turnstile.render(box, {
        sitekey: SITE_KEY,
        action,
        appearance: "interaction-only",
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        language: document.documentElement.dataset.lang === "vi" ? "vi" : "en",
        callback: (token: string) => finish(token),
        "error-callback": () => finish(undefined),
        "expired-callback": () => finish(undefined),
      });
    } catch {
      finish(undefined);
    }
  });
}
