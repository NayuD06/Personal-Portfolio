// Dùng chung cho khung sổ lưu bút (trình duyệt) và API /api/guestbook (server).

export type GuestbookEntry = { id: string; name: string; message: string; at: number };

export const MAX_NAME = 40;
export const MAX_MESSAGE = 280;

/** Các lý do không gửi được, khớp với mã lỗi API trả về */
export type GuestbookError = "invalid" | "no_links" | "rude" | "duplicate" | "rate_limited" | "not_configured" | "failed";
