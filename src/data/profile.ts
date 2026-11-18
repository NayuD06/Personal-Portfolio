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
};

export type Testimonial = {
  quote: Text;
  name: string;
  role: Text;
  date: string;
};

export const profile = {
  name: "Duy An",
  /** Chữ viết tắt trên logo */
  initials: "DA",

  /** Các vai trò chạy lần lượt ở đầu trang */
  roles: [
    { en: "Full-stack Developer", vi: "Lập trình viên Full-stack" },
    { en: "Backend Engineer", vi: "Kỹ sư Backend" },
    { en: "AI App Builder", vi: "Người làm ứng dụng AI" },
    { en: "Mobile Developer", vi: "Lập trình viên Mobile" },
  ] satisfies Text[],

  /** Dòng trạng thái nhỏ phía trên tên. Để chuỗi rỗng "" để ẩn. */
  availability: {
    en: "Open to internships and freelance projects",
    vi: "Đang tìm cơ hội thực tập và dự án freelance",
  } as Text,

  intro: {
    en: "I build full-stack web apps with React, Next.js, NestJS and Python, from REST APIs and databases to AI features like document search and PDF-to-quiz generation.",
    vi: "Mình làm ứng dụng web full-stack với React, Next.js, NestJS và Python, từ REST API, cơ sở dữ liệu cho tới các tính năng AI như tìm kiếm tài liệu và tạo câu hỏi từ file PDF.",
  } as Text,

  /** Đang làm gì: hiện trên thẻ nhỏ cạnh ảnh đại diện */
  currentlyBuilding: "EduForge AI",

  /** Ảnh đại diện (vuông), đặt trong public. Để trống "" sẽ hiện chữ viết tắt. */
  avatar: "/avatar.jpg",
  /** Ảnh dọc ở phần About (tỉ lệ 4:5). Để trống "" sẽ dùng khung code thay ảnh. */
  aboutPhoto: "/about.jpg",
  /** Link CV: đặt file vào public (vd. public/cv.pdf) rồi ghi "/cv.pdf". Để trống để ẩn nút tải CV. */
  resumeUrl: "",

  location: { en: "Vietnam", vi: "Việt Nam" } as Text,
  /** Thay bằng email thật của bạn */
  email: "hello@example.com",
  /** Để trống để ẩn */
  phone: "",

  about: [
    {
      en: "I'm a software developer from Vietnam who enjoys building complete products: designing the database, writing the API and shipping a clean, responsive interface on top. Most of my recent work lives in TypeScript monorepos with NestJS or Express on the backend and React or Next.js on the frontend.",
      vi: "Mình là lập trình viên đến từ Việt Nam, thích làm một sản phẩm trọn vẹn: thiết kế cơ sở dữ liệu, viết API rồi dựng giao diện gọn gàng, chạy tốt trên mọi màn hình. Phần lớn dự án gần đây của mình là monorepo TypeScript, backend dùng NestJS hoặc Express, frontend dùng React hoặc Next.js.",
    },
    {
      en: "Lately I've been bringing AI into real apps: generating exam questions from PDFs with the Claude API, semantic search and RAG with pgvector and Qdrant, and Python services built with FastAPI. I also care about the parts that make a project last, like automated tests, Docker and CI/CD pipelines.",
      vi: "Dạo gần đây mình đưa AI vào ứng dụng thật: tạo câu hỏi thi từ PDF bằng Claude API, tìm kiếm ngữ nghĩa và RAG với pgvector, Qdrant, cùng các dịch vụ Python viết bằng FastAPI. Mình cũng chăm chút những thứ giúp dự án sống lâu như test tự động, Docker và CI/CD.",
    },
  ] satisfies Text[],

  stats: [
    { value: "35+", label: { en: "GitHub repositories", vi: "Repo trên GitHub" } },
    { value: "20+", label: { en: "Technologies used", vi: "Công nghệ đã dùng" } },
    { value: "6", label: { en: "Featured projects", vi: "Dự án tiêu biểu" } },
  ] satisfies { value: string; label: Text }[],

  socials: [
    { label: "GitHub", href: "https://github.com/NayuD06", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle", icon: "linkedin" },
    { label: "Facebook", href: "https://www.facebook.com/your-handle", icon: "facebook" },
  ] satisfies Social[],

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
      name: "Python & FastAPI",
      icon: "python",
      description: {
        en: "AI services for PDF parsing, embeddings and RAG, plus graph algorithms with NetworkX.",
        vi: "Dịch vụ AI đọc PDF, tạo embedding và RAG, cùng thuật toán đồ thị với NetworkX.",
      },
      tools: ["python", "fastapi"],
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
      name: "Docker & CI/CD",
      icon: "docker",
      description: {
        en: "Docker Compose environments, GitHub Actions pipelines, Prometheus monitoring and Vercel deploys.",
        vi: "Môi trường Docker Compose, pipeline GitHub Actions, giám sát bằng Prometheus và deploy lên Vercel.",
      },
      tools: ["docker", "githubactions", "prometheus", "vercel"],
    },
    {
      name: "AI & RAG",
      icon: "anthropic",
      description: {
        en: "LLM features with the Claude API, vector search with pgvector and Qdrant, local models with Ollama.",
        vi: "Tính năng LLM với Claude API, tìm kiếm vector bằng pgvector và Qdrant, chạy model trên máy với Ollama.",
      },
      tools: ["anthropic", "ollama", "python"],
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
  ] satisfies Skill[],

  /** Logo chạy ngang bên dưới phần kỹ năng */
  techMarquee: [
    "typescript", "javascript", "react", "nextjs", "tailwind", "vite", "nodejs", "express",
    "nestjs", "python", "fastapi", "php", "laravel", "postgresql", "mysql", "mongodb",
    "redis", "prisma", "docker", "githubactions", "prometheus", "socketio", "expo",
    "flutter", "go", "dotnet", "java", "cplusplus", "git", "postman", "vercel", "ollama",
    "turborepo", "jest",
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
        en: "Secure REST APIs with NestJS, Express or FastAPI, documented with Swagger and covered by automated tests.",
        vi: "REST API an toàn với NestJS, Express hoặc FastAPI, có tài liệu Swagger và test tự động.",
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
      title: { en: "AI integration", vi: "Tích hợp AI" },
      icon: "brain",
      description: {
        en: "Chat over your documents, semantic search and content generation using LLM APIs and vector databases.",
        vi: "Hỏi đáp trên tài liệu, tìm kiếm ngữ nghĩa và sinh nội dung bằng API LLM cùng cơ sở dữ liệu vector.",
      },
    },
    {
      title: { en: "DevOps & deployment", vi: "DevOps & triển khai" },
      icon: "rocket",
      description: {
        en: "Dockerized apps, CI/CD with GitHub Actions, monitoring with Prometheus and deploys to Vercel.",
        vi: "Đóng gói Docker, CI/CD với GitHub Actions, giám sát bằng Prometheus và deploy lên Vercel.",
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
    },
    {
      title: "SpendWise Money Manager",
      year: "2026",
      description: {
        en: "Personal finance tracker with JWT auth, category reports and Excel support, Jest and Supertest coverage, Prometheus metrics with alert rules and a GitHub Actions release pipeline.",
        vi: "Ứng dụng quản lý thu chi cá nhân có xác thực JWT, báo cáo theo danh mục, hỗ trợ Excel, test bằng Jest và Supertest, đo lường bằng Prometheus kèm cảnh báo và pipeline phát hành GitHub Actions.",
      },
      tags: ["React", "Express", "MongoDB", "Docker", "Prometheus", "GitHub Actions"],
      categories: ["Full-stack", "DevOps"],
      featured: true,
      coverIcon: "wallet",
      coverColors: ["#1e3a8a", "#3b82f6"],
      image: "/projects/spendwise.jpg",
      githubUrl: "https://github.com/NayuD06/DEVOPS-Money-Manager",
      liveUrl: "https://devops-money-manager.vercel.app",
    },
    {
      title: "Online E-Learning",
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
    },
    {
      title: "EduForge AI",
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
    },
    {
      title: "Digital Map Pathfinding",
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
    },
    {
      title: "Auth Microservice",
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
    },
  ] satisfies Project[],

  // ĐÂY LÀ NỘI DUNG MẪU: thay bằng nhận xét thật từ giảng viên, đồng đội hoặc khách hàng.
  // Xóa hết phần tử trong mảng để ẩn cả mục này.
  testimonials: [
    {
      quote: {
        en: "Replace this with a real quote from a lecturer or mentor. Two or three sentences about how you approach problems and the quality of your work read best.",
        vi: "Thay đoạn này bằng nhận xét thật của giảng viên hoặc người hướng dẫn. Hai, ba câu về cách bạn giải quyết vấn đề và chất lượng công việc là đẹp nhất.",
      },
      name: "Lecturer name",
      role: { en: "Course or university", vi: "Môn học hoặc trường" },
      date: "2026",
    },
    {
      quote: {
        en: "Ask a teammate from your capstone project for a short note about working with you: how you split tasks, handled the backend or helped the team ship on time.",
        vi: "Nhờ một bạn trong nhóm đồ án viết vài dòng về việc làm chung với bạn: chia việc thế nào, phụ trách backend ra sao, giúp nhóm kịp tiến độ thế nào.",
      },
      name: "Teammate name",
      role: { en: "Capstone project", vi: "Đồ án tốt nghiệp" },
      date: "2026",
    },
    {
      quote: {
        en: "If you have done freelance or internship work, put the client's or manager's feedback here, along with their name and company.",
        vi: "Nếu đã làm freelance hoặc thực tập, hãy đưa nhận xét của khách hàng hoặc quản lý vào đây, kèm tên và công ty của họ.",
      },
      name: "Client name",
      role: { en: "Company", vi: "Công ty" },
      date: "2026",
    },
  ] satisfies Testimonial[],
};
