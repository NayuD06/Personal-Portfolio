import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Header bảo mật gửi kèm mọi trang (chấm điểm ở securityheaders.com).
// CSP: chỉ cho chạy script, ảnh, font... từ chính trang này, cộng thêm Cloudflare Turnstile (chống bot) và
// script thống kê của Vercel. Trang dùng chế độ dựng sẵn (cacheComponents) nên không dùng nonce được,
// phải để 'unsafe-inline' cho script nhỏ Next.js chèn vào trang. Thêm dịch vụ ngoài mới thì nhớ thêm vào đây.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com https://va.vercel-scripts.com${isDev ? " ws:" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // chỉ mở trang qua HTTPS trong 2 năm tới (kể cả tên miền con)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // không cho trang khác nhúng trang này vào iframe (chống lừa bấm)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // tắt quyền không dùng tới; cảm biến chuyển động vẫn bật cho easter egg lắc điện thoại
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=(), accelerometer=(self), gyroscope=(self)",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // không để lộ "X-Powered-By: Next.js"
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // CSP cho trang web; bỏ qua file PDF (CV) để trình xem PDF của trình duyệt không bị chặn
      { source: "/:path((?!.*\\.pdf$).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
  },
};

export default nextConfig;
