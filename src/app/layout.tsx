import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Montserrat, Nunito } from "next/font/google";
import { Providers } from "@/components/providers";
import { profile } from "@/data/profile";
import { pick, langScript } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const title = `${profile.name} | ${pick(profile.roles[0], "en")}`;
const description = pick(profile.intro, "en");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Trang con chỉ cần đặt title ngắn, vd. "CV" sẽ thành "CV | Duy An"
  title: { default: title, template: `%s | ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    profile.name,
    "portfolio",
    "full-stack developer",
    "web developer",
    "React",
    "Next.js",
    "NestJS",
    "Laravel",
    "TypeScript",
    "lập trình viên",
    "Việt Nam",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    siteName: profile.name,
    locale: "en_US",
    alternateLocale: ["vi_VN"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#04070d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} ${montserrat.variable}`}
    >
      <head>
        {/* Chọn ngôn ngữ trước khi trang hiện ra để không bị nháy chữ */}
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>{children}</Providers>
        {/* Thống kê lượt xem và tốc độ trang: bật trong Vercel > Project > Analytics / Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
