import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Navbar } from "./common/Navbar";
import Providers from "./providers/sessionProvider";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shorty - URL Shortener",
  description: "Shorty is a URL shortening service that helps you shorten, track, and manage your links.",
  keywords: ["URL shortener", "link shortener", "shorten URL", "shorten link", "link management", "link tracking"],
  authors: [{ name: "Someswar Gorai" }],
  creator: "Someswar Gorai",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Shorty - URL Shortener",
    description: "Shorty is a URL shortening service that helps you shorten, track, and manage your links.",
    url: "https://www.myk8s.shop",
    siteName: "Shorty",
    images: [
      {
        url: "https://res.cloudinary.com/dpacclyw4/image/upload/v1778873361/og_image_shorty_quiwqr.png",
        width: 1200,
        height: 630,
        alt: "Shorty - URL Shortener",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shorty - URL Shortener",
    description: "Shorty is a URL shortening service that helps you shorten, track, and manage your links.",
    images: ["https://res.cloudinary.com/dpacclyw4/image/upload/v1778873361/og_image_shorty_quiwqr.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Analytics/>
        <Toaster/>
        <Providers>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
