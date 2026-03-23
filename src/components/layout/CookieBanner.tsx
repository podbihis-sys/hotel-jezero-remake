"use client";

import { useState, useEffect } from "react";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import { getConsent, setConsent } from "@/lib/cookie-consent";
import { usePathTranslations } from "@/lib/use-path-locale";

export default function CookieBanner() {
  const t = usePathTranslations("cookies");
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      setVisible(true);
    }

    function handleShowSettings() {
      const consent = getConsent();
      if (consent) {
        setAnalytics(consent.analytics);
        setMarketing(consent.marketing);
      }
      setShowSettings(true);
      setVisible(true);
    }

    window.addEventListener("show-cookie-settings", handleShowSettings);
    return () => window.removeEventListener("show-cookie-settings", handleShowSettings);
  }, []);

  function acceptAll() {
    setConsent(true, true);
    setVisible(false);
    setShowSettings(false);
  }

  function acceptNecessary() {
    setConsent(false, false);
    setVisible(false);
    setShowSettings(false);
  }

  function saveSettings() {
    setConsent(analytics, marketing);
    setVisible(false);
    setShowSettings(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#2C3E50] text-white rounded-2xl shadow-2xl shadow-black/20 p-5 md:p-6 relative">
        <button onClick={acceptNecessary} className="absolute top-3 right-3 text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <Cookie className="w-6 h-6 text-[#C5A55A] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">{t("title")}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{t("description")}</p>
          </div>
        </div>

        {showSettings && (
          <div className="mb-4 space-y-3 bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t("necessary")}</p>
                <p className="text-white/50 text-xs">{t("necessary_desc")}</p>
              </div>
              <div className="w-10 h-5 bg-[#C5A55A] rounded-full relative cursor-not-allowed opacity-70">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t("analytics")}</p>
                <p className="text-white/50 text-xs">{t("analytics_desc")}</p>
              </div>
              <button
                onClick={() => setAnalytics(!analytics)}
                className={`w-10 h-5 rounded-full relative transition-colors ${analytics ? "bg-[#C5A55A]" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${analytics ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t("marketing_label")}</p>
                <p className="text-white/50 text-xs">{t("marketing_desc")}</p>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`w-10 h-5 rounded-full relative transition-colors ${marketing ? "bg-[#C5A55A]" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${marketing ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!showSettings && (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-1 px-4 py-2.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              {t("settings")}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
          {showSettings && (
            <>
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                {t("settings")}
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2.5 border border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10 rounded-lg text-sm font-semibold transition-colors"
              >
                {t("save_settings")}
              </button>
            </>
          )}
          <button
            onClick={acceptNecessary}
            className="px-4 py-2.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
          >
            {t("necessary_only")}
          </button>
          <button
            onClick={acceptAll}
            className="px-5 py-2.5 bg-[#C5A55A] hover:bg-[#B8963F] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {t("accept_all")}
          </button>
        </div>
      </div>
    </div>
  );
}
