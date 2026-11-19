"use client";

import { useEffect } from "react";

// Lớp phủ toàn màn hình (bảng lệnh Ctrl + K, Terminal, xem ảnh lớn) có nền mờ backdrop-filter: blur.
// Nếu phía sau còn hiệu ứng chạy (chòm sao, vòng icon, đốm sáng...), card đồ họa phải làm mờ lại cả màn hình
// mỗi khung hình nên bị tụt khung hình rõ rệt. Khi lớp phủ đang mở, html có data-overlay và các hiệu ứng
// đó tạm dừng (globals.css, hero-particles.tsx); phía sau đã bị làm mờ và tối đi nên gần như không thấy khác.

/** Đánh dấu đang mở một lớp phủ. Trả về hàm bỏ đánh dấu (đếm số lớp đang mở, vì có lúc hai lớp chồng lên nhau khi chuyển). */
export function holdOverlay() {
  const root = document.documentElement;
  root.dataset.overlay = String(Number(root.dataset.overlay || 0) + 1);
  return () => {
    const left = Number(root.dataset.overlay || 1) - 1;
    if (left > 0) root.dataset.overlay = String(left);
    else delete root.dataset.overlay;
  };
}

/** Gọi trong component lớp phủ: đánh dấu khi đang hiện (active = true), tự bỏ khi ẩn hoặc gỡ khỏi trang. */
export function useOverlay(active = true) {
  useEffect(() => (active ? holdOverlay() : undefined), [active]);
}
