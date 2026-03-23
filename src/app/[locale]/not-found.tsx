"use client";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function NotFound() {
  const locale = useLocale();
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
      <div className="text-center">
        <h1 className="text-6xl font-heading font-bold text-[#2C3E50] mb-4">404</h1>
        <p className="text-gray-500 mb-6">Stranica nije pronađena</p>
        <Link href={`/${locale}/`} className="text-[#C5A55A] font-semibold hover:underline">Nazad na početnu</Link>
      </div>
    </main>
  );
}
