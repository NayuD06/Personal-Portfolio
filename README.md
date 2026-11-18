# Personal Portfolio

Trang portfolio cá nhân làm bằng **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**, animation bằng **Motion**, có nút chuyển **sáng / tối** và **tiếng Anh / tiếng Việt (EN / VI)**. Sẵn sàng deploy lên **Vercel**.

Các mục trên trang: Hero (icon công nghệ xoay quanh ảnh đại diện), About, Skills (lưới bento), Services, Projects (dự án nổi bật + lọc theo nhóm), Testimonials (carousel), Contact (form) và Footer.

## Chạy trên máy

Cần Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

| Lệnh | Việc làm |
| --- | --- |
| `npm run dev` | chạy bản phát triển, tự tải lại khi sửa code |
| `npm run build` | build bản production (Vercel cũng chạy lệnh này) |
| `npm start` | chạy bản đã build |
| `npm run lint` | kiểm tra code |

## Sửa nội dung

Nội dung nằm ở hai file, không cần đụng vào component:

- **`src/data/profile.ts`**: thông tin về bạn (giới thiệu, kỹ năng, dịch vụ, dự án, nhận xét, link...).
- **`src/data/ui.ts`**: chữ trên giao diện (menu, tiêu đề mục, nút bấm, form...).

Chữ cần hiện theo 2 ngôn ngữ viết dạng `{ en: "English text", vi: "Chữ tiếng Việt" }`. Chữ giống nhau ở cả 2 ngôn ngữ (tên riêng, tên công nghệ) chỉ cần viết một chuỗi bình thường.

Ngôn ngữ mặc định lấy theo trình duyệt của người xem (trình duyệt tiếng Việt thì hiện tiếng Việt), sau khi bấm nút EN / VI thì trang nhớ lựa chọn đó.

Những chỗ nên thay ngay:

- **`email`**: đang là `hello@example.com`.
- **`avatar`**: đặt ảnh vào `public/avatar.jpg` rồi ghi `avatar: "/avatar.jpg"`. Để trống thì hiện chữ viết tắt.
- **`resumeUrl`**: đặt CV vào `public/cv.pdf` rồi ghi `resumeUrl: "/cv.pdf"` để hiện nút "Download CV" thay cho nút GitHub.
- **`socials`**: link LinkedIn, Facebook đang là link mẫu.
- **`testimonials`**: đang là **nội dung mẫu**, hãy thay bằng nhận xét thật hoặc xóa hết phần tử để ẩn mục này.
- **`projects`**: mỗi dự án có thể thêm `image: "/projects/ten-anh.png"` (ảnh chụp màn hình đặt trong `public/projects/`) để thay cho ảnh bìa tự vẽ, và `liveUrl` nếu có bản chạy thật. Dự án có `featured: true` hiện to ở đầu mục Projects, các dự án còn lại nằm trong lưới "More projects".

Tên icon dùng trong file dữ liệu lấy từ `src/lib/icons.tsx` (thêm icon mới ở đó nếu cần).

## Form liên hệ

Mặc định nút **Send message** mở ứng dụng email của người xem với nội dung đã điền sẵn.

Muốn tin nhắn gửi thẳng về email của bạn:

1. Tạo form miễn phí tại https://formspree.io, lấy ID dạng `xyzabcd`.
2. Tạo file `.env.local` (xem `.env.example`) với dòng `NEXT_PUBLIC_FORMSPREE_ID=xyzabcd`.
3. Trên Vercel, thêm biến môi trường cùng tên rồi deploy lại.

## Deploy lên Vercel

1. Đẩy code lên GitHub (repo `Personal-Portfolio`).
2. Vào https://vercel.com/new, đăng nhập bằng GitHub, chọn **Import** repo này.
3. Vercel tự nhận ra Next.js, không cần đổi cấu hình gì. Bấm **Deploy**.
4. Từ giờ mỗi lần push lên nhánh `main`, Vercel tự build và cập nhật trang. Push lên nhánh khác sẽ có link xem trước riêng.

Gắn tên miền riêng: **Project Settings > Domains**, sau đó đặt `NEXT_PUBLIC_SITE_URL` là tên miền đó để ảnh chia sẻ link và sitemap dùng đúng địa chỉ.

## Cấu trúc

```
src/
├─ app/
│  ├─ layout.tsx            font, metadata (SEO), theme, chọn ngôn ngữ trước khi trang hiện
│  ├─ page.tsx              ghép các mục của trang
│  ├─ globals.css           màu sáng/tối, hiệu ứng, animation
│  ├─ opengraph-image.tsx   ảnh xem trước khi chia sẻ link
│  ├─ icon.svg              favicon
│  ├─ sitemap.ts, robots.ts
├─ components/
│  ├─ navbar.tsx            menu, đánh dấu mục đang xem, menu mobile
│  ├─ sections/             hero, about, skills, services, projects, testimonials, contact, footer
│  └─ ui/                   các thành phần nhỏ dùng lại (reveal, thẻ, nút sáng/tối, nút EN/VI...)
├─ data/
│  ├─ profile.ts            ★ nội dung về bạn
│  └─ ui.ts                 ★ chữ trên giao diện
└─ lib/                     icon, đa ngôn ngữ (i18n.tsx, use-lang.ts), địa chỉ trang
```
