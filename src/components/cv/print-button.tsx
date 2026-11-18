"use client";

import type { ReactNode } from "react";

/** Mở hộp thoại in của trình duyệt (chọn "Lưu dưới dạng PDF" để xuất file). */
export function PrintButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
