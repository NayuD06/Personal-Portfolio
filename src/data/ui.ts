import type { Text } from "@/lib/i18n";

// Chữ trên giao diện (menu, tiêu đề mục, nút bấm...) bằng hai ngôn ngữ.
// Nội dung về bạn (giới thiệu, dự án, kỹ năng...) nằm ở src/data/profile.ts

// short: chữ ngắn hơn cho thanh menu dưới đáy trên điện thoại
export const navLinks: { href: string; label: Text; short?: Text }[] = [
  { href: "#home", label: { en: "Home", vi: "Trang chủ" } },
  { href: "#about", label: { en: "About", vi: "Giới thiệu" }, short: { en: "About", vi: "Về mình" } },
  { href: "#skills", label: { en: "Skills", vi: "Kỹ năng" } },
  { href: "#services", label: { en: "Services", vi: "Dịch vụ" } },
  { href: "#projects", label: { en: "Projects", vi: "Dự án" } },
  { href: "#contact", label: { en: "Contact", vi: "Liên hệ" } },
];

export const ui = {
  skipToContent: { en: "Skip to content", vi: "Bỏ qua tới nội dung" },
  nav: {
    cta: { en: "Let's talk", vi: "Trò chuyện" },
    toTop: { en: "Back to top", vi: "Lên đầu trang" },
    lightMode: { en: "Switch to light mode", vi: "Chuyển sang giao diện sáng" },
    darkMode: { en: "Switch to dark mode", vi: "Chuyển sang giao diện tối" },
    language: { en: "Language", vi: "Ngôn ngữ" },
  },
  hero: {
    greeting: { en: "Hello, I'm", vi: "Xin chào, mình là" },
    viewProjects: { en: "View projects", vi: "Xem dự án" },
    contact: { en: "Contact me", vi: "Liên hệ với mình" },
    building: { en: "Currently building", vi: "Đang xây dựng" },
    basedIn: { en: "Based in", vi: "Sống tại" },
    scroll: { en: "Scroll to About", vi: "Cuộn xuống phần Giới thiệu" },
  },
  about: {
    title: { en: "About me", vi: "Về mình" },
    github: { en: "View my GitHub", vi: "Xem GitHub của mình" },
    resume: { en: "Download CV", vi: "Tải CV" },
    contact: { en: "Get in touch", vi: "Liên hệ" },
  },
  skills: {
    title: { en: "Skills & technologies", vi: "Kỹ năng & công nghệ" },
    subtitle: {
      en: "The languages, frameworks and tools I use to build fast, reliable and well-tested applications.",
      vi: "Những ngôn ngữ, framework và công cụ mình dùng để làm ứng dụng nhanh, ổn định và có test đầy đủ.",
    },
    marquee: { en: "Other tools I use", vi: "Các công cụ khác mình dùng" },
  },
  services: {
    title: { en: "What I can build", vi: "Mình có thể làm gì" },
    subtitle: {
      en: "From the first database table to a deployed and monitored product.",
      vi: "Từ bảng dữ liệu đầu tiên cho tới sản phẩm đã triển khai và được giám sát.",
    },
  },
  projects: {
    title: { en: "Projects", vi: "Dự án" },
    subtitle: {
      en: "Things I've built recently, from AI-powered learning platforms to DevOps pipelines. All source code is on GitHub.",
      vi: "Những gì mình làm gần đây, từ nền tảng học tập có AI tới pipeline DevOps. Toàn bộ mã nguồn có trên GitHub.",
    },
    all: { en: "All", vi: "Tất cả" },
    filter: { en: "Filter projects", vi: "Lọc dự án" },
    featured: { en: "Featured", vi: "Nổi bật" },
    more: { en: "More projects", vi: "Dự án khác" },
    code: { en: "Source code", vi: "Mã nguồn" },
    live: { en: "Live demo", vi: "Bản chạy thử" },
    builtWith: { en: "Built with", vi: "Công nghệ" },
  },
  education: {
    title: { en: "Education", vi: "Học vấn" },
    subtitle: {
      en: "I study at two places at once: a university degree for solid fundamentals, and an academy program for hands-on product skills.",
      vi: "Mình đang học song song ở hai nơi: đại học để vững nền tảng, học viện để luyện kỹ năng làm sản phẩm thực tế.",
    },
    subjects: { en: "What I study here", vi: "Mình học gì ở đây" },
    year: { en: "Year", vi: "Năm" },
    website: { en: "School website", vi: "Trang web của trường" },
  },
  github: {
    title: { en: "GitHub activity", vi: "Hoạt động GitHub" },
    subtitle: {
      en: "Numbers pulled from my GitHub profile and refreshed automatically.",
      vi: "Số liệu lấy từ tài khoản GitHub của mình và tự cập nhật.",
    },
    repos: { en: "Public repositories", vi: "Repo công khai" },
    stars: { en: "Stars earned", vi: "Sao nhận được" },
    contributions: { en: "Contributions in 12 months", vi: "Đóng góp trong 12 tháng" },
    languagesUsed: { en: "Languages used", vi: "Ngôn ngữ đã dùng" },
    since: { en: "On GitHub since", vi: "Dùng GitHub từ" },
    graphTitle: { en: "contributions in the last year", vi: "đóng góp trong 12 tháng qua" },
    graphUnavailable: {
      en: "The contribution graph couldn't be loaded right now.",
      vi: "Chưa tải được biểu đồ đóng góp lúc này.",
    },
    less: { en: "Less", vi: "Ít" },
    more: { en: "More", vi: "Nhiều" },
    contributionOne: { en: "contribution on", vi: "đóng góp ngày" },
    contributionMany: { en: "contributions on", vi: "đóng góp ngày" },
    languages: { en: "Top languages", vi: "Ngôn ngữ dùng nhiều" },
    languagesNote: { en: "Share of repositories by main language", vi: "Tỉ lệ repo theo ngôn ngữ chính" },
    recent: { en: "Recently updated", vi: "Cập nhật gần đây" },
    updated: { en: "Updated", vi: "Cập nhật" },
    viewProfile: { en: "View GitHub profile", vi: "Xem trang GitHub" },
    dataNote: { en: "Data from the GitHub API, last refreshed", vi: "Dữ liệu từ GitHub API, làm mới lần cuối" },
  },
  contact: {
    title: { en: "Let's work together", vi: "Cùng làm việc nhé" },
    subtitle: {
      en: "Have a project in mind or an opening on your team? Send a message and I'll get back to you soon.",
      vi: "Bạn có dự án hoặc vị trí đang tuyển? Gửi tin nhắn cho mình, mình sẽ trả lời sớm.",
    },
    emailLabel: { en: "Email", vi: "Email" },
    phoneLabel: { en: "Phone", vi: "Điện thoại" },
    locationLabel: { en: "Location", vi: "Nơi ở" },
    findMe: { en: "Find me online", vi: "Tìm mình trên mạng" },
    formTitle: { en: "Send a message", vi: "Gửi tin nhắn" },
    name: { en: "Name", vi: "Họ tên" },
    email: { en: "Email", vi: "Email" },
    phone: { en: "Phone", vi: "Số điện thoại" },
    company: { en: "Company", vi: "Công ty" },
    message: { en: "Message", vi: "Lời nhắn" },
    optional: { en: "Optional", vi: "Không bắt buộc" },
    namePlaceholder: { en: "Your name", vi: "Nguyễn Văn A" },
    messagePlaceholder: { en: "Tell me a little about your project...", vi: "Kể mình nghe một chút về dự án của bạn..." },
    send: { en: "Send message", vi: "Gửi tin nhắn" },
    sending: { en: "Sending...", vi: "Đang gửi..." },
    sent: { en: "Message sent. I'll reply soon.", vi: "Đã gửi. Mình sẽ trả lời sớm." },
    error: { en: "Couldn't send the message. Please email me directly.", vi: "Chưa gửi được. Bạn gửi email trực tiếp cho mình nhé." },
    mailSubject: { en: "Portfolio contact from", vi: "Liên hệ từ portfolio:" },
  },
  footer: {
    tagline: {
      en: "I'm open to internships, freelance work and side projects.",
      vi: "Mình sẵn sàng cho thực tập, freelance và các dự án phụ.",
    },
    rights: { en: "All rights reserved.", vi: "Đã đăng ký bản quyền." },
    builtWith: { en: "Built with Next.js, deployed on Vercel.", vi: "Làm bằng Next.js, chạy trên Vercel." },
  },
};
