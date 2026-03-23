"use client";

import { usePathname } from "next/navigation";
import hrMessages from "@/messages/hr.json";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";
import itMessages from "@/messages/it.json";

const messages: Record<string, Record<string, Record<string, string>>> = {
  hr: hrMessages as any,
  en: enMessages as any,
  de: deMessages as any,
  it: itMessages as any,
};

const localeCodes = ["hr", "en", "de", "it"];

export function usePathLocale() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = localeCodes.includes(segments[0]) ? segments[0] : "hr";
  return locale;
}

export function usePathTranslations(namespace: string) {
  const locale = usePathLocale();
  const ns = messages[locale]?.[namespace] || messages["hr"]?.[namespace] || {};
  return (key: string) => ns[key] || key;
}
