import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const description =
  "A calm Pomodoro-style focus timer that grows a living SVG plant while you work, and lets it wilt if you give up. Set an intention, pick a species, and build your focus streak — no sign-up, all data stays in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Focus Garden — Grow While You Focus",
    template: "%s • Focus Garden",
  },
  description,
  applicationName: "Focus Garden",
  keywords: [
    "focus timer",
    "pomodoro timer",
    "productivity app",
    "study timer",
    "plant growing app",
    "focus streak",
    "Next.js app",
  ],
  openGraph: {
    title: "Focus Garden — Grow While You Focus",
    description,
    siteName: "Focus Garden",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Garden — Grow While You Focus",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#090d0b" },
  ],
};

// Reads the persisted theme preference and applies the `dark` class before
// hydration, so switching to dark mode (or an OS in dark mode) never flashes light.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('focus-garden-data-v1');
    var mode = 'auto';
    if (stored) {
      var parsed = JSON.parse(stored);
      mode = (parsed && parsed.settings && parsed.settings.themeMode) || 'auto';
    }
    var isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
