import type { KeyboardEvent as ReactKeyboardEvent } from "react";

// Giữ phím Tab chạy vòng bên trong một hộp thoại (Terminal, khung chat trên điện thoại, ảnh phóng to),
// để người dùng bàn phím / trình đọc màn hình không lạc ra trang phía sau đang bị che.

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Các phần tử bấm Tab tới được và đang hiện trong hộp */
export function focusableIn(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest("[inert], [aria-hidden='true']") && element.getClientRects().length > 0,
  );
}

/**
 * Gắn vào onKeyDown của hộp thoại. Tab ở phần tử cuối quay về phần tử đầu (Shift + Tab thì ngược lại).
 * Bỏ qua nếu phím Tab đã được dùng việc khác (vd. gợi ý lệnh trong ô Terminal gọi preventDefault).
 */
export function keepFocusInside(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const container = event.currentTarget;
  const items = focusableIn(container);
  if (items.length === 0) {
    event.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  const inside = active ? container.contains(active) : false;
  if (event.shiftKey && (!inside || active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (!inside || active === last)) {
    event.preventDefault();
    first.focus();
  }
}
