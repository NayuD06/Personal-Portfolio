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
    cv: { en: "Download CV", vi: "Tải CV" },
    building: { en: "Currently building", vi: "Đang xây dựng" },
    basedIn: { en: "Based in", vi: "Sống tại" },
    scroll: { en: "Scroll to About", vi: "Cuộn xuống phần Giới thiệu" },
    // ảnh đại diện lật được (easter egg): nhãn cho trình đọc màn hình, mặt sau là ảnh pixel 8-bit
    photo: { en: "Photo of {name}. Double-click (or press Enter) for a surprise", vi: "Ảnh của {name}. Nhấp đúp (hoặc nhấn Enter) để xem bất ngờ" },
    pixelAlt: { en: "{name} as 8-bit pixel art", vi: "{name} phiên bản pixel 8-bit" },
    pixelBadge: { en: "8-BIT MODE", vi: "CHẾ ĐỘ 8-BIT" },
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
      en: "From the first database table to a polished interface that works on every screen.",
      vi: "Từ bảng dữ liệu đầu tiên cho tới giao diện hoàn chỉnh, chạy tốt trên mọi màn hình.",
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
    details: { en: "View details", vi: "Xem chi tiết" },
  },
  /** Trang chi tiết dự án (/projects/...) */
  project: {
    back: { en: "All projects", vi: "Tất cả dự án" },
    problem: { en: "The problem", vi: "Vấn đề" },
    approach: { en: "How it's built", vi: "Cách làm" },
    features: { en: "Key features", vi: "Tính năng chính" },
    gallery: { en: "Screenshots", vi: "Ảnh chụp màn hình" },
    info: { en: "Project info", vi: "Thông tin dự án" },
    year: { en: "Year", vi: "Năm" },
    type: { en: "Type", vi: "Loại" },
    stack: { en: "Tech stack", vi: "Công nghệ" },
    prev: { en: "Previous project", vi: "Dự án trước" },
    next: { en: "Next project", vi: "Dự án tiếp theo" },
    open: { en: "Enlarge screenshot", vi: "Phóng to ảnh" },
    close: { en: "Close", vi: "Đóng" },
    prevImage: { en: "Previous screenshot", vi: "Ảnh trước" },
    nextImage: { en: "Next screenshot", vi: "Ảnh sau" },
  },
  /** Trang CV (/cv) */
  cv: {
    back: { en: "Back to portfolio", vi: "Về trang chính" },
    download: { en: "Download PDF", vi: "Tải PDF" },
    print: { en: "Print", vi: "In" },
    tip: {
      en: "This CV is generated from the portfolio content. Use Print > Save as PDF to export a fresh copy.",
      vi: "CV này dựng tự động từ nội dung portfolio. Bấm In > Lưu dưới dạng PDF để xuất bản mới.",
    },
    profile: { en: "Profile", vi: "Giới thiệu" },
    contact: { en: "Contact", vi: "Liên hệ" },
    skills: { en: "Skills", vi: "Kỹ năng" },
    education: { en: "Education", vi: "Học vấn" },
    projects: { en: "Projects", vi: "Dự án" },
  },
  journey: {
    title: { en: "My journey", vi: "Hành trình" },
    subtitle: {
      en: "From my first line of code in September 2024 to the products I build today: university, academy and projects, in the order they happened.",
      vi: "Từ dòng code đầu tiên vào tháng 9/2024 tới những sản phẩm mình làm hôm nay: việc học ở đại học, học viện và các dự án, xếp theo thời gian.",
    },
    legend: { en: "What the markers mean", vi: "Ý nghĩa các mốc" },
    university: { en: "UTH", vi: "UTH" },
    academy: { en: "VTC Academy", vi: "VTC Academy" },
    project: { en: "Project", vi: "Dự án" },
    milestone: { en: "Milestone", vi: "Cột mốc" },
    viewProject: { en: "View project", vi: "Xem dự án" },
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
    // Thẻ cảm ơn sau khi gửi thành công. {name}, {time} được thay bằng tên người gửi và giờ gửi.
    sentTitle: { en: "Thanks, {name}!", vi: "Cảm ơn {name} nha!" },
    sentBody: {
      en: "Your message just landed in my inbox. I read every message myself and usually reply within 24 hours.",
      vi: "Tin nhắn của bạn đã bay tới hộp thư của mình. Mình tự đọc từng tin và thường trả lời trong vòng 24 giờ.",
    },
    sentDelivered: { en: "Delivered at {time}", vi: "Đã gửi lúc {time}" },
    sentReplyTo: { en: "I'll reply to", vi: "Mình sẽ trả lời qua" },
    sentAgain: { en: "Send another message", vi: "Gửi tin khác" },
    sentProjects: { en: "Browse my projects", vi: "Xem các dự án" },
    error: { en: "Couldn't send the message. Please email me directly.", vi: "Chưa gửi được. Bạn gửi email trực tiếp cho mình nhé." },
    verifyError: {
      en: "Couldn't confirm you're not a bot. Reload the page and try again, or email me directly.",
      vi: "Chưa xác minh được bạn là người thật. Bạn tải lại trang rồi gửi lại, hoặc email trực tiếp cho mình nhé.",
    },
    mailSubject: { en: "Portfolio contact from", vi: "Liên hệ từ portfolio:" },
  },
  // Bảng lệnh mở bằng Ctrl + K (hoặc ⌘ + K trên Mac)
  palette: {
    open: { en: "Search and quick actions", vi: "Tìm kiếm và thao tác nhanh" },
    placeholder: { en: "Search sections, projects, actions...", vi: "Tìm mục, dự án, thao tác..." },
    groupNavigate: { en: "Go to", vi: "Đi tới" },
    groupProjects: { en: "Projects", vi: "Dự án" },
    groupActions: { en: "Actions", vi: "Thao tác" },
    groupLinks: { en: "Links", vi: "Liên kết" },
    education: { en: "Education", vi: "Học vấn" },
    journey: { en: "My journey", vi: "Hành trình" },
    github: { en: "GitHub activity", vi: "Hoạt động GitHub" },
    switchLang: { en: "Switch to Vietnamese", vi: "Chuyển sang tiếng Anh" },
    viewCv: { en: "Open the one-page CV", vi: "Xem CV một trang" },
    copyEmail: { en: "Copy my email address", vi: "Chép địa chỉ email của mình" },
    copied: { en: "Copied", vi: "Đã chép" },
    writeEmail: { en: "Write me an email", vi: "Viết email cho mình" },
    empty: { en: "Nothing matches", vi: "Không có kết quả cho" },
    emptyHint: { en: "Try “projects”, “CV” or “dark”, or ask the AI below.", vi: "Thử gõ “dự án”, “CV” hoặc “tối”, hoặc hỏi AI ở dưới." },
    move: { en: "move", vi: "di chuyển" },
    run: { en: "open", vi: "mở" },
    close: { en: "close", vi: "đóng" },
  },
  // Chế độ Terminal: cả trang thành cửa sổ dòng lệnh (nút trên menu, Ctrl + K hoặc phím `)
  terminal: {
    open: { en: "Terminal mode", vi: "Chế độ Terminal" },
    openHint: { en: "Browse the portfolio from a command line", vi: "Xem portfolio bằng dòng lệnh" },
    close: { en: "Close terminal", vi: "Đóng terminal" },
    maximize: { en: "Toggle full screen", vi: "Bật/tắt toàn màn hình" },
    welcome: {
      en: "Welcome! This is my portfolio as a command line. Everything on the site is here too.",
      vi: "Chào bạn! Đây là portfolio của mình ở dạng dòng lệnh. Mọi thứ trên trang đều có ở đây.",
    },
    start: { en: "Type a command and press Enter, or tap one below. Start with", vi: "Gõ lệnh rồi nhấn Enter, hoặc bấm một lệnh bên dưới. Bắt đầu với" },
    inputLabel: { en: "Type a command", vi: "Gõ lệnh" },
    placeholder: { en: "tap to type, e.g. help", vi: "chạm để gõ lệnh, vd. help" },
    output: { en: "Terminal output", vi: "Kết quả lệnh" },
    quick: { en: "Quick commands", vi: "Lệnh nhanh" },
    keys: { en: "Tab completes, ↑ ↓ history, Esc closes", vi: "Tab gợi ý, ↑ ↓ lệnh cũ, Esc để thoát" },
  },
  // Trợ lý AI hỏi đáp về bạn (cần ANTHROPIC_API_KEY, xem README)
  ask: {
    launcher: { en: "Ask AI", vi: "Hỏi AI" },
    open: { en: "Ask the AI assistant about me", vi: "Hỏi trợ lý AI về mình" },
    title: { en: "Ask about Duy An", vi: "Hỏi về Duy An" },
    subtitle: { en: "AI assistant for this portfolio", vi: "Trợ lý AI của portfolio" },
    close: { en: "Close chat", vi: "Đóng khung chat" },
    welcome: {
      en: "Hi! I'm An's AI assistant. Ask me about An's projects, skills, studies or how to get in touch.",
      vi: "Chào bạn! Mình là trợ lý AI của An. Bạn cứ hỏi về dự án, kỹ năng, việc học của An hoặc cách liên hệ nhé.",
    },
    suggestions: [
      { en: "What has An built with AI?", vi: "An đã làm gì với AI?" },
      { en: "Does An know React and Next.js?", vi: "An có biết React và Next.js không?" },
      { en: "Is An open to internships?", vi: "An có đang tìm thực tập không?" },
      { en: "What's An's strongest project?", vi: "Dự án nổi bật nhất của An là gì?" },
    ] satisfies Text[],
    placeholder: { en: "Ask a question...", vi: "Nhập câu hỏi..." },
    send: { en: "Send", vi: "Gửi" },
    stop: { en: "Stop", vi: "Dừng" },
    thinking: { en: "Thinking", vi: "Đang nghĩ" },
    you: { en: "You", vi: "Bạn" },
    disclaimer: { en: "AI can make mistakes. For anything important, email", vi: "AI có thể trả lời sai. Việc quan trọng thì bạn email cho" },
    notConfigured: {
      en: "The assistant isn't switched on yet. You can email An directly in the meantime.",
      vi: "Trợ lý chưa được bật. Trong lúc chờ, bạn email trực tiếp cho An nhé.",
    },
    rateLimited: {
      en: "That's a lot of questions in a short time. Please try again in a few minutes.",
      vi: "Bạn hỏi hơi nhiều trong thời gian ngắn rồi. Thử lại sau vài phút nhé.",
    },
    busy: { en: "The assistant is busy right now. Please try again in a moment.", vi: "Trợ lý đang bận. Bạn thử lại sau ít phút nhé." },
    quota: {
      en: "The assistant has used up today's free questions. Please come back tomorrow, or email An:",
      vi: "Hôm nay trợ lý đã hết lượt hỏi miễn phí. Bạn quay lại vào ngày mai hoặc email cho An nhé:",
    },
    error: { en: "Something went wrong while answering. Please try again.", vi: "Có lỗi khi trả lời. Bạn thử lại nhé." },
    verify: {
      en: "Couldn't confirm you're not a bot. Reload the page and ask again (an ad blocker can cause this).",
      vi: "Chưa xác minh được bạn là người thật. Bạn tải lại trang rồi hỏi lại nhé (trình chặn quảng cáo có thể gây ra lỗi này).",
    },
    refusal: { en: "I can't help with that one. Try asking about An's work instead.", vi: "Câu này mình không trả lời được. Bạn thử hỏi về công việc của An nhé." },
    cut: { en: "(answer cut short)", vi: "(câu trả lời bị cắt ngắn)" },
    tooLong: { en: "Keep it under {max} characters.", vi: "Tối đa {max} ký tự thôi nhé." },
    newChat: { en: "New chat", vi: "Cuộc trò chuyện mới" },
  },
  // Easter egg: 8 bí mật. Mã Konami, bấm logo 5 lần (jumpscare), lệnh sudo, gõ "duyan" (mưa code),
  // gọi hire() trong Console của DevTools, lắc chuột hoặc điện thoại (trang rơi rồi lắp lại), lệnh rm -rf /,
  // vào trang từ 0h đến 4h sáng (cú đêm). Cách bật từng cái xem README, phần Easter egg.
  secrets: {
    unlocked: { en: "Secret found", vi: "Tìm thấy bí mật" },
    progress: { en: "{found} of {total} found", vi: "Đã tìm {found}/{total}" },
    allFound: { en: "All secrets found. You're officially a power user!", vi: "Đã tìm hết bí mật. Bạn đúng là dân chơi hệ phím!" },
    dismiss: { en: "Dismiss", vi: "Đóng" },
    konami: {
      title: { en: "Old-school gamer", vi: "Game thủ đời đầu" },
      body: { en: "↑ ↑ ↓ ↓ ← → ← → B A. You still remember the Konami code.", vi: "↑ ↑ ↓ ↓ ← → ← → B A. Bạn vẫn nhớ mã Konami huyền thoại." },
    },
    logo: {
      title: { en: "Curiosity scared the cat", vi: "Tò mò hại thân" },
      body: { en: "Five clicks on the logo. Is your heart still okay?", vi: "Bấm logo tận năm lần. Tim bạn vẫn ổn chứ?" },
      // dòng chữ hiện thoáng qua trong bóng tối ở cuối màn hù
      whisper: { en: "I SEE YOU", vi: "TA THẤY NGƯƠI RỒI" },
    },
    sudo: {
      title: { en: "Root access (not really)", vi: "Quyền root (giả thôi)" },
      body: { en: "sudo in my terminal? Access denied, but nice try.", vi: "Gõ sudo trong terminal của mình? Bị từ chối, nhưng gan đấy." },
    },
    matrix: {
      title: { en: "Into the code", vi: "Lạc vào ma trận" },
      body: { en: "You typed my name and the code started raining.", vi: "Gõ đúng tên mình là mưa code đổ xuống liền." },
    },
    console: {
      title: { en: "Console explorer", vi: "Dân soi Console" },
      body: { en: "You opened DevTools and actually called hire(). I like you already.", vi: "Mở DevTools rồi còn gọi hire() thật. Mình quý bạn rồi đó." },
    },
    shake: {
      title: { en: "Earthquake", vi: "Động đất" },
      body: { en: "You shook so hard the page fell apart. Don't worry, I glued it back.", vi: "Lắc mạnh quá làm trang rơi lả tả luôn. Yên tâm, mình dán lại rồi." },
    },
    rmrf: {
      title: { en: "Destroyer of worlds", vi: "Kẻ hủy diệt" },
      body: { en: "rm -rf / on my portfolio? Bold. Luckily it was all fake.", vi: "Dám rm -rf / cả portfolio của mình? Gan thật. May mà chỉ là giả thôi." },
    },
    nightowl: {
      title: { en: "Night owl", vi: "Cú đêm" },
      body: { en: "Coding this late? Go drink some water =))", vi: "Code khuya vậy, uống nước đi bạn =))" },
    },
    pixel: {
      title: { en: "Retro mode", vi: "Hoài cổ 8-bit" },
      body: { en: "You flipped my photo and found the 8-bit me. Insert coin to continue.", vi: "Lật ảnh ra gặp ngay mình phiên bản 8-bit. Bỏ xu để chơi tiếp nhé." },
    },
    snake: {
      title: { en: "Snake charmer", vi: "Thánh rắn săn mồi" },
      body: { en: "You played Snake inside my terminal. Nokia would be proud.", vi: "Chơi rắn săn mồi ngay trong terminal của mình. Nokia chắc tự hào lắm." },
    },
    hacker: {
      title: { en: "Welcome to the Matrix", vi: "Chào mừng tới Ma Trận" },
      body: {
        en: "The whole site is in hacker mode now. Run matrix again or press Esc to come back.",
        vi: "Cả trang đã sang chế độ hacker. Gõ lại matrix hoặc nhấn Esc để quay về.",
      },
    },
    ceiling: {
      title: { en: "Nothing up here", vi: "Trên này trống trơn" },
      body: {
        en: "You kept scrolling past the top. Nothing up here... except this card.",
        vi: "Bạn cứ kéo quá đầu trang. Trên này chẳng có gì... ngoài tấm thẻ này.",
      },
    },
  },
  // chế độ hacker (lệnh matrix): nhãn nhỏ ở góc dưới bên trái kèm nút thoát
  hacker: {
    badge: { en: "HACKER MODE", vi: "CHẾ ĐỘ HACKER" },
    hint: { en: "Esc to exit", vi: "Esc để thoát" },
    exit: { en: "Exit hacker mode", vi: "Thoát chế độ hacker" },
    on: { en: "Hacker mode on.", vi: "Đã bật chế độ hacker." },
    off: { en: "Hacker mode off.", vi: "Đã tắt chế độ hacker." },
  },
  // kéo quá đầu trang: dòng chữ thò xuống từ mép trên màn hình
  topPeek: {
    first: { en: "There's nothing up here...", vi: "Không có gì ở trên này đâu..." },
    second: { en: "or is there?", vi: "hay có?" },
  },
  // lời chào hiện trong Console của DevTools (F12), kèm hàm hire() mở khóa một bí mật
  devConsole: {
    hello: { en: "Hey, a fellow developer! 👋", vi: "Ồ, đồng nghiệp dev đây rồi! 👋" },
    pitch: { en: "Looking for a developer? Let's talk:", vi: "Đang tìm dev à? Liên hệ mình nhé:" },
    hint: { en: "Psst: type hire() and press Enter.", vi: "Bật mí: gõ hire() rồi Enter thử xem." },
    hired: { en: "Great choice! Here's how to reach me:", vi: "Quyết định sáng suốt! Liên hệ mình ở đây nhé:" },
    done: { en: "Secret unlocked. Check the page 😉", vi: "Đã mở khóa một bí mật, nhìn lên trang đi 😉" },
  },
  // Trang 404 (đường link không tồn tại)
  notFound: {
    title: { en: "This page drifted out of orbit", vi: "Trang này trôi khỏi quỹ đạo rồi" },
    body: {
      en: "The link may be old or mistyped. These pages are still right where they should be:",
      vi: "Có thể đường link đã cũ hoặc bị gõ nhầm. Còn mấy trang này thì vẫn ở nguyên chỗ cũ:",
    },
    error: { en: "error 404: page not found", vi: "lỗi 404: không tìm thấy trang" },
    home: { en: "Back to home", vi: "Về trang chủ" },
    projects: { en: "Browse projects", vi: "Xem dự án" },
    search: { en: "Search", vi: "Tìm nhanh" },
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
