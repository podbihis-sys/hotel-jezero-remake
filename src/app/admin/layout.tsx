import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Hotel Jezero Admin",
  description: "Admin panel za Hotel Jezero",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link rel="manifest" href="/admin-manifest.json" />
        <meta name="theme-color" content="#163c6f" />
        <link rel="apple-touch-icon" href="/images/logo-square.png" />
      </head>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  );
}
