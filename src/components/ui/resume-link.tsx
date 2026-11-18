import type { ReactNode } from "react";
import { profile } from "@/data/profile";

/**
 * Link tải CV. Mỗi ngôn ngữ một file thì in sẵn cả hai link, CSS ẩn link không dùng
 * (cùng cách với <T>), nên dùng được trong server component và không bị nháy khi đổi ngôn ngữ.
 */
export function ResumeLink({ className, children }: { className: string; children: ReactNode }) {
  const url = profile.resumeUrl;
  if (!url) return null;

  if (typeof url === "string") {
    return (
      <a href={url} download className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <a href={url.en} download className={`l-en ${className}`}>
        {children}
      </a>
      <a href={url.vi} download className={`l-vi ${className}`}>
        {children}
      </a>
    </>
  );
}
