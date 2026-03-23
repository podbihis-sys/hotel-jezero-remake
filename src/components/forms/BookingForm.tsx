"use client";

import { useState, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { hr, enUS, de, it } from "date-fns/locale";
import { format, type Locale } from "date-fns";
import { CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const localeMap: Record<string, Locale> = { hr, en: enUS, de, it };

export default function BookingForm() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [range, setRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [personen, setPersonen] = useState(2);
  const [paket, setPaket] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formTimestamp, setFormTimestamp] = useState("");

  useEffect(() => {
    setFormTimestamp(String(Date.now()));
  }, []);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!range?.from || !range?.to) {
      setStatus({ type: "error", message: t("select_dates") });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          telefon: telefon || undefined,
          reisedatum_von: format(range.from, "yyyy-MM-dd"),
          reisedatum_bis: format(range.to, "yyyy-MM-dd"),
          personen,
          paket: paket || undefined,
          nachricht: nachricht || undefined,
          _hp: "",
          _t: formTimestamp,
        }),
      });

      const data = await res.json();
      if (res.status === 429) {
        setStatus({ type: "error", message: t("rate_limit") });
      } else if (data.success) {
        setStatus({ type: "success", message: t("success") });
        setName(""); setEmail(""); setTelefon(""); setPersonen(2);
        setPaket(""); setNachricht(""); setRange(undefined);
        setFormTimestamp(String(Date.now()));
      } else {
        setStatus({ type: "error", message: data.message || t("error") });
      }
    } catch {
      setStatus({ type: "error", message: t("error") });
    } finally {
      setSending(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#3d3d3d] bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] transition-all";
  const labelClass = "block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="_hp" autoComplete="off" tabIndex={-1} aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t("name")} *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("email")} *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t("phone")}</label>
          <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("guests")} *</label>
          <input type="number" min={1} max={50} required value={personen} onChange={(e) => setPersonen(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      {/* Date Range Picker */}
      <div>
        <label className={labelClass}>{t("dates")} *</label>
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={`${inputClass} text-left flex items-center justify-between`}
        >
          <span className={range?.from ? "text-[#3d3d3d]" : "text-gray-400"}>
            {range?.from && range?.to
              ? `${format(range.from, "dd.MM.yyyy")} — ${format(range.to, "dd.MM.yyyy")}`
              : t("select_dates")}
          </span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </button>
        {showCalendar && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 inline-block">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={(r) => {
                setRange(r);
                if (r?.from && r?.to) setShowCalendar(false);
              }}
              locale={localeMap[locale] || hr}
              disabled={{ before: today }}
              startMonth={today}
              endMonth={maxDate}
              classNames={{
                selected: "bg-[#2C3E50] text-white",
                range_middle: "bg-[#2C3E50]/10",
                today: "font-bold text-[#C5A55A]",
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>{t("package")}</label>
        <select value={paket} onChange={(e) => setPaket(e.target.value)} className={inputClass}>
          <option value="">{t("select_package")}</option>
          <option value="ski">{t("pkg_ski")}</option>
          <option value="wellness">{t("pkg_wellness")}</option>
          <option value="summer">{t("pkg_summer")}</option>
          <option value="seminar">{t("pkg_seminar")}</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>{t("message")}</label>
        <textarea rows={3} value={nachricht} onChange={(e) => setNachricht(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      {status && (
        <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {status.type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <button type="submit" disabled={sending} className="w-full bg-[#2C3E50] hover:bg-[#1C2833] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-lg transition-all duration-300 text-sm">
        {sending ? t("sending") : t("book_now")}
      </button>
    </form>
  );
}
