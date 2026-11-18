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
  title,
  description,
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
      </body>
    </html>
  );
}
