// =============================================================
//  TOÀN BỘ NỘI DUNG CỦA TRANG NẰM Ở FILE NÀY
//  Chữ cần dịch viết dạng { en: "tiếng Anh", vi: "tiếng Việt" }.
//  Chữ trên nút, tiêu đề mục... nằm ở src/data/ui.ts
//  Tên icon (icon: "...") lấy từ danh sách trong src/lib/icons.tsx
// =============================================================

import type { Text } from "@/lib/i18n";
import type { IconName } from "@/lib/icons";

export type Social = { label: string; href: string; icon: IconName };

export type Skill = {
  name: Text;
  icon: IconName;
  description: Text;
  /** Logo nhỏ hiện ở cuối thẻ */
  tools: IconName[];
};

export type Service = {
  title: Text;
  icon: IconName;
  description: Text;
};

export type ProjectCategory = "AI" | "Full-stack" | "Backend" | "DevOps";

export type Project = {
  title: string;
  /** Đường dẫn trang chi tiết: /projects/<slug>. Chỉ dùng chữ thường, số và dấu gạch ngang. */
  slug: string;
  year: string;
  description: Text;
  tags: string[];
  categories: ProjectCategory[];
  /** Dự án nổi bật: hiện to, ảnh bên cạnh chữ */
  featured?: boolean;
  /** Icon lớn trên ảnh bìa tự tạo (khi chưa có ảnh chụp) */
  coverIcon: IconName;
  /** Hai màu gradient cho ảnh bìa tự tạo */
  coverColors: [string, string];
  /** Ảnh chụp màn hình thật, đặt trong public/projects/ */
  image?: string;
  githubUrl?: string;
  liveUrl?: string;

  // ----- Trang chi tiết dự án (/projects/<slug>) -----
  /** Nhãn nhỏ cạnh năm, vd. "Đồ án nhóm 5 người" hay "Đang làm". Bỏ đi để ẩn. */
  context?: Text;
  /** Dự án giải quyết vấn đề gì */
  problem: Text;
  /** Cách mình làm: mỗi phần tử là một ý */
  approach: Text[];
  /** Tính năng chính: mỗi phần tử là một dòng ngắn */
  features: Text[];
  /** Ảnh chụp thêm (bấm vào để phóng to). Đặt trong public/projects/<slug>/ */
  gallery?: { src: string; caption: Text }[];
};

export type Education = {
  school: Text;
  /** Tên viết tắt, hiện trên huy hiệu khi chưa có logo, vd. "UTH" */
  short: string;
  /** Ngành học */
  program: Text;
  period: Text;
  /** Nhãn trạng thái ở góc ảnh, vd. "Năm 3" */
  status: Text;
  location?: Text;
  /** Đoạn giới thiệu bạn học gì, học như thế nào ở trường này */
  description: Text;
  /** Các môn hoặc mảng đang học, hiện thành thẻ nhỏ */
  subjects: Text[];
  /** Năm đang học / tổng số năm, hiện thành thanh tiến độ. Bỏ đi để ẩn. */
  progress?: { current: number; total: number };
  /** Ảnh trường, đặt trong public/education/ rồi ghi vd. "/education/uth.jpg". Để trống thì dùng hình minh họa. */
  image?: string;
  /** Nguồn ảnh, hiện nhỏ ở góc ảnh (ảnh CC BY-SA bắt buộc ghi nguồn) */
  imageCredit?: Text;
  imageCreditUrl?: string;
  /** Logo trường (nên là logo ngang, nền trong suốt), vd. "/education/uth-logo.png". Để trống thì hiện chữ viết tắt. */
  logo?: string;
  /** Kiểu hình minh họa khi chưa có ảnh: "campus" (tòa nhà và đường phố) hoặc "code" (màn hình code) */
  art: "campus" | "code";
  website?: string;
};

/**
 * Một mốc trên dòng thời gian "Hành trình".
 * - university / academy: một học kỳ ở UTH hoặc VTC Academy
 * - project: một dự án, chỉ cần ghi slug, tên và mô tả lấy từ danh sách projects bên dưới
 * - milestone: cột mốc nhỏ (tạo GitHub, lên năm 3...)
 */
export type JourneyItem = {
  /** Năm để gom nhóm (hiện số năm lớn bên trái) */
  year: number;
  /** Thời gian hiện trên mốc, vd. "Học kỳ 1, 2024–2025" hay "03/2025" */
  date: Text;
} & (
  | {
      kind: "university" | "academy" | "milestone";
      title: Text;
      /** Dòng nhỏ dưới tiêu đề, vd. "UTH, học kỳ 1 năm nhất" */
      place?: Text;
      description: Text;
      /** Môn học hoặc công nghệ, hiện thành thẻ nhỏ */
      tags?: Text[];
      /** Link kèm theo, vd. trang web của đồ án */
      link?: { href: string; label: Text };
    }
  | {
      kind: "project";
      /** slug của dự án trong projects */
      project: string;
      /** Ghi chú thêm thay cho mô tả dự án, bỏ đi để dùng mô tả có sẵn */
      note?: Text;
    }
);

export const profile = {
  name: "Duy An",
  /** Chữ viết tắt trên logo */
  initials: "DA",

  /** Các vai trò chạy lần lượt ở đầu trang */
  roles: [
    { en: "Full-stack Developer", vi: "Lập trình viên Full-stack" },
    { en: "Backend Engineer", vi: "Kỹ sư Backend" },
    { en: "Mobile Developer", vi: "Lập trình viên Mobile" },
  ] satisfies Text[],

  /** Dòng trạng thái nhỏ phía trên tên. Để chuỗi rỗng "" để ẩn. */
  availability: {
    en: "Open to internships and freelance projects",
    vi: "Đang tìm cơ hội thực tập và dự án freelance",
  } as Text,

  intro: {
    en: "I build full-stack web apps with React, Next.js, NestJS and Laravel, and I love vibe coding with Claude to go from an idea to a working product fast.",
    vi: "Mình làm ứng dụng web full-stack với React, Next.js, NestJS và Laravel, và rất thích vibe coding cùng Claude để đi nhanh từ ý tưởng tới sản phẩm chạy được.",
  } as Text,

  /** Đang làm gì: hiện trên thẻ nhỏ cạnh ảnh đại diện */
  currentlyBuilding: "EduForge AI",

  /**
   * Ảnh đại diện (vuông), đặt trong public. Để trống "" sẽ hiện chữ viết tắt.
   * Thay ảnh thì đặt tên file mới (vd. avatar-v3.jpg): Next.js và Vercel giữ bản ảnh đã thu nhỏ theo tên file, trùng tên sẽ còn hiện ảnh cũ.
   */
  avatar: "/avatar-v2.jpg",
  /** Ảnh dọc ở phần About (tỉ lệ 4:5). Để trống "" sẽ dùng khung code thay ảnh. */
  aboutPhoto: "/about-v2.jpg",
  /**
   * File CV cho nút "Tải CV" (đầu trang và mục Về mình), mỗi ngôn ngữ một file trong public/cv/.
   * Hai file hiện có được xuất từ trang /cv (dựng tự động từ nội dung file này).
   * Muốn dùng CV của riêng bạn: chép file PDF vào public/cv/ rồi sửa đường dẫn,
   * chỉ có một file thì ghi một chuỗi, vd. "/cv/Duy-An-CV.pdf". Để trống "" để ẩn nút.
   */
  resumeUrl: { en: "/cv/Duy-An-CV-EN.pdf", vi: "/cv/Duy-An-CV-VI.pdf" } as Text,
  /** Tên miền của trang, hiện trên CV */
  website: "feb20th.click",

  location: { en: "Vietnam", vi: "Việt Nam" } as Text,
  /** Email liên hệ. Nếu đổi thì sửa luôn link "mailto:" trong socials bên dưới */
  email: "nayud.2006@gmail.com",
  /** Để trống để ẩn */
  phone: "",

  about: [
    {
      en: "I'm a third-year IT student at UTH and a software developer from Vietnam who enjoys building complete products: designing the database, writing the API and shipping a clean, responsive interface on top. Most of my recent work lives in TypeScript monorepos with NestJS or Express on the backend and React or Next.js on the frontend.",
      vi: "Mình là sinh viên năm 3 ngành Công nghệ thông tin tại UTH, một lập trình viên đến từ Việt Nam, thích làm một sản phẩm trọn vẹn: thiết kế cơ sở dữ liệu, viết API rồi dựng giao diện gọn gàng, chạy tốt trên mọi màn hình. Phần lớn dự án gần đây của mình là monorepo TypeScript, backend dùng NestJS hoặc Express, frontend dùng React hoặc Next.js.",
    },
    {
      en: "I'm a big fan of vibe coding: I work with Claude and Claude Code to turn ideas into working prototypes quickly, then read through, test and refine the code myself so I understand every part of it. I've also built AI features into my own projects, like generating quizzes from PDFs with the Claude API and semantic search with pgvector.",
      vi: "Mình rất mê vibe coding: làm việc cùng Claude và Claude Code để biến ý tưởng thành bản chạy thử thật nhanh, rồi tự đọc lại, test và chỉnh sửa để hiểu rõ từng phần code. Mình cũng đưa AI vào chính các dự án của mình, như tạo câu hỏi từ PDF bằng Claude API và tìm kiếm ngữ nghĩa với pgvector.",
    },
  ] satisfies Text[],

  /** Học vấn: mục "Học vấn" riêng, mỗi trường một hàng (trường đầu tiên ảnh nằm bên trái) */
  education: [
    {
      school: {
        en: "Ho Chi Minh City University of Transport",
        vi: "Trường Đại học Giao thông vận tải TP.HCM",
      },
      short: "UTH",
      program: { en: "Information Technology", vi: "Ngành Công nghệ thông tin" },
      period: { en: "2024 – now", vi: "2024 – nay" },
      status: { en: "Year 3", vi: "Năm 3" },
      location: { en: "Ho Chi Minh City", vi: "TP. Hồ Chí Minh" },
      description: {
        en: "I'm a third-year Information Technology student at UTH. University is where I learn the fundamentals behind everything I build: how to think in algorithms, design a database properly and structure software so it stays maintainable as it grows.",
        vi: "Mình là sinh viên năm 3 ngành Công nghệ thông tin tại UTH. Ở trường mình học phần nền tảng đứng sau mọi thứ mình làm: tư duy thuật toán, thiết kế cơ sở dữ liệu cho đúng và tổ chức phần mềm sao cho dễ bảo trì khi dự án lớn dần.",
      },
      // Lấy từ bảng điểm, chỉ giữ môn chuyên ngành
      subjects: [
        { en: "Programming techniques", vi: "Kỹ thuật lập trình" },
        { en: "Object-oriented programming", vi: "Lập trình hướng đối tượng" },
        { en: "Data structures & algorithms", vi: "Cấu trúc dữ liệu & giải thuật" },
        { en: "Database design", vi: "Thiết kế cơ sở dữ liệu" },
        { en: "Software engineering", vi: "Công nghệ phần mềm" },
        { en: "Operating systems", vi: "Hệ điều hành" },
        { en: "Network programming", vi: "Lập trình mạng" },
        { en: "Java programming", vi: "Lập trình Java" },
      ],
      progress: { current: 3, total: 4 },
      // Ảnh: Wikimedia Commons, giấy phép CC BY-SA 4.0 (phải giữ dòng ghi nguồn)
      image: "/education/uth.jpg",
      imageCredit: { en: "Photo: UTH, CC BY-SA 4.0", vi: "Ảnh: UTH, CC BY-SA 4.0" },
      imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Hinh_UTH.jpg",
      logo: "/education/uth-logo.png",
      art: "campus",
      website: "https://ut.edu.vn",
    },
    {
      school: { en: "VTC Academy", vi: "Học viện VTC Academy" },
      short: "VTC",
      program: { en: "Full-Stack Development", vi: "Lập trình Full-Stack" },
      period: { en: "2024 – now, alongside university", vi: "2024 – nay, song song với đại học" },
      status: { en: "Final semester", vi: "Học kỳ cuối" },
      description: {
        en: "Alongside my degree, I'm taking VTC Academy's Full-Stack Development program: 720 hours over four semesters, from programming fundamentals to web apps, full-stack and mobile, ending with a capstone project. Every semester closes with a project, so most of my time goes into building real things.",
        vi: "Song song với đại học, mình học chương trình Lập trình Full-Stack của VTC Academy: 720 giờ trong 4 học kỳ, đi từ nền tảng lập trình tới web, full-stack và di động, cuối cùng là đồ án tốt nghiệp. Học kỳ nào cũng kết thúc bằng một dự án, nên phần lớn thời gian mình dành để làm sản phẩm thật.",
      },
      // Lấy từ chương trình học của VTC Academy
      subjects: [
        { en: "HTML, CSS & JavaScript", vi: "HTML, CSS & JavaScript" },
        { en: "PHP & MySQL web apps", vi: "Web với PHP & MySQL" },
        { en: "Node.js programming", vi: "Lập trình Node.js" },
        { en: "Back-end & front-end frameworks", vi: "Framework back-end & front-end" },
        { en: "NoSQL databases", vi: "Cơ sở dữ liệu NoSQL" },
        { en: "Cross-platform mobile apps", vi: "Ứng dụng di động đa nền tảng" },
        { en: "Back-end with Go", vi: "Back-end với Go" },
        { en: "Intro to DevOps", vi: "Nhập môn DevOps" },
      ],
      // Ảnh và logo lấy từ trang chính thức vtc.edu.vn
      image: "/education/vtc.jpg",
      imageCredit: { en: "Photo: VTC Academy", vi: "Ảnh: VTC Academy" },
      imageCreditUrl: "https://vtc.edu.vn/ve-vtc-academy/",
      logo: "/education/vtc-logo.png",
      art: "code",
      website: "https://vtc.edu.vn",
    },
  ] satisfies Education[],

  // Dòng thời gian "Hành trình", xếp từ cũ tới mới. Học kỳ UTH lấy từ bảng điểm (chỉ giữ môn chuyên ngành,
  // không ghi điểm GPA). VTC bắt đầu 9/2024 cùng lúc với đại học; thời gian học kỳ 2 và 3 của VTC
  // ước theo ngày tạo repo GitHub, sửa lại nếu lệch.
  journey: [
    {
      year: 2024,
      date: { en: "Semester 1, 2024–25", vi: "Học kỳ 1, 2024–2025" },
      kind: "university",
      title: { en: "Started Information Technology at UTH", vi: "Vào ngành Công nghệ thông tin ở UTH" },
      place: { en: "UTH, first semester", vi: "UTH, học kỳ 1 năm nhất" },
      description: {
        en: "Where I wrote my first real code. Programming Techniques taught me variables, loops and functions, and above all how to break a problem into small steps.",
        vi: "Nơi mình viết những dòng code đầu tiên. Môn Kỹ thuật lập trình dạy mình biến, vòng lặp, hàm, và quan trọng nhất là cách chia một bài toán thành từng bước nhỏ.",
      },
      tags: [
        { en: "Programming techniques", vi: "Kỹ thuật lập trình" },
        { en: "Introduction to IT", vi: "Nhập môn ngành CNTT" },
        { en: "Probability & statistics", vi: "Xác suất thống kê" },
      ],
    },
    {
      year: 2024,
      date: { en: "Sep 2024", vi: "09/2024" },
      kind: "academy",
      title: { en: "And VTC Academy's Full-Stack program, the same month", vi: "Cùng lúc vào chương trình Full-Stack của VTC Academy" },
      place: { en: "VTC Academy, semester 1: Programming Fundamentals", vi: "VTC Academy, học kỳ 1: Programming Fundamentals" },
      description: {
        en: "From day one I studied in two places. VTC took the same foundations from a hands-on angle: a programming language, data structures, OOP and relational databases, finishing with Project 1.",
        vi: "Ngay từ đầu mình học song song hai nơi. VTC đi phần nền tảng theo hướng thực hành: ngôn ngữ lập trình, cấu trúc dữ liệu, hướng đối tượng và cơ sở dữ liệu quan hệ, cuối kỳ làm Project 1.",
      },
      tags: [
        { en: "Programming basics", vi: "Lập trình cơ bản" },
        { en: "Data structures & algorithms", vi: "Cấu trúc dữ liệu & giải thuật" },
        { en: "OOP", vi: "Hướng đối tượng" },
        { en: "Working with RDBMS", vi: "Làm việc với RDBMS" },
        { en: "OO analysis & design", vi: "Phân tích thiết kế hướng đối tượng" },
      ],
    },
    {
      year: 2025,
      date: { en: "Semester 2, 2024–25", vi: "Học kỳ 2, 2024–2025" },
      kind: "university",
      title: { en: "Objects, databases and how computers work", vi: "Hướng đối tượng, cơ sở dữ liệu và máy tính chạy ra sao" },
      place: { en: "UTH, second semester", vi: "UTH, học kỳ 2 năm nhất" },
      description: {
        en: "Organising code into classes and objects, designing tables and writing SQL, plus the groundwork of networks, computer architecture and discrete maths.",
        vi: "Tổ chức code thành lớp và đối tượng, thiết kế bảng và viết SQL, cùng phần nền về mạng, kiến trúc máy tính và toán rời rạc.",
      },
      tags: [
        { en: "Object-oriented programming", vi: "Lập trình hướng đối tượng" },
        { en: "Databases", vi: "Cơ sở dữ liệu" },
        { en: "Computer networks", vi: "Mạng máy tính" },
        { en: "Computer architecture", vi: "Kiến trúc máy tính" },
        { en: "Discrete structures", vi: "Cấu trúc rời rạc" },
      ],
    },
    {
      year: 2025,
      date: { en: "Mar 2025", vi: "03/2025" },
      kind: "milestone",
      title: { en: "Opened my GitHub account", vi: "Tạo tài khoản GitHub" },
      description: {
        en: "Pushed my first repository and started keeping every exercise and project in Git.",
        vi: "Đẩy repo đầu tiên lên và bắt đầu lưu mọi bài tập, dự án bằng Git.",
      },
    },
    {
      year: 2025,
      date: { en: "Late 2025", vi: "Cuối 2025" },
      kind: "academy",
      title: { en: "Building for the web", vi: "Bắt đầu làm web" },
      place: { en: "VTC Academy, semester 2: Web Apps Development", vi: "VTC Academy, học kỳ 2: Web Apps Development" },
      description: {
        en: "HTML, CSS and JavaScript, UI/UX for developers, web apps with PHP and MySQL, testing and deployment. This is when I built my first Laravel apps, like a library management system.",
        vi: "HTML, CSS, JavaScript, UI/UX cho lập trình viên, làm web bằng PHP và MySQL, kiểm thử và triển khai. Đây là lúc mình làm những app Laravel đầu tiên, như hệ thống quản lý thư viện.",
      },
      tags: [
        { en: "HTML, CSS & JavaScript", vi: "HTML, CSS & JavaScript" },
        { en: "UI/UX design", vi: "Thiết kế UI/UX" },
        { en: "PHP & MySQL", vi: "PHP & MySQL" },
        { en: "Laravel", vi: "Laravel" },
        { en: "Software testing", vi: "Kiểm thử phần mềm" },
      ],
    },
    {
      year: 2025,
      date: { en: "Semester 1, 2025–26", vi: "Học kỳ 1, 2025–2026" },
      kind: "university",
      title: { en: "Data structures and software engineering", vi: "Cấu trúc dữ liệu và công nghệ phần mềm" },
      place: { en: "UTH, year two", vi: "UTH, năm hai" },
      description: {
        en: "The core of computer science: data structures and algorithms, operating systems, system analysis and design, and database design.",
        vi: "Phần lõi của ngành: cấu trúc dữ liệu và giải thuật, hệ điều hành, phân tích thiết kế hệ thống và thiết kế cơ sở dữ liệu.",
      },
      tags: [
        { en: "Data structures & algorithms", vi: "Cấu trúc dữ liệu & giải thuật" },
        { en: "Software engineering", vi: "Công nghệ phần mềm" },
        { en: "Operating systems", vi: "Hệ điều hành" },
        { en: "System analysis & design", vi: "Phân tích thiết kế hệ thống" },
        { en: "Database design", vi: "Thiết kế cơ sở dữ liệu" },
      ],
    },
    {
      year: 2026,
      date: { en: "2026", vi: "2026" },
      kind: "academy",
      title: { en: "Going full-stack", vi: "Lên full-stack" },
      place: { en: "VTC Academy, semester 3: Full-Stack Development", vi: "VTC Academy, học kỳ 3: Full-Stack Development" },
      description: {
        en: "Node.js and Express back ends, front-end frameworks, NoSQL, software architecture and microservices, cross-platform mobile apps, Go and an intro to DevOps. Each module ended as a repo on my GitHub.",
        vi: "Back-end với Node.js và Express, framework front-end, NoSQL, kiến trúc phần mềm và microservice, app di động đa nền tảng, Go và nhập môn DevOps. Mỗi phần học đều thành một repo trên GitHub của mình.",
      },
      tags: [
        { en: "Node.js", vi: "Node.js" },
        { en: "Express", vi: "Express" },
        { en: "NoSQL", vi: "NoSQL" },
        { en: "Software architecture", vi: "Kiến trúc phần mềm" },
        { en: "Mobile & Flutter", vi: "Di động & Flutter" },
        { en: "Go", vi: "Go" },
      ],
    },
    {
      year: 2026,
      date: { en: "Semester 2, 2025–26", vi: "Học kỳ 2, 2025–2026" },
      kind: "university",
      title: { en: "Networks, algorithms and security", vi: "Mạng, giải thuật và bảo mật" },
      place: { en: "UTH, year two", vi: "UTH, năm hai" },
      description: {
        en: "Programs that talk over a network, analysing and designing algorithms, and the security principles I now use whenever I build sign-in for a project.",
        vi: "Viết chương trình giao tiếp qua mạng, phân tích và thiết kế giải thuật, cùng các nguyên tắc an toàn thông tin mình dùng lại mỗi khi làm phần đăng nhập cho dự án.",
      },
      tags: [
        { en: "Network programming", vi: "Lập trình mạng" },
        { en: "Algorithm analysis & design", vi: "Phân tích thiết kế giải thuật" },
        { en: "Information security", vi: "An toàn thông tin" },
        { en: "IT business management", vi: "Quản trị doanh nghiệp CNTT" },
      ],
    },
    { year: 2026, date: { en: "Mar 2026", vi: "03/2026" }, kind: "project", project: "auth-microservice" },
    {
      year: 2026,
      date: { en: "Summer term 2026", vi: "Học kỳ hè 2026" },
      kind: "university",
      title: { en: "Java and database systems", vi: "Java và hệ quản trị cơ sở dữ liệu" },
      place: { en: "UTH, summer term", vi: "UTH, học kỳ hè" },
      description: {
        en: "I took an extra summer term to move faster: Java programming and database management systems.",
        vi: "Mình học thêm học kỳ hè để đi nhanh hơn: lập trình Java và hệ quản trị cơ sở dữ liệu.",
      },
      tags: [
        { en: "Java programming", vi: "Lập trình Java" },
        { en: "Database management systems", vi: "Hệ quản trị cơ sở dữ liệu" },
      ],
    },
    { year: 2026, date: { en: "Jul 2026", vi: "07/2026" }, kind: "project", project: "spendwise" },
    {
      year: 2026,
      date: { en: "Semester 1, 2026–27", vi: "Học kỳ 1, 2026–2027" },
      kind: "milestone",
      title: { en: "Year three: building complete products", vi: "Năm ba: tự làm sản phẩm hoàn chỉnh" },
      description: {
        en: "From here the focus shifts from exercises to full products, with AI, tests and deployment built in.",
        vi: "Từ đây mình chuyển từ làm bài tập sang làm sản phẩm hoàn chỉnh, có AI, có test và đưa lên chạy thật.",
      },
    },
    {
      year: 2026,
      date: { en: "2026", vi: "2026" },
      kind: "academy",
      title: { en: "Capstone: Nexora Travel", vi: "Đồ án tốt nghiệp: Nexora Travel" },
      place: { en: "VTC Academy, semester 4: team capstone project", vi: "VTC Academy, học kỳ 4: đồ án tốt nghiệp làm nhóm" },
      description: {
        en: "With my team I built Nexora, a booking site for small-group tours around Vietnam: tours by destination, booking priced per traveller, custom trip requests, accounts with saved tours, a travel blog and reviews, in light and dark mode.",
        vi: "Cùng nhóm, mình làm Nexora, trang đặt tour du lịch nhóm nhỏ khắp Việt Nam: xem tour theo điểm đến, đặt tour tính giá theo số khách, gửi yêu cầu thiết kế chuyến đi riêng, tài khoản lưu tour yêu thích, blog du lịch và đánh giá, có giao diện sáng và tối.",
      },
      tags: [
        { en: "Tour booking", vi: "Đặt tour" },
        { en: "User accounts", vi: "Tài khoản người dùng" },
        { en: "Blog & reviews", vi: "Blog & đánh giá" },
        { en: "Cloudinary", vi: "Cloudinary" },
      ],
      link: { href: "https://www.nexora-travel.agency/", label: { en: "Visit nexora-travel.agency", vi: "Xem nexora-travel.agency" } },
    },
    { year: 2026, date: { en: "Oct 2026", vi: "10/2026" }, kind: "project", project: "studymind-ai" },
    { year: 2026, date: { en: "Oct 2026", vi: "10/2026" }, kind: "project", project: "digital-map-pathfinding" },
    { year: 2026, date: { en: "Oct 2026", vi: "10/2026" }, kind: "project", project: "online-elearning" },
    { year: 2026, date: { en: "Nov 2026", vi: "11/2026" }, kind: "project", project: "eduforge-ai" },
    {
      year: 2026,
      date: { en: "Nov 2026", vi: "11/2026" },
      kind: "milestone",
      title: { en: "Launched this portfolio", vi: "Ra mắt portfolio này" },
      description: {
        en: "Everything above in one place, at feb20th.click. The next chapter is still being written.",
        vi: "Gom tất cả những điều trên về một chỗ, tại feb20th.click. Chương tiếp theo vẫn đang viết.",
      },
    },
  ] satisfies JourneyItem[],

  stats: [
    {
      value: "35+",
      label: { en: "GitHub repositories", vi: "Repo trên GitHub" },
    },
    {
      value: "20+",
      label: { en: "Technologies used", vi: "Công nghệ đã dùng" },
    },
    { value: "6", label: { en: "Featured projects", vi: "Dự án tiêu biểu" } },
  ] satisfies { value: string; label: Text }[],

  // Discord: link mẫu, cần thay. Cách lấy: bật Developer Mode (Cài đặt người dùng > Nâng cao),
  // bấm chuột phải vào tên mình > Sao chép ID người dùng, rồi ghi "https://discord.com/users/<ID vừa chép>".
  // Khi còn để link mẫu (có chữ YOUR_), nút Discord sẽ tự ẩn.
  socials: (
    [
      { label: "GitHub", href: "https://github.com/NayuD06", icon: "github" },
      {
        label: "Facebook",
        href: "https://www.facebook.com/duy.an.877138",
        icon: "facebook",
      },
      {
        label: "Discord",
        href: "https://discord.com/users/YOUR_DISCORD_USER_ID",
        icon: "discord",
      },
      { label: "Email", href: "mailto:nayud.2006@gmail.com", icon: "email" },
    ] satisfies Social[]
  ).filter((social) => !social.href.includes("YOUR_")),

  skills: [
    {
      name: "TypeScript & JavaScript",
      icon: "typescript",
      description: {
        en: "My main languages on both sides of the stack, with strict types shared across monorepo apps.",
        vi: "Ngôn ngữ chính của mình ở cả frontend lẫn backend, kiểu dữ liệu chặt chẽ dùng chung giữa các app trong monorepo.",
      },
      tools: ["typescript", "javascript", "turborepo"],
    },
    {
      name: "React & Next.js",
      icon: "react",
      description: {
        en: "Component-based interfaces with Vite and the Next.js App Router, styled with Tailwind CSS.",
        vi: "Giao diện chia component với Vite và Next.js App Router, làm đẹp bằng Tailwind CSS.",
      },
      tools: ["react", "nextjs", "tailwind", "vite"],
    },
    {
      name: "Node.js, NestJS & Express",
      icon: "nestjs",
      description: {
        en: "REST APIs with JWT auth, real-time events via Socket.IO and background jobs with BullMQ.",
        vi: "REST API có xác thực JWT, sự kiện thời gian thực qua Socket.IO và xử lý nền với BullMQ.",
      },
      tools: ["nodejs", "nestjs", "express", "socketio"],
    },
    {
      name: { en: "Databases", vi: "Cơ sở dữ liệu" },
      icon: "postgresql",
      description: {
        en: "Relational and NoSQL data modeling with Prisma and Mongoose, plus Redis for caching and queues.",
        vi: "Thiết kế dữ liệu quan hệ và NoSQL với Prisma, Mongoose, dùng Redis cho cache và hàng đợi.",
      },
      tools: ["postgresql", "mysql", "mongodb", "redis", "prisma"],
    },
    {
      name: "PHP & Laravel",
      icon: "laravel",
      description: {
        en: "Server-side apps with Laravel and Inertia + React, from course platforms to booking systems.",
        vi: "Ứng dụng phía server với Laravel và Inertia + React, từ nền tảng khóa học đến hệ thống đặt chỗ.",
      },
      tools: ["php", "laravel", "mysql"],
    },
    {
      name: "Mobile: Expo & Flutter",
      icon: "expo",
      description: {
        en: "Cross-platform mobile apps with Expo and React Native, and Flutter with Dart.",
        vi: "Ứng dụng di động đa nền tảng với Expo, React Native và Flutter.",
      },
      tools: ["expo", "react", "flutter"],
    },
    {
      name: "Docker & CI/CD",
      icon: "docker",
      description: {
        en: "Docker Compose environments, GitHub Actions pipelines, Prometheus monitoring and Vercel deploys.",
        vi: "Môi trường Docker Compose, pipeline GitHub Actions, giám sát bằng Prometheus và deploy lên Vercel.",
      },
      tools: ["docker", "githubactions", "prometheus", "vercel"],
    },
    {
      name: { en: "Vibe coding with Claude", vi: "Vibe coding cùng Claude" },
      icon: "claude",
      description: {
        en: "I pair with Claude and Claude Code to plan features, scaffold code and track down bugs faster, then read, test and refine every change myself.",
        vi: "Mình dùng Claude và Claude Code để lên ý tưởng tính năng, dựng khung code và tìm lỗi nhanh hơn, rồi tự đọc lại, test và chỉnh sửa từng thay đổi.",
      },
      tools: ["claude", "claudecode", "anthropic"],
    },
  ] satisfies Skill[],

  /** Logo chạy ngang bên dưới phần kỹ năng */
  techMarquee: [
    "typescript",
    "javascript",
    "react",
    "nextjs",
    "tailwind",
    "vite",
    "nodejs",
    "express",
    "nestjs",
    "php",
    "laravel",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "prisma",
    "docker",
    "githubactions",
    "prometheus",
    "socketio",
    "expo",
    "flutter",
    "go",
    "dotnet",
    "java",
    "cplusplus",
    "git",
    "postman",
    "vercel",
    "ollama",
    "turborepo",
    "jest",
  ] satisfies IconName[],

  services: [
    {
      title: { en: "Full-stack web apps", vi: "Ứng dụng web full-stack" },
      icon: "code",
      description: {
        en: "End-to-end products with React or Next.js on the front and Node.js on the back, built on a clean structure that is easy to grow.",
        vi: "Sản phẩm trọn vẹn với React hoặc Next.js ở frontend và Node.js ở backend, cấu trúc rõ ràng, dễ mở rộng.",
      },
    },
    {
      title: { en: "Frontend & UI", vi: "Frontend & giao diện" },
      icon: "layout",
      description: {
        en: "Fast, responsive and animated interfaces with React, Next.js and Tailwind CSS that work well on every screen.",
        vi: "Giao diện nhanh, đẹp, có hiệu ứng với React, Next.js và Tailwind CSS, hiển thị tốt trên mọi màn hình.",
      },
    },
    {
      title: { en: "Backend & APIs", vi: "Backend & API" },
      icon: "server",
      description: {
        en: "Secure REST APIs with NestJS, Express or Laravel, documented with Swagger and covered by automated tests.",
        vi: "REST API an toàn với NestJS, Express hoặc Laravel, có tài liệu Swagger và test tự động.",
      },
    },
    {
      title: { en: "Database design", vi: "Thiết kế cơ sở dữ liệu" },
      icon: "database",
      description: {
        en: "Well-structured schemas in PostgreSQL, MySQL or MongoDB with Prisma migrations and efficient queries.",
        vi: "Lược đồ dữ liệu chặt chẽ trên PostgreSQL, MySQL hoặc MongoDB, migration bằng Prisma và truy vấn hiệu quả.",
      },
    },
    {
      title: { en: "Authentication & security", vi: "Xác thực & bảo mật" },
      icon: "shield",
      description: {
        en: "Login systems with JWT, Google sign-in, role-based access control and safely hashed passwords.",
        vi: "Đăng nhập bằng JWT, Google, phân quyền theo vai trò và mã hóa mật khẩu an toàn.",
      },
    },
    {
      title: { en: "Mobile apps", vi: "Ứng dụng di động" },
      icon: "smartphone",
      description: {
        en: "Cross-platform apps with Expo and React Native that share types and API clients with the web.",
        vi: "Ứng dụng đa nền tảng với Expo, React Native, dùng chung kiểu dữ liệu và API client với bản web.",
      },
    },
  ] satisfies Service[],

  projects: [
    {
      title: "StudyMind AI",
      slug: "studymind-ai",
      year: "2026",
      description: {
        en: "Study material sharing platform with semantic search and AI Q&A over PDFs, an in-browser PDF reader, ratings, a moderation dashboard and 55 automated API tests running in CI.",
        vi: "Nền tảng chia sẻ tài liệu học tập có tìm kiếm ngữ nghĩa và hỏi đáp AI trên PDF, đọc PDF ngay trên web, chấm điểm, trang kiểm duyệt và 55 test API tự động chạy trên CI.",
      },
      tags: ["React", "Express", "Prisma", "MySQL", "FastAPI", "Qdrant"],
      categories: ["AI", "Full-stack", "DevOps"],
      featured: true,
      coverIcon: "brain",
      coverColors: ["#0369a1", "#2563eb"],
      image: "/projects/studymind.jpg",
      githubUrl: "https://github.com/NayuD06/StudyMind-AI",
      problem: {
        en: "Students share notes and past papers across scattered chat groups and drives, so good material is hard to find, quality is uneven, and finding the right page in a long PDF takes ages.",
        vi: "Sinh viên chia sẻ tài liệu, đề cũ rải rác trong các nhóm chat và ổ đĩa, nên tài liệu tốt khó tìm, chất lượng không đồng đều, và tìm đúng trang cần trong một file PDF dài rất mất thời gian.",
      },
      approach: [
        {
          en: "Split the system into four parts: a student site and a separate admin site (React, Vite, TypeScript, Tailwind), a REST API with Express and Prisma on MySQL, and a Python FastAPI service that reads PDFs, creates embeddings and answers questions with RAG over Qdrant.",
          vi: "Chia hệ thống thành bốn phần: trang sinh viên và trang quản trị riêng (React, Vite, TypeScript, Tailwind), REST API bằng Express và Prisma trên MySQL, và một dịch vụ Python FastAPI đọc PDF, tạo embedding và trả lời câu hỏi bằng RAG trên Qdrant.",
        },
        {
          en: "Built a moderation flow: new uploads wait for admin approval, PDFs are checked by their content rather than the file extension, and the first 30 pages are scanned for emails and phone numbers to warn about personal data.",
          vi: "Làm quy trình kiểm duyệt: tài liệu mới chờ quản trị viên duyệt, file PDF được kiểm tra theo nội dung thật chứ không tin phần đuôi, 30 trang đầu được quét email và số điện thoại để cảnh báo lộ thông tin cá nhân.",
        },
        {
          en: "Hardened sign-in: short-lived access tokens kept in memory, rotating httpOnly refresh cookies that end every session if one is reused, and rate limits on login, sign-up, uploads and comments.",
          vi: "Siết chặt đăng nhập: access token sống ngắn chỉ nằm trong bộ nhớ, refresh token trong cookie httpOnly được đổi mới mỗi lần dùng và hủy mọi phiên nếu bị dùng lại, giới hạn tần suất cho đăng nhập, đăng ký, tải lên và bình luận.",
        },
        {
          en: "Wrote 55 API tests that run against a separate test database, with GitHub Actions running them on every push and packaging Docker builds for release.",
          vi: "Viết 55 test API chạy trên database riêng cho test, GitHub Actions chạy bộ test ở mỗi lần push và đóng gói bản phát hành bằng Docker.",
        },
      ],
      features: [
        {
          en: "Library search with filters by subject, school, major and rating",
          vi: "Thư viện tìm kiếm, lọc theo môn, trường, ngành và điểm đánh giá",
        },
        { en: "In-browser PDF reader with zoom and page navigation", vi: "Đọc PDF ngay trên trang, chuyển trang và phóng to" },
        {
          en: "Ratings, saved documents, downloads, comments and abuse reports",
          vi: "Chấm sao, lưu tài liệu, tải xuống, bình luận và báo cáo vi phạm",
        },
        {
          en: "AI Q&A, summaries and semantic search over documents",
          vi: "Hỏi đáp, tóm tắt và tìm kiếm ngữ nghĩa trên tài liệu bằng AI",
        },
        {
          en: "Admin dashboard with charts, a moderation queue, user management and an audit log",
          vi: "Trang quản trị có biểu đồ, hàng chờ kiểm duyệt, quản lý người dùng và nhật ký thao tác",
        },
        {
          en: "Notifications, password reset by email, light/dark theme and Vietnamese/English",
          vi: "Chuông thông báo, đặt lại mật khẩu qua email, giao diện sáng/tối và tiếng Việt/tiếng Anh",
        },
      ],
    },
    {
      title: "SpendWise Money Manager",
      slug: "spendwise",
      year: "2026",
      description: {
        en: "Personal finance tracker with JWT auth, category reports and Excel support, Jest and Supertest coverage, Prometheus metrics with alert rules and a GitHub Actions release pipeline.",
        vi: "Ứng dụng quản lý thu chi cá nhân có xác thực JWT, báo cáo theo danh mục, hỗ trợ Excel, test bằng Jest và Supertest, đo lường bằng Prometheus kèm cảnh báo và pipeline phát hành GitHub Actions.",
      },
      tags: [
        "React",
        "Express",
        "MongoDB",
        "Docker",
        "Prometheus",
        "GitHub Actions",
      ],
      categories: ["Full-stack", "DevOps"],
      featured: true,
      coverIcon: "wallet",
      coverColors: ["#1e3a8a", "#3b82f6"],
      image: "/projects/spendwise.jpg",
      githubUrl: "https://github.com/NayuD06/DEVOPS-Money-Manager",
      liveUrl: "https://devops-money-manager-jzgu.vercel.app",
      problem: {
        en: "Most people know roughly what they earn but not where it goes each month. SpendWise makes daily income and spending quick to record and easy to review, and doubles as practice for the full DevOps loop: tests, CI/CD, deployment and monitoring.",
        vi: "Nhiều người biết mình kiếm được bao nhiêu nhưng không rõ tiền đi đâu mỗi tháng. SpendWise giúp ghi thu chi hằng ngày thật nhanh và xem lại dễ dàng, đồng thời là bài luyện trọn vòng DevOps: test, CI/CD, triển khai và giám sát.",
      },
      approach: [
        {
          en: "A React (Vite) client and an Express REST API on MongoDB, with Mongoose models for users, categories and transactions, JWT sign-in, bcrypt-hashed passwords and avatar uploads.",
          vi: "Client React (Vite) và REST API Express trên MongoDB, model Mongoose cho người dùng, danh mục và giao dịch, đăng nhập bằng JWT, mật khẩu băm bằng bcrypt và tải ảnh đại diện.",
        },
        {
          en: "API tests with Jest and Supertest. A CI workflow runs them and builds the client on every push.",
          vi: "Test API bằng Jest và Supertest. Workflow CI chạy test và build client ở mỗi lần push.",
        },
        {
          en: "A CD workflow bundles a release, copies it to a VPS over SCP, reloads the app with PM2, runs a health check and reports the result to Telegram.",
          vi: "Workflow CD đóng gói bản phát hành, chép lên VPS qua SCP, khởi động lại bằng PM2, kiểm tra health check rồi gửi kết quả về Telegram.",
        },
        {
          en: "The API exposes Prometheus metrics, and alert rules fire when the API goes down or the server runs low on CPU, memory or disk.",
          vi: "API xuất số liệu cho Prometheus, luật cảnh báo báo động khi API sập hoặc máy chủ thiếu CPU, RAM hay ổ đĩa.",
        },
      ],
      features: [
        { en: "Record income and expenses by category", vi: "Ghi khoản thu và khoản chi theo danh mục" },
        { en: "Monthly totals and a spending pie chart", vi: "Tổng thu chi theo tháng và biểu đồ tròn theo danh mục" },
        { en: "Monthly budgets per category with progress", vi: "Ngân sách theo tháng cho từng danh mục, kèm tiến độ" },
        {
          en: "Insights comparing this month with the previous one",
          vi: "Gợi ý so sánh thu chi tháng này với tháng trước",
        },
        {
          en: "Excel report export with an overview sheet and a transaction list",
          vi: "Xuất báo cáo Excel gồm trang tổng quan và danh sách giao dịch",
        },
        { en: "Custom categories and a profile with avatar", vi: "Tự tạo danh mục, hồ sơ có ảnh đại diện" },
      ],
    },
    {
      title: "Online E-Learning",
      slug: "online-elearning",
      year: "2026",
      description: {
        en: "E-learning platform with courses, sections and lessons, quizzes with attempts, enrollments and orders, reviews, completion certificates and an admin dashboard.",
        vi: "Nền tảng học trực tuyến với khóa học, chương, bài học, bài kiểm tra, ghi danh và đơn hàng, đánh giá, chứng chỉ hoàn thành và trang quản trị.",
      },
      tags: ["PHP", "Laravel", "MVC", "SQL"],
      categories: ["Full-stack"],
      featured: true,
      coverIcon: "book",
      coverColors: ["#1e40af", "#38bdf8"],
      image: "/projects/elearning.jpg",
      githubUrl: "https://github.com/NayuD06/online_elearning",
      problem: {
        en: "Students need one place to find courses, learn at their own pace and track progress, while teachers need to publish and manage their own content without touching code.",
        vi: "Sinh viên cần một nơi để tìm khóa học, tự học theo tiến độ của mình và theo dõi quá trình, còn giảng viên cần tự đăng và quản lý nội dung mà không phải đụng tới code.",
      },
      approach: [
        {
          en: "A Laravel 13 MVC app with Eloquent on MySQL and Blade views styled with Tailwind CSS and Alpine.js, built with Vite.",
          vi: "Ứng dụng Laravel 13 theo mô hình MVC, Eloquent trên MySQL, giao diện Blade với Tailwind CSS và Alpine.js, build bằng Vite.",
        },
        {
          en: "Three roles (admin, teacher, student) enforced with middleware and policies, so teachers can only edit their own courses.",
          vi: "Ba vai trò admin, giảng viên, học viên được kiểm soát bằng middleware và policy, giảng viên chỉ sửa được khóa học của mình.",
        },
        {
          en: "Course descriptions and lessons are written in CKEditor 5 and sanitized before display to prevent XSS.",
          vi: "Mô tả khóa học và bài học soạn bằng CKEditor 5, được lọc trước khi hiển thị để chống XSS.",
        },
        {
          en: "Paid courses go through VNPay or MoMo sandbox checkout and then enroll the student automatically. Google sign-in uses Socialite, and the app is deployed on Render.",
          vi: "Khóa học trả phí thanh toán qua VNPay hoặc MoMo (môi trường thử) rồi tự ghi danh. Đăng nhập Google dùng Socialite, ứng dụng được triển khai lên Render.",
        },
      ],
      features: [
        {
          en: "Course library with search, filters by category, level and price, and sorting",
          vi: "Thư viện khóa học: tìm kiếm, lọc theo danh mục, trình độ, học phí và sắp xếp",
        },
        {
          en: "Video lessons, lesson files, completion tracking and a progress bar per course",
          vi: "Bài giảng video, tài liệu bài học, đánh dấu hoàn thành và thanh tiến độ từng khóa",
        },
        { en: "Student dashboard with stats and a continue-learning list", vi: "Góc học tập có thống kê và danh sách học tiếp" },
        {
          en: "Reviews, favorites, lesson Q&A with email replies and PDF certificates",
          vi: "Đánh giá, khóa học yêu thích, hỏi đáp bài học có email báo trả lời và chứng chỉ PDF",
        },
        {
          en: "Admin dashboard with Chart.js charts and course, user, category and announcement management",
          vi: "Trang quản trị có biểu đồ Chart.js, quản lý khóa học, người dùng, danh mục và thông báo",
        },
        {
          en: "Responsive on phones, Vietnamese interface and custom error pages",
          vi: "Chạy tốt trên điện thoại, giao diện tiếng Việt và trang lỗi riêng",
        },
      ],
      gallery: [
        {
          src: "/projects/online-elearning/library.jpg",
          caption: { en: "Course library with filters", vi: "Thư viện khóa học có bộ lọc" },
        },
        {
          src: "/projects/online-elearning/course.jpg",
          caption: { en: "Course detail page", vi: "Trang chi tiết khóa học" },
        },
        {
          src: "/projects/online-elearning/lesson.jpg",
          caption: { en: "Lesson view with progress", vi: "Trang học bài kèm tiến độ" },
        },
        {
          src: "/projects/online-elearning/dashboard.jpg",
          caption: { en: "Student dashboard", vi: "Góc học tập của học viên" },
        },
        {
          src: "/projects/online-elearning/admin.jpg",
          caption: { en: "Admin dashboard", vi: "Bảng điều khiển quản trị" },
        },
        {
          src: "/projects/online-elearning/editor.jpg",
          caption: { en: "Editing a course in CKEditor", vi: "Soạn khóa học bằng CKEditor" },
        },
      ],
    },
    {
      title: "EduForge AI",
      slug: "eduforge-ai",
      year: "2026",
      description: {
        en: "Course and online exam platform: question banks with 8 question types, randomized timed exams with auto-grading, live timer sync and AI question generation from PDFs.",
        vi: "Nền tảng khóa học và thi trực tuyến: ngân hàng câu hỏi 8 dạng, đề ngẫu nhiên có giới hạn thời gian, chấm tự động, đồng bộ đồng hồ trực tiếp và dùng AI tạo câu hỏi từ PDF.",
      },
      tags: ["NestJS", "Next.js", "PostgreSQL", "Redis", "Claude API"],
      categories: ["AI", "Full-stack"],
      coverIcon: "graduation",
      coverColors: ["#1d4ed8", "#0ea5e9"],
      githubUrl: "https://github.com/NayuD06/EduForge-AI",
      context: { en: "In progress: API done, apps next", vi: "Đang làm: xong API, đang dựng app" },
      problem: {
        en: "Instructors need one place to build courses, keep question banks and run fair, timed online exams, and writing good questions from course material by hand takes a lot of time.",
        vi: "Giảng viên cần một nơi để xây khóa học, giữ ngân hàng câu hỏi và tổ chức thi trực tuyến có giới hạn thời gian thật công bằng, trong khi tự soạn câu hỏi từ tài liệu rất tốn thời gian.",
      },
      approach: [
        {
          en: "A pnpm and Turborepo monorepo: a NestJS API, Next.js apps for students and instructors, an Expo mobile app, and a shared package of types and an API client used by all four.",
          vi: "Monorepo pnpm và Turborepo: API NestJS, hai app Next.js cho học viên và giảng viên, app di động Expo, cùng một package dùng chung kiểu dữ liệu và API client cho cả bốn app.",
        },
        {
          en: "The exam engine is written as pure functions with unit tests: seeded random exams that can be reproduced, shuffled questions and options, and partial-credit grading for 8 question types.",
          vi: "Exam engine viết bằng hàm thuần có unit test: đề ngẫu nhiên theo seed nên tái lập được, xáo câu và đáp án, chấm điểm từng phần cho 8 dạng câu hỏi.",
        },
        {
          en: "The server owns the deadline: clients sync time over Socket.IO, answers autosave per question, and a BullMQ job submits the attempt when time runs out.",
          vi: "Máy chủ giữ hạn nộp: client đồng bộ giờ qua Socket.IO, câu trả lời tự lưu từng câu, job BullMQ tự nộp bài khi hết giờ.",
        },
        {
          en: "AI pipeline: uploaded PDFs are split and embedded into PostgreSQL with pgvector, Claude reads the PDF and returns structured draft questions for review, and students get answer explanations that cite the course material.",
          vi: "Luồng AI: PDF tải lên được cắt đoạn và nhúng vector vào PostgreSQL với pgvector, Claude đọc PDF và trả về câu hỏi nháp có cấu trúc để giảng viên duyệt, học viên nhận giải thích đáp án có trích nguồn tài liệu khóa học.",
        },
      ],
      features: [
        { en: "Courses, lessons and enrollment", vi: "Khóa học, bài học và ghi danh" },
        {
          en: "Question banks with 8 types, from multiple choice to matching, ordering and essays",
          vi: "Ngân hàng câu hỏi 8 dạng, từ trắc nghiệm tới ghép cặp, sắp xếp và tự luận",
        },
        {
          en: "Random exams built from rules: N questions by type, difficulty or tag",
          vi: "Đề ngẫu nhiên theo quy tắc: rút N câu theo dạng, độ khó hoặc tag",
        },
        {
          en: "Pick up an attempt again after a reload or on another device",
          vi: "Tải lại trang hay đổi thiết bị vẫn làm tiếp đúng lượt thi",
        },
        {
          en: "Analytics: score distribution, pass rate and real difficulty per question",
          vi: "Phân tích: phổ điểm, tỉ lệ đạt và độ khó thực tế từng câu",
        },
        { en: "Swagger docs for every endpoint", vi: "Tài liệu Swagger cho mọi API" },
      ],
    },
    {
      title: "Digital Map Pathfinding",
      slug: "digital-map-pathfinding",
      year: "2026",
      description: {
        en: "Compares Dijkstra and A* shortest-path search on a real district map from OpenStreetMap, with routes drawn on an interactive Leaflet map.",
        vi: "So sánh thuật toán tìm đường Dijkstra và A* trên bản đồ thật của một quận lấy từ OpenStreetMap, vẽ tuyến đường trên bản đồ Leaflet.",
      },
      tags: ["Python", "FastAPI", "NetworkX", "React", "Leaflet"],
      categories: ["Full-stack"],
      coverIcon: "map",
      coverColors: ["#0c4a6e", "#0284c7"],
      githubUrl: "https://github.com/NayuD06/digital-map-pathfinding",
      context: { en: "Team project, 5 members", vi: "Đồ án nhóm 5 người" },
      problem: {
        en: "A course project on digital maps: how a real road network becomes a graph, and how much less work A* does than Dijkstra on real streets.",
        vi: "Đồ án môn học về bản đồ số: mạng lưới đường thật được mô hình hóa thành đồ thị như thế nào, và A* phải duyệt ít hơn Dijkstra bao nhiêu trên đường phố thật.",
      },
      approach: [
        {
          en: "OSMnx downloads the road network of District 1, Ho Chi Minh City from OpenStreetMap into a directed, weighted NetworkX graph.",
          vi: "OSMnx tải mạng lưới đường Quận 1, TP.HCM từ OpenStreetMap thành đồ thị có hướng, có trọng số bằng NetworkX.",
        },
        {
          en: "Dijkstra and A* (with a Haversine heuristic) are written by hand with heapq so the visited nodes can be counted, and pytest checks that both return the same route.",
          vi: "Dijkstra và A* (heuristic Haversine) được tự cài đặt bằng heapq để đếm được số nút đã duyệt, pytest kiểm tra hai thuật toán cho cùng một tuyến đường.",
        },
        {
          en: "A FastAPI backend returns graph info and routes, and a React, Vite and Leaflet frontend shows them on the map.",
          vi: "Backend FastAPI trả thông tin đồ thị và tuyến đường, frontend React, Vite và Leaflet hiển thị lên bản đồ.",
        },
      ],
      features: [
        { en: "Pick start and end points on the map", vi: "Chọn điểm đi và điểm đến trên bản đồ" },
        {
          en: "Route plus the nodes each algorithm visited",
          vi: "Tuyến đường và các nút mà mỗi thuật toán đã duyệt",
        },
        { en: "Distance, run time and visited node count", vi: "Độ dài, thời gian chạy và số nút đã duyệt" },
        { en: "Chart comparing Dijkstra and A*", vi: "Biểu đồ so sánh Dijkstra và A*" },
      ],
    },
    {
      title: "Auth Microservice",
      slug: "auth-microservice",
      year: "2026",
      description: {
        en: "Standalone authentication service for a microservice setup: sign-up, login and JWT issuing with bcrypt-hashed passwords and validated request DTOs.",
        vi: "Dịch vụ xác thực độc lập cho kiến trúc microservice: đăng ký, đăng nhập, cấp JWT, mật khẩu băm bằng bcrypt và kiểm tra dữ liệu đầu vào.",
      },
      tags: ["NestJS", "MongoDB", "JWT", "Jest"],
      categories: ["Backend"],
      coverIcon: "lock",
      coverColors: ["#172554", "#2563eb"],
      githubUrl: "https://github.com/NayuD06/K24WD02-micro-service-auth-api",
      problem: {
        en: "In a microservice system every service needs to know who is calling it, but only one service should deal with passwords and tokens.",
        vi: "Trong hệ thống microservice, dịch vụ nào cũng cần biết ai đang gọi mình, nhưng chỉ nên có một dịch vụ lo mật khẩu và token.",
      },
      approach: [
        {
          en: "A standalone NestJS service with its own MongoDB database for user accounts.",
          vi: "Một dịch vụ NestJS độc lập với database MongoDB riêng cho tài khoản người dùng.",
        },
        {
          en: "Passwords are hashed with bcrypt, and sign-up and login return a signed JWT that other services can verify.",
          vi: "Mật khẩu băm bằng bcrypt, đăng ký và đăng nhập trả về JWT có chữ ký để các dịch vụ khác kiểm tra.",
        },
        {
          en: "Request bodies are validated with DTOs before they reach the business logic, and the service is covered by Jest tests.",
          vi: "Dữ liệu gửi lên được kiểm tra bằng DTO trước khi vào phần xử lý, dịch vụ có test bằng Jest.",
        },
      ],
      features: [
        { en: "Sign-up and login endpoints", vi: "API đăng ký và đăng nhập" },
        { en: "JWT issuing for other services", vi: "Cấp JWT cho các dịch vụ khác" },
        { en: "bcrypt password hashing", vi: "Băm mật khẩu bằng bcrypt" },
        { en: "Validated request DTOs", vi: "Kiểm tra dữ liệu đầu vào bằng DTO" },
      ],
    },
  ] satisfies Project[],

  /** Tên tài khoản GitHub: mục "Hoạt động GitHub" tự lấy số liệu từ tài khoản này */
  githubUsername: "NayuD06",
};
