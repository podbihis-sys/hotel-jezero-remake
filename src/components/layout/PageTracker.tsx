"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { hasConsent } from "@/lib/cookie-consent";

export default function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (!hasConsent("analytics")) return;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);
  return null;
}
