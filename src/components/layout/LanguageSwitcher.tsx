"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

const localeList = [
  { code: "hr", label: "HR", flag: "🇭🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "it", label: "IT", flag: "🇮🇹" },
];

const localeCodes = localeList.map((l) => l.code);

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && localeCodes.includes(segments[0])) {
    return segments[0];
  }
  return "hr";
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLocale = getLocaleFromPath(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    // Strip current locale prefix
    const segments = pathname.split("/").filter(Boolean);
    const hasLocalePrefix = localeCodes.includes(segments[0]);
    const pathSegments = hasLocalePrefix ? segments.slice(1) : segments;
    const pagePath = pathSegments.length > 0 ? "/" + pathSegments.join("/") : "";

    // Always use prefix (localePrefix: "always")
    const newPath = `/${newLocale}${pagePath}`;
    router.push(newPath);
    setOpen(false);
  }

  const current = localeList.find((l) => l.code === currentLocale) || localeList[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition"
        aria-label="Odaberi jezik"
      >
        <Globe className="w-4 h-4" />
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[120px] z-50">
          {localeList.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition ${
                l.code === currentLocale
                  ? "text-[#163c6f] font-semibold bg-gray-50"
                  : "text-gray-700"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
