import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hotel Jezero | Premium Ski & Wellness Resort | Kupres, BiH",
    template: "%s",
  },
  description:
    "Hotel Jezero u Kupresu nudi premium smještaj, skijalište, wellness, bazen i restoran.",
  icons: {
    icon: "/images/logo-square.png",
    apple: "/images/logo-square.png",
  },
  metadataBase: new URL("https://hotel-jezero.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bs"
      className={`${inter.variable} ${playfairDisplay.variable} ${montserrat.variable}`}
    >
      <head>
        <meta name="theme-color" content="#2C3E50" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/logo-square.png" />
      </head>
      <body className="font-body bg-light text-dark antialiased">
        <SiteShell>{children}</SiteShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
