# Personal Portfolio

Trang portfolio cá nhân làm bằng **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**, animation bằng **Motion**, có nút chuyển **sáng / tối** và **tiếng Anh / tiếng Việt (EN / VI)**. Sẵn sàng deploy lên **Vercel**.

Các mục trên trang: Hero (icon công nghệ xoay quanh ảnh đại diện), About, Skills (lưới bento), Services, Projects (dự án nổi bật + lọc theo nhóm), Education (học vấn: mỗi trường một hàng, hình minh họa tự vẽ khi cuộn, thanh tiến độ năm học), GitHub Activity (số liệu GitHub tự cập nhật), Contact (form) và Footer. Trên điện thoại có thanh menu dưới đáy màn hình kiểu app.

Ngoài trang chính còn có:

- **`/projects/<slug>`**: trang chi tiết từng dự án (vấn đề, cách làm, tính năng chính, công nghệ, ảnh chụp bấm vào để phóng to, dự án trước/sau).
- **`/cv`**: CV một trang A4 dựng tự động từ nội dung portfolio, có nút In và Tải PDF.

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

- **`avatar`**: đặt ảnh vào `public/avatar.jpg` rồi ghi `avatar: "/avatar.jpg"`. Để trống thì hiện chữ viết tắt.
- **`resumeUrl`**: file CV cho nút "Tải CV" ở đầu trang và mục About. Hiện trỏ tới hai file `public/cv/Duy-An-CV-VI.pdf` và `public/cv/Duy-An-CV-EN.pdf` (tải đúng file theo ngôn ngữ đang chọn). Hai file này được xuất từ trang `/cv`. Khi sửa nội dung trong `profile.ts`, xuất lại PDF như sau: chạy `npm run dev`, mở http://localhost:3000/cv, chọn ngôn ngữ, bấm **In**, chọn máy in "Lưu dưới dạng PDF" (Save as PDF), khổ A4, lề "Không" (None), rồi lưu đè file trong `public/cv/`. Muốn dùng CV tự làm thì chép file vào `public/cv/` và sửa đường dẫn; chỉ có một file thì ghi một chuỗi, vd. `resumeUrl: "/cv/Duy-An-CV.pdf"`. Để trống `""` để ẩn nút.
- **`website`**: tên miền của trang, hiện trên CV.
- **`socials`**: GitHub, Facebook và Email đã có link thật. Link Discord đang là link mẫu nên nút Discord đang ẩn; thay link thật vào là nút tự hiện (cách lấy link ghi ngay trên mục `socials`). Link `mailto:` mở ứng dụng email, các link khác mở tab mới.
- **`education`**: các trường trong mục Học vấn (UTH, VTC Academy). Sửa mô tả và danh sách môn học (`subjects`) cho đúng với chương trình bạn học. Ảnh và logo nằm trong `public/education/`: ảnh UTH lấy từ Wikimedia Commons (giấy phép CC BY-SA 4.0, nên giữ dòng ghi nguồn `imageCredit`), ảnh và logo VTC lấy từ trang vtc.edu.vn, logo UTH lấy từ Wikimedia Commons (CC0). Muốn đổi ảnh khác thì thay file cùng tên (ảnh ngang, nên tỉ lệ 4:3 hoặc 3:2) hoặc sửa `image`, `logo`. Để trống `image` thì dùng hình minh họa tự vẽ, để trống `logo` thì hiện chữ viết tắt. `progress` là năm đang học trên tổng số năm, bỏ đi nếu không muốn hiện thanh tiến độ.
- **`projects`**: mỗi dự án có thể thêm `image: "/projects/ten-anh.png"` (ảnh chụp màn hình đặt trong `public/projects/`) để thay cho ảnh bìa tự vẽ, và `liveUrl` nếu có bản chạy thật. Dự án có `featured: true` hiện to ở đầu mục Projects, các dự án còn lại nằm trong lưới "More projects".
  Trang chi tiết của mỗi dự án lấy nội dung từ các trường: `slug` (đường dẫn `/projects/<slug>`), `problem` (vấn đề), `approach` (cách làm, mỗi ý một phần tử), `features` (tính năng chính), `context` (nhãn nhỏ như "Đồ án nhóm 5 người", không bắt buộc) và `gallery` (ảnh chụp thêm đặt trong `public/projects/<slug>/`, mỗi ảnh có `caption`, nên dùng ảnh ngang tỉ lệ 16:10). Thêm dự án mới thì nhớ đặt `slug` không trùng với dự án khác.

Tên icon dùng trong file dữ liệu lấy từ `src/lib/icons.tsx` (thêm icon mới ở đó nếu cần).

## Form liên hệ

Mặc định nút **Send message** mở ứng dụng email của người xem với nội dung đã điền sẵn.

Muốn tin nhắn gửi thẳng về email của bạn:

1. Tạo form miễn phí tại https://formspree.io, lấy ID dạng `xyzabcd`.
2. Tạo file `.env.local` (xem `.env.example`) với dòng `NEXT_PUBLIC_FORMSPREE_ID=xyzabcd`.
3. Trên Vercel, thêm biến môi trường cùng tên rồi deploy lại.

## Mục GitHub Activity

Số liệu (số repo, số sao, ngôn ngữ, repo cập nhật gần đây, biểu đồ đóng góp) được lấy từ GitHub của tài khoản ghi ở `githubUsername` trong `profile.ts`:

- Lấy một lần lúc build, sau đó Vercel tự làm mới ngầm khoảng **mỗi giờ**, không cần deploy lại.
- Không cần token. Nếu GitHub báo vượt giới hạn lượt gọi (hiếm), tạo token tại https://github.com/settings/personal-access-tokens (loại fine-grained, chỉ đọc repo công khai, không cần thêm quyền) rồi đặt biến `GITHUB_TOKEN` trên Vercel. Token chỉ dùng ở server, không lộ ra trình duyệt.
- Nếu lúc build không gọi được GitHub, trang dùng số liệu lưu sẵn trong `src/data/github-snapshot.ts` để mục này không bị trống.

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
│  ├─ projects/[slug]/      trang chi tiết dự án
│  └─ cv/                   trang CV (in ra PDF)
├─ components/
│  ├─ navbar.tsx            menu, đánh dấu mục đang xem, menu mobile
│  ├─ subpage-header.tsx    thanh trên cùng của trang chi tiết dự án và trang CV
│  ├─ project/gallery.tsx   lưới ảnh chụp + xem ảnh lớn
│  ├─ cv/print-button.tsx   nút In trên trang CV
│  ├─ sections/             hero, about, skills, services, projects, education, github-activity, contact, footer
│  └─ ui/                   các thành phần nhỏ dùng lại (reveal, thẻ, nút sáng/tối, nút EN/VI...)
├─ data/
│  ├─ profile.ts            ★ nội dung về bạn
│  └─ ui.ts                 ★ chữ trên giao diện
└─ lib/                     icon, đa ngôn ngữ (i18n.tsx, use-lang.ts), địa chỉ trang
```
