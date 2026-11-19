"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Mặc định là giao diện tối như mẫu; lựa chọn của người xem được lưu lại.
    // Không bật disableTransitionOnChange: nó chèn rồi gỡ một thẻ <style> mỗi lần áp giao diện (cả lúc vừa tải trang),
    // bắt trình duyệt tính lại style toàn trang thêm mấy lần. Việc tắt transition lúc đổi màu do switchTheme lo (theme-toggle.tsx).
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* Tôn trọng cài đặt "giảm chuyển động" của hệ điều hành */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
