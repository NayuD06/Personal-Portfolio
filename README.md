# Personal Portfolio

Trang portfolio cá nhân làm bằng **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**, animation bằng **Motion**, có nút chuyển **sáng / tối** và **tiếng Anh / tiếng Việt (EN / VI)**. Sẵn sàng deploy lên **Vercel**.

Các mục trên trang: Hero (icon công nghệ xoay quanh ảnh đại diện), About, Skills (lưới bento), Services, Projects (dự án nổi bật + lọc theo nhóm), Education (học vấn: mỗi trường một hàng, hình minh họa tự vẽ khi cuộn, thanh tiến độ năm học), Journey (hành trình: dòng thời gian từ năm nhất tới giờ, đường thời gian sáng dần khi cuộn), GitHub Activity (số liệu GitHub tự cập nhật), Contact (form) và Footer. Trên điện thoại có thanh menu dưới đáy màn hình kiểu app.

Ngoài trang chính còn có:

- **`/projects/<slug>`**: trang chi tiết từng dự án (vấn đề, cách làm, tính năng chính, công nghệ, ảnh chụp bấm vào để phóng to, dự án trước/sau).
- **`/cv`**: CV một trang A4 dựng tự động từ nội dung portfolio, có nút In và Tải PDF.
- **Trang 404**: hiện khi mở một đường link không tồn tại. Số 0 là một quỹ đạo có icon công nghệ bay quanh, khung terminal hiện đúng link người xem vừa mở và gợi ý các trang còn lại (`src/app/not-found.tsx`).
- **Bảng lệnh Ctrl + K** (⌘ + K trên Mac, hoặc bấm nút kính lúp trên menu): gõ để nhảy tới một mục, mở một dự án, đổi ngôn ngữ, đổi sáng/tối, tải CV, chép email. Gõ có dấu hay không dấu đều được. Dùng được ở mọi trang (`src/components/command-palette.tsx`). Dự án mới thêm vào `profile.ts` tự có trong bảng. Gõ một câu hỏi rồi chọn dòng **Hỏi AI** để hỏi trợ lý AI.
- **Chế độ Terminal** (nút `>_` trên menu, phím `` ` `` cạnh số 1, hoặc Ctrl + K > Chế độ Terminal): cả trang thành cửa sổ dòng lệnh. Gõ `help` để xem lệnh: `about`, `skills`, `projects`, `projects 1`, `education`, `contact`, `cv`, `neofetch`, `open <tên>`, `theme`, `lang`, `ask <câu hỏi>`... Có Tab để gợi ý, ↑ ↓ để gọi lại lệnh cũ, nút lệnh nhanh cho điện thoại, vài lệnh ẩn (`ls`, `cat`, `whoami`, `sudo`, `secrets`...). Nội dung lấy từ `profile.ts`, lệnh nằm ở `src/components/extras/terminal-commands.tsx`.
- **Trợ lý AI** (nút **Hỏi AI** ở góc phải dưới): khách hỏi về bạn, ví dụ "An có biết React không?", và nhận câu trả lời dựa trên nội dung portfolio, chữ hiện ra dần như đang gõ. Dùng Google Gemini gói miễn phí, chỉ cần đặt API key, xem mục [Trợ lý AI](#trợ-lý-ai-hỏi-đáp-về-bạn).
- **Easter egg**: 3 bí mật, tìm được bí mật nào thì hiện thẻ thành tích và đếm "Đã tìm 1/3": gõ mã Konami (↑ ↑ ↓ ↓ ← → ← → B A) ở trang chính, bấm logo 5 lần liên tiếp (mặt ma nhảy ra ngay kèm tiếng hét, khoảng 1,6 giây là tự tắt, bấm hoặc Esc để tắt sớm), gõ `sudo` trong Terminal. Máy bật "giảm chuyển động" thì bỏ hiệu ứng, chỉ hiện thẻ.
- **Con trỏ chuột riêng**: vẫn là mũi tên như con trỏ thường nhưng màu xanh viền trắng, rê lên nút / đường link thì thành bàn tay cùng kiểu. Ở ô nhập chữ vẫn là con trỏ gõ chữ bình thường. Vẽ bằng SVG ngay trong `src/app/globals.css` (mục "Con trỏ chuột riêng"), không dùng JavaScript.
- **Nền hạt ở đầu trang**: các chấm sáng trôi và nối nhau, rê chuột tới thì dạt ra và nối dây tới con trỏ, bấm chuột thì bắn tung ra (`src/components/ui/hero-particles.tsx`). Chạy sau khi trang tải xong và dừng khi cuộn đi, nên không làm chậm trang.
  Hai thứ này chỉ có trên máy có chuột, điện thoại và máy tính bảng vẫn như cũ. Nền hạt cũng tự tắt khi máy bật "giảm chuyển động".

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

- **`avatar`** và **`aboutPhoto`**: ảnh đại diện (vuông) và ảnh ở mục About (dọc 4:5), đặt trong `public/` rồi ghi đường dẫn, vd. `avatar: "/avatar-v2.jpg"`. Khi thay ảnh thì đặt tên file mới (vd. `avatar-v3.jpg`) thay vì chép đè, vì Next.js và Vercel giữ bản ảnh đã thu nhỏ theo tên file nên chép đè có thể vẫn hiện ảnh cũ. Để trống thì hiện chữ viết tắt (ảnh đại diện) hoặc khung code (ảnh About).
- **`resumeUrl`**: file CV cho nút "Tải CV" ở đầu trang và mục About. Hiện trỏ tới hai file `public/cv/Duy-An-CV-VI.pdf` và `public/cv/Duy-An-CV-EN.pdf` (tải đúng file theo ngôn ngữ đang chọn). Hai file này được xuất từ trang `/cv`. Khi sửa nội dung trong `profile.ts`, xuất lại PDF như sau: chạy `npm run dev`, mở http://localhost:3000/cv, chọn ngôn ngữ, bấm **In**, chọn máy in "Lưu dưới dạng PDF" (Save as PDF), khổ A4, lề "Không" (None), rồi lưu đè file trong `public/cv/`. Muốn dùng CV tự làm thì chép file vào `public/cv/` và sửa đường dẫn; chỉ có một file thì ghi một chuỗi, vd. `resumeUrl: "/cv/Duy-An-CV.pdf"`. Để trống `""` để ẩn nút.
- **`website`**: tên miền của trang, hiện trên CV.
- **`socials`**: GitHub, Facebook và Email đã có link thật. Link Discord đang là link mẫu nên nút Discord đang ẩn; thay link thật vào là nút tự hiện (cách lấy link ghi ngay trên mục `socials`). Link `mailto:` mở ứng dụng email, các link khác mở tab mới.
- **`journey`**: các mốc của mục Hành trình, xếp từ cũ tới mới. Mỗi mốc có `year` (gom theo năm), `date` (chữ hiện trên mốc) và `kind`: `university` (học kỳ ở UTH), `academy` (học kỳ ở VTC), `milestone` (cột mốc nhỏ) hoặc `project`. Mốc dự án chỉ cần ghi `project: "<slug>"`, tên và mô tả lấy từ danh sách dự án. Có thể thêm `tags` (môn học, công nghệ) và `link`. Hiệu ứng cuộn chạy bằng CSS nên không làm chậm trang; trình duyệt cũ (Firefox) thì hiện sẵn trạng thái đã sáng.
- **`education`**: các trường trong mục Học vấn (UTH, VTC Academy). Sửa mô tả và danh sách môn học (`subjects`) cho đúng với chương trình bạn học. Ảnh và logo nằm trong `public/education/`: ảnh UTH lấy từ Wikimedia Commons (giấy phép CC BY-SA 4.0, nên giữ dòng ghi nguồn `imageCredit`), ảnh và logo VTC lấy từ trang vtc.edu.vn, logo UTH lấy từ Wikimedia Commons (CC0). Muốn đổi ảnh khác thì thay file cùng tên (ảnh ngang, nên tỉ lệ 4:3 hoặc 3:2) hoặc sửa `image`, `logo`. Để trống `image` thì dùng hình minh họa tự vẽ, để trống `logo` thì hiện chữ viết tắt. `progress` là năm đang học trên tổng số năm, bỏ đi nếu không muốn hiện thanh tiến độ.
- **`projects`**: mỗi dự án có thể thêm `image: "/projects/ten-anh.png"` (ảnh chụp màn hình đặt trong `public/projects/`) để thay cho ảnh bìa tự vẽ, và `liveUrl` nếu có bản chạy thật. Dự án có `featured: true` hiện to ở đầu mục Projects, các dự án còn lại nằm trong lưới "More projects".
  Trang chi tiết của mỗi dự án lấy nội dung từ các trường: `slug` (đường dẫn `/projects/<slug>`), `problem` (vấn đề), `approach` (cách làm, mỗi ý một phần tử), `features` (tính năng chính), `context` (nhãn nhỏ như "Đồ án nhóm 5 người", không bắt buộc) và `gallery` (ảnh chụp thêm đặt trong `public/projects/<slug>/`, mỗi ảnh có `caption`, nên dùng ảnh ngang tỉ lệ 16:10). Thêm dự án mới thì nhớ đặt `slug` không trùng với dự án khác.

Tên icon dùng trong file dữ liệu lấy từ `src/lib/icons.tsx` (thêm icon mới ở đó nếu cần).

## Form liên hệ

Tin nhắn từ form được gửi thẳng về email của bạn qua [Resend](https://resend.com) (gói miễn phí 3.000 email/tháng). Code nằm ở `src/app/api/contact/route.ts`, có sẵn chống spam: ô ẩn bẫy bot và giới hạn 5 tin mỗi 10 phút cho một địa chỉ IP. Trong email nhận được, bấm **Trả lời** là trả lời thẳng cho người gửi.

Cách bật (làm một lần):

1. Đăng ký tài khoản tại https://resend.com **bằng chính email muốn nhận tin** (`nayud.2006@gmail.com`).
2. Vào **API Keys > Create API Key**, quyền "Sending access", chép key (dạng `re_...`).
3. Trên Vercel: **Project Settings > Environment Variables**, thêm `RESEND_API_KEY` = key vừa chép, rồi **Redeploy**.
4. Chạy thử trên máy: tạo file `.env.local` (xem `.env.example`) với dòng `RESEND_API_KEY=re_...`.

Chưa đặt `RESEND_API_KEY` thì form vẫn dùng được: nút **Send message** mở ứng dụng email của người xem với nội dung đã điền sẵn.

Giao diện email nhận được nằm ở `src/lib/contact-email.ts` (đầu thư, thẻ người gửi, lời nhắn, nút Trả lời / Gọi, bảng thông tin). Thẻ cảm ơn người gửi thấy trên trang sau khi gửi nằm ở `src/components/contact/sent-card.tsx`, chữ trong thẻ sửa ở `ui.ts` (các mục `sent...`, vd. thời gian trả lời "24 giờ").

### Để email không vào Spam

Khi chưa xác minh tên miền, thư được gửi từ `onboarding@resend.dev`, địa chỉ dùng chung cho mọi người dùng Resend nên Gmail hay cho vào Spam. Cách sửa tạm: mở thư trong Spam, bấm **Báo cáo không phải spam**, rồi tạo bộ lọc (ô tìm kiếm Gmail > Hiện tùy chọn tìm kiếm > Từ: `onboarding@resend.dev` > Tạo bộ lọc > tick **Không bao giờ gửi đến Spam**).

Cách sửa lâu dài: gửi từ chính tên miền `feb20th.click`, có chữ ký DKIM/SPF để Gmail tin thư là thật.

1. Trên Resend: **Domains > Add Domain**, nhập `feb20th.click`, chọn Region (để mặc định cũng được). Resend hiện ra danh sách bản ghi DNS, thường gồm:

   | Loại | Tên (Host) | Giá trị | Ưu tiên |
   | --- | --- | --- | --- |
   | MX | `send` | `feedback-smtp.<region>.amazonses.com` | 10 |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | |
   | TXT | `resend._domainkey` | chuỗi dài bắt đầu bằng `p=MIGf...` (khóa riêng của bạn) | |

   Giá trị thật lấy đúng từ trang Resend, bấm nút copy cạnh từng dòng, đừng gõ tay.
2. Thêm bản ghi DMARC (khuyên dùng, giúp Gmail tin hơn):

   | Loại | Tên (Host) | Giá trị |
   | --- | --- | --- |
   | TXT | `_dmarc` | `v=DMARC1; p=none;` |

3. Vào trang quản lý tên miền ở **iNET** > chọn `feb20th.click` > **Quản lý DNS** (Cấu hình DNS) > **Thêm bản ghi**, thêm từng dòng ở trên. Ô "Tên/Host" chỉ nhập phần đứng trước tên miền (`send`, `resend._domainkey`, `_dmarc`), không nhập cả `.feb20th.click`. TTL để mặc định. Hai bản ghi đang dùng cho Vercel (`@` loại A và `www` loại CNAME) giữ nguyên, các bản ghi mới không ảnh hưởng tới trang web.
4. Quay lại Resend bấm **Verify DNS Records**. Thường vài phút là xong, chậm nhất khoảng vài giờ, đến khi trạng thái là **Verified**.
5. Trên Vercel thêm biến `CONTACT_FROM_EMAIL` = `Duy An Portfolio <contact@feb20th.click>` rồi **Redeploy**. Địa chỉ `contact@` không cần có hộp thư thật, vì khi bạn bấm Trả lời thư sẽ gửi tới email của người gửi.
6. Gửi thử từ form. Một hai thư đầu nếu vẫn vào Spam thì bấm **Báo cáo không phải spam**, Gmail sẽ học dần. Muốn chắc chắn luôn vào Hộp thư đến thì tạo bộ lọc như cách tạm ở trên nhưng với Từ: `contact@feb20th.click`.

## Trợ lý AI (hỏi đáp về bạn)

Nút **Hỏi AI** và lệnh `ask` trong Terminal gửi câu hỏi tới **Google Gemini** (gói miễn phí, model Flash-Lite) qua `src/app/api/ask/route.ts`. Trợ lý chỉ trả lời dựa trên nội dung trong `profile.ts` (file `src/lib/ask-knowledge.ts` tự dựng phần kiến thức này), nên sửa `profile.ts` là trợ lý tự biết nội dung mới. Câu hỏi ngoài lề hoặc thông tin không có trong portfolio thì trợ lý từ chối và gợi ý email cho bạn.

Cách bật (miễn phí, không cần thẻ):

1. Vào https://aistudio.google.com/apikey, đăng nhập bằng tài khoản Google.
2. Bấm **Create API key** (chọn hoặc tạo một project bất kỳ), chép key (bắt đầu bằng `AIza`). **Không** bấm bật thanh toán (Billing): để nguyên gói Free thì không bao giờ bị trừ tiền.
3. Trên Vercel: **Project Settings > Environment Variables**, thêm `GEMINI_API_KEY` = key vừa chép, rồi **Redeploy**. Chạy trên máy thì ghi vào `.env.local` (xem `.env.example`).

Chưa đặt key thì khung chat vẫn hiện, chỉ báo "trợ lý chưa được bật" kèm email của bạn. Không cần cài thêm gói nào, code gọi thẳng API của Google.

Giới hạn của gói miễn phí:

- Dùng model `gemini-3.5-flash-lite` (nhanh, tiếng Việt tốt). Gói Free của Google cho khoảng **500 câu hỏi một ngày** và 15 câu một phút cho mỗi model. Model này hết lượt thì code tự chuyển sang `gemini-3.1-flash-lite` (thêm khoảng 500 câu nữa). Lượt được làm mới lúc 0 giờ giờ Mỹ (khoảng 14 đến 15 giờ chiều giờ Việt Nam). Google có thể đổi các con số này, xem lượt còn lại ở https://aistudio.google.com (mục Usage / Rate limit).
- Hết sạch lượt trong ngày thì khung chat báo "hôm nay trợ lý đã hết lượt hỏi miễn phí" kèm email của bạn, không lỗi gì cả.
- Muốn đổi model chính thì thêm biến `GEMINI_MODEL`, ví dụ `gemini-3.8-flash` (thông minh hơn nhưng gói Free chỉ khoảng 20 câu một ngày).
- Mỗi người hỏi tối đa 12 câu trong 10 phút và 60 câu một ngày, câu hỏi tối đa 500 ký tự, để một người không dùng hết lượt của cả ngày. Trang web khác không gọi ké được API này.
- Lưu ý: ở gói Free, Google được dùng nội dung câu hỏi để cải thiện sản phẩm của họ. Nội dung portfolio vốn công khai nên không sao, chỉ là đừng đưa thông tin bí mật vào `profile.ts`.
- Mỗi câu hỏi ghi một dòng `[ask] ...` trong **Vercel > Logs** (model và số token) để bạn theo dõi.

## Thống kê người xem (Vercel Analytics)

Trang đã gắn sẵn **Vercel Analytics** (số người vào, trang nào được xem, đến từ đâu: Google, Facebook, GitHub..., quốc gia, thiết bị) và **Speed Insights** (tốc độ tải trang thực tế của người xem). Chỉ chạy khi trang ở trên Vercel, chạy trên máy thì không ghi gì.

Cách bật: vào dự án trên Vercel, mở tab **Analytics** bấm **Enable**, rồi tab **Speed Insights** bấm **Enable**, sau đó deploy lại. Số liệu hiện trong hai tab đó sau vài phút có người vào. Gói Hobby miễn phí đủ dùng cho portfolio. Không dùng cookie nên không cần hiện bảng xin phép cookie.

## SEO và ảnh xem trước khi chia sẻ link

- Mỗi trang có tiêu đề, mô tả, link chuẩn (canonical) riêng; trang chủ có thêm dữ liệu có cấu trúc (schema.org `Person`) để Google hiểu đây là trang cá nhân của bạn. `sitemap.xml` và `robots.txt` tự sinh.
- Ảnh xem trước khi dán link lên Facebook, Discord, Zalo, X... được vẽ tự động từ nội dung trong `profile.ts`: trang chủ (`src/app/opengraph-image.tsx`) có tên, vai trò và ảnh đại diện; mỗi dự án (`src/app/projects/[slug]/opengraph-image.tsx`) có tên dự án, mô tả, công nghệ và ảnh chụp màn hình. Font Montserrat dùng cho ảnh nằm ở `assets/fonts/` (giấy phép OFL).
- Sửa nội dung xong, deploy lại là ảnh đổi theo. Facebook lưu ảnh cũ một thời gian: dán link vào https://developers.facebook.com/tools/debug/ và bấm **Scrape Again** để cập nhật ngay.
- Điểm Lighthouse (đo trên điện thoại giả lập): trang chủ Performance 86, trang dự án và trang CV 99; Accessibility, Best Practices, SEO đều 96 đến 100.

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

Gắn tên miền riêng: **Project Settings > Domains**, sau đó đặt `NEXT_PUBLIC_SITE_URL` là tên miền đó (vd. `https://feb20th.click`) để ảnh chia sẻ link và sitemap dùng đúng địa chỉ.

Sau khi deploy nhớ làm thêm mấy việc ở trên: đặt `RESEND_API_KEY` (mục Form liên hệ), đặt `GEMINI_API_KEY` (mục Trợ lý AI) và bật Analytics (mục Thống kê người xem).

## Cấu trúc

```
src/
├─ app/
│  ├─ layout.tsx            font, metadata (SEO), theme, chọn ngôn ngữ trước khi trang hiện
│  ├─ page.tsx              ghép các mục của trang
│  ├─ globals.css           màu sáng/tối, hiệu ứng, animation
│  ├─ opengraph-image.tsx   ảnh xem trước khi chia sẻ link (mỗi dự án cũng có một file riêng)
│  ├─ api/contact/route.ts  nhận tin nhắn từ form liên hệ và gửi về email qua Resend
│  ├─ api/ask/route.ts      trợ lý AI: gửi câu hỏi tới Gemini, trả lời dần từng đoạn
│  ├─ icon.svg              favicon
│  ├─ sitemap.ts, robots.ts
│  ├─ not-found.tsx         trang 404
│  ├─ projects/[slug]/      trang chi tiết dự án
│  └─ cv/                   trang CV (in ra PDF)
├─ components/
│  ├─ navbar.tsx            menu, đánh dấu mục đang xem, menu mobile
│  ├─ subpage-header.tsx    thanh trên cùng của trang chi tiết dự án và trang CV
│  ├─ project/gallery.tsx   lưới ảnh chụp + xem ảnh lớn
│  ├─ contact/sent-card.tsx thẻ cảm ơn hiện ra sau khi gửi form liên hệ
│  ├─ command-palette.tsx   bảng lệnh Ctrl + K và nút kính lúp trên menu
│  ├─ not-found-parts.tsx   khung terminal và nút tìm nhanh trên trang 404
│  ├─ extras/               nút "Hỏi AI" + khung chat, chế độ Terminal (terminal.tsx, terminal-commands.tsx),
│  │                        easter egg (warp.tsx: hiệu ứng sao và thẻ thành tích, jumpscare.tsx)
│  ├─ cv/print-button.tsx   nút In trên trang CV
│  ├─ sections/             hero, about, skills, services, projects, education, journey, github-activity, contact, footer
│  └─ ui/                   các thành phần nhỏ dùng lại (reveal, thẻ, nút sáng/tối, nút EN/VI, nền hạt hero-particles...)
├─ data/
│  ├─ profile.ts            ★ nội dung về bạn
│  └─ ui.ts                 ★ chữ trên giao diện
└─ lib/                     icon, đa ngôn ngữ (i18n.tsx, use-lang.ts), địa chỉ trang, font cho ảnh chia sẻ (og.ts),
                            giao diện email nhận tin nhắn (contact-email.ts), kiến thức của trợ lý AI (ask-knowledge.ts)
assets/fonts/               font Montserrat dùng để vẽ ảnh xem trước khi chia sẻ link
```
