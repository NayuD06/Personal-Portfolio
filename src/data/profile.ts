// =============================================================
//  TOÀN BỘ NỘI DUNG CỦA TRANG NẰM Ở FILE NÀY
//  Sửa chữ, link, dự án... ở đây. Không cần đụng vào component.
//  Tên icon (icon: "...") lấy từ danh sách trong src/lib/icons.tsx
// =============================================================

import type { IconName } from "@/lib/icons";

export type Social = { label: string; href: string; icon: IconName };

export type Skill = {
  name: string;
  icon: IconName;
  description: string;
};

export type Service = {
  title: string;
  icon: IconName;
  description: string;
};

export type ProjectCategory = "AI" | "Full-stack" | "Backend" | "DevOps";

export type Project = {
  title: string;
  year: string;
  description: string;
  tags: string[];
  categories: ProjectCategory[];
  /** Icon lớn trên ảnh bìa tự tạo */
  coverIcon: IconName;
  /** Hai màu gradient cho ảnh bìa tự tạo */
  coverColors: [string, string];
  /** Ảnh chụp màn hình thật (đặt trong public/projects/...). Có ảnh thì thay cho ảnh bìa tự tạo. */
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  date: string;
};

export const profile = {
  name: "Duy An",
  /** Chữ ở logo trên thanh menu */
  brand: "Duy An",
  greeting: "Hi, I'm",
  /** Các vai trò chạy lần lượt ở đầu trang */
  roles: [
    "Full-stack Developer",
    "Backend Engineer",
    "AI App Builder",
    "Mobile Developer",
  ],
  /** Dòng trạng thái nhỏ phía trên tên. Để trống để ẩn. */
  availability: "Open to internships and freelance projects",
  intro:
    "I build full-stack web apps with React, Next.js, NestJS and Python, from REST APIs and databases to AI features like document search and PDF-to-quiz generation.",

  /** Ảnh đại diện: đặt file vào public (vd. public/avatar.jpg) rồi ghi "/avatar.jpg". Để trống sẽ hiện chữ viết tắt. */
  avatar: "/avatar.jpg",
  /** Ảnh dọc ở phần About (tỉ lệ 4:5). Để trống sẽ dùng khung code thay ảnh. */
  aboutPhoto: "/about.jpg",
  /** Link CV: đặt file vào public (vd. public/cv.pdf) rồi ghi "/cv.pdf". Để trống sẽ ẩn nút tải CV. */
  resumeUrl: "",

  location: "Vietnam",
  /** Thay bằng email thật của bạn */
  email: "hello@example.com",
  /** Để trống để ẩn */
  phone: "",

  about: [
    "I'm a software developer from Vietnam who enjoys building complete products: designing the database, writing the API and shipping a clean, responsive interface on top. Most of my recent work lives in TypeScript monorepos with NestJS or Express on the backend and React or Next.js on the frontend.",
    "Lately I've been bringing AI into real apps: generating exam questions from PDFs with the Claude API, semantic search and RAG with pgvector and Qdrant, and Python services built with FastAPI. I also care about the boring parts that make a project last, like automated tests, Docker and CI/CD pipelines.",
  ],

  stats: [
    { value: "35+", label: "GitHub repositories" },
    { value: "20+", label: "Technologies used" },
    { value: "6", label: "Featured projects" },
  ],

  socials: [
    { label: "GitHub", href: "https://github.com/NayuD06", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle", icon: "linkedin" },
    { label: "Facebook", href: "https://www.facebook.com/your-handle", icon: "facebook" },
  ] satisfies Social[],

  skills: [
    {
      name: "TypeScript & JavaScript",
      icon: "typescript",
      description:
        "My main languages on both sides of the stack, with strict types shared across monorepo apps.",
    },
    {
      name: "React & Next.js",
      icon: "react",
      description:
        "Component-based interfaces with Vite and the Next.js App Router, styled with Tailwind CSS.",
    },
    {
      name: "Node.js, NestJS & Express",
      icon: "nestjs",
      description:
        "REST APIs with JWT auth, WebSocket events via Socket.IO and background jobs with BullMQ.",
    },
    {
      name: "Python & FastAPI",
      icon: "python",
      description:
        "AI services for PDF parsing, embeddings and RAG, plus graph algorithms with NetworkX.",
    },
    {
      name: "PostgreSQL, MySQL & MongoDB",
      icon: "postgresql",
      description:
        "Relational and NoSQL data modeling with Prisma and Mongoose, plus Redis for caching and queues.",
    },
    {
      name: "Docker & CI/CD",
      icon: "docker",
      description:
        "Docker Compose environments, GitHub Actions pipelines and Prometheus monitoring.",
    },
    {
      name: "AI & RAG",
      icon: "anthropic",
      description:
        "LLM features with the Claude API, vector search with pgvector and Qdrant, local models with Ollama.",
    },
    {
      name: "PHP & Laravel",
      icon: "laravel",
      description:
        "Server-side apps with Laravel and Inertia + React, from course platforms to booking systems.",
    },
    {
      name: "Mobile: Expo & Flutter",
      icon: "expo",
      description:
        "Cross-platform mobile apps with Expo and React Native, and Flutter with Dart.",
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
      title: "Full-Stack Web Development",
      icon: "code",
      description:
        "End-to-end web apps with React or Next.js on the front and Node.js on the back, built on a clean, scalable structure.",
    },
    {
      title: "Frontend Development",
      icon: "layout",
      description:
        "Fast, responsive and animated interfaces with React, Next.js and Tailwind CSS that work well on every screen.",
    },
    {
      title: "Backend & API Development",
      icon: "server",
      description:
        "Secure REST APIs with NestJS, Express or FastAPI, documented with Swagger and covered by automated tests.",
    },
    {
      title: "Database Design",
      icon: "database",
      description:
        "Well-structured schemas in PostgreSQL, MySQL or MongoDB with Prisma migrations and efficient queries.",
    },
    {
      title: "Authentication & Security",
      icon: "shield",
      description:
        "Login systems with JWT, Google sign-in, role-based access control and safely hashed passwords.",
    },
    {
      title: "AI Integration",
      icon: "brain",
      description:
        "Chat over your documents, semantic search and content generation using LLM APIs and vector databases.",
    },
    {
      title: "DevOps & Deployment",
      icon: "rocket",
      description:
        "Dockerized apps, CI/CD with GitHub Actions, monitoring with Prometheus and deploys to Vercel.",
    },
    {
      title: "Mobile App Development",
      icon: "smartphone",
      description:
        "Cross-platform mobile apps with Expo and React Native that share types and API clients with the web.",
    },
  ] satisfies Service[],

  projects: [
    {
      title: "EduForge AI",
      year: "2026",
      description:
        "Course and online exam platform for instructors: question banks with 8 question types, randomized timed exams with auto-grading, live timer sync and AI question generation from PDFs.",
      tags: ["NestJS", "Next.js", "PostgreSQL", "pgvector", "Redis", "Claude API"],
      categories: ["AI", "Full-stack"],
      coverIcon: "graduation",
      coverColors: ["#1d4ed8", "#0ea5e9"],
      githubUrl: "https://github.com/NayuD06/EduForge-AI",
    },
    {
      title: "StudyMind AI",
      year: "2026",
      description:
        "Study material sharing platform with semantic search and AI Q&A over PDFs, an in-browser PDF reader, ratings, moderation dashboard and 55 automated API tests in CI.",
      tags: ["React", "Express", "Prisma", "MySQL", "FastAPI", "Qdrant"],
      categories: ["AI", "Full-stack", "DevOps"],
      coverIcon: "brain",
      coverColors: ["#0369a1", "#2563eb"],
      image: "/projects/studymind.jpg",
      githubUrl: "https://github.com/NayuD06/StudyMind-AI",
    },
    {
      title: "Digital Map Pathfinding",
      year: "2026",
      description:
        "Compares Dijkstra and A* shortest-path search on a real district map from OpenStreetMap, with routes drawn on an interactive Leaflet map.",
      tags: ["Python", "FastAPI", "OSMnx", "NetworkX", "React", "Leaflet"],
      categories: ["Full-stack"],
      coverIcon: "map",
      coverColors: ["#0c4a6e", "#0284c7"],
      githubUrl: "https://github.com/NayuD06/digital-map-pathfinding",
    },
    {
      title: "SpendWise Money Manager",
      year: "2026",
      description:
        "Personal finance tracker with JWT auth, Excel support, Jest and Supertest coverage, Prometheus metrics with alert rules and a GitHub Actions release pipeline.",
      tags: ["React", "Express", "MongoDB", "Docker", "Prometheus", "GitHub Actions"],
      categories: ["Full-stack", "DevOps"],
      coverIcon: "wallet",
      coverColors: ["#1e3a8a", "#3b82f6"],
      image: "/projects/spendwise.jpg",
      githubUrl: "https://github.com/NayuD06/DEVOPS-Money-Manager",
      liveUrl: "https://devops-money-manager.vercel.app",
    },
    {
      title: "Online E-Learning",
      year: "2026",
      description:
        "E-learning platform with courses, sections and lessons, quizzes with attempts, enrollments and orders, reviews and completion certificates.",
      tags: ["PHP", "Laravel", "MVC", "SQL"],
      categories: ["Full-stack"],
      coverIcon: "book",
      coverColors: ["#1e40af", "#38bdf8"],
      image: "/projects/elearning.jpg",
      githubUrl: "https://github.com/NayuD06/online_elearning",
    },
    {
      title: "Auth Microservice",
      year: "2026",
      description:
        "Standalone authentication service for a microservice setup: sign-up, login and JWT issuing with bcrypt-hashed passwords and validated request DTOs.",
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
      quote:
        "Replace this with a real quote from a lecturer or mentor. Two or three sentences about how you approach problems and the quality of your work read best.",
      name: "Lecturer name",
      role: "Course or university",
      date: "2026",
    },
    {
      quote:
        "Ask a teammate from your capstone project for a short note about working with you: how you split tasks, handled the backend or helped the team ship on time.",
      name: "Teammate name",
      role: "Capstone project",
      date: "2026",
    },
    {
      quote:
        "If you have done freelance or internship work, put the client's or manager's feedback here, along with their name and company.",
      name: "Client name",
      role: "Company",
      date: "2026",
    },
  ] satisfies Testimonial[],
};

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];
