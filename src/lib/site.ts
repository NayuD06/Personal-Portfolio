// Địa chỉ gốc của trang, dùng cho metadata, sitemap và ảnh chia sẻ.
// Trên Vercel, VERCEL_PROJECT_PRODUCTION_URL được tự động cung cấp khi build.
// Nếu bạn gắn tên miền riêng, đặt NEXT_PUBLIC_SITE_URL trong Project Settings > Environment Variables.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
