"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useRef, FormEvent } from "react";
import BookingForm from "@/components/forms/BookingForm";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const allGalleryImages = [
  "/images/hotel-jezero2.jpg", "/images/hotel-jezero3.jpg", "/images/hotel-jezero4.jpg",
  "/images/hotel-jezero5.jpg", "/images/hotel-jezero6.jpg", "/images/hotel-jezero7.jpg",
  "/images/hotel-jezero8.jpg", "/images/hotel-jezero9.jpg", "/images/hotel-jezero10.jpg",
  "/images/hotel-jezero11.jpg", "/images/hotel-jezero12.jpg", "/images/restoran2.jpg",
];

export default function HomePage() {
  const t = useTranslations("home");
  const tr = useTranslations("rooms");
  const tg = useTranslations("gallery");
  const tp = useTranslations("pricing");
  const tc = useTranslations("contact");
  const tco = useTranslations("common");
  const tb = useTranslations("booking");
  const locale = useLocale();

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formTimestamp, setFormTimestamp] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setFormTimestamp(String(Date.now())); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const emailVal = fd.get("email") as string;
    const emailConfirm = fd.get("emailConfirm") as string;
    if (emailVal !== emailConfirm) { setStatus({ type: "error", message: tc("email_mismatch") }); return; }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${fd.get("prezime")} ${fd.get("ime")}`.trim(), email: emailVal, nachricht: fd.get("poruka"), _hp: fd.get("_hp"), _t: fd.get("_t") }),
      });
      const data = await res.json();
      if (res.status === 429) setStatus({ type: "error", message: tc("rate_limit_message") });
      else if (data.success) { setStatus({ type: "success", message: tc("success_message") }); form.reset(); setFormTimestamp(String(Date.now())); }
      else setStatus({ type: "error", message: data.message || tc("error_message") });
    } catch { setStatus({ type: "error", message: tc("error_message") }); }
    finally { setSending(false); }
  }

  const features = [
    { image: "/images/restoran2.jpg", title: t("feature_food_title"), desc: t("feature_food_desc") },
    { image: "/images/soba2.jpg", title: t("feature_rooms_title"), desc: t("feature_rooms_desc") },
    { image: "/images/hodnik.jpg", title: t("feature_service_title"), desc: t("feature_service_desc") },
  ];

  const stats = [
    { value: "82", label: t("stat_beds") },
    { value: "200", label: t("stat_restaurant") },
    { value: "4", label: t("stat_stars") },
    { value: "24h", label: t("stat_reception") },
  ];

  const rooms = [
    { image: "/images/soba2.jpg", title: tr("double_room"), desc: tr("double_desc") },
    { image: "/images/soba3.jpg", title: tr("triple_room"), desc: tr("triple_desc") },
    { image: "/images/soba4.jpg", title: tr("apartment"), desc: tr("apartment_desc") },
  ];

  return (
    <main className="pt-[70px]">
      {/* ===== HERO ===== */}
      <section id="hero" className="relative h-[85vh] min-h-[500px] overflow-hidden">
        <Image src="/images/hotel-jezero5.jpg" alt="Hotel Jezero" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2833] via-[#1C2833]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block text-[#C5A55A] text-xs tracking-[0.3em] uppercase font-semibold mb-4">Hotel Jezero Kupres</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight">{t("hero_title")}</h1>
              <p className="mt-4 text-lg md:text-xl text-white/70 max-w-xl">{t("hero_subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#sobe" className="bg-[#C5A55A] hover:bg-[#B8963F] text-white font-semibold px-8 py-3.5 rounded-lg transition-all text-sm">
                  {tco("book_now")}
                </a>
                <a href="#galerija" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-lg transition-all text-sm">
                  {tco("gallery")}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ duration: 0.6, delay: i * 0.15 }} className="text-center group">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  <Image src={f.image} alt={f.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#2C3E50]/20 group-hover:bg-[#2C3E50]/10 transition-colors" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WELCOME ===== */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{t("welcome_label")}</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50] mb-6">{t("welcome_title")}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{t("welcome_text")}</p>
              <a href="#kontakt" className="inline-flex items-center gap-2 bg-[#2C3E50] hover:bg-[#1C2833] text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                {tco("contact_us")}
              </a>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/hotel-jezero3.jpg" alt="Hotel Jezero" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 bg-[#2C3E50]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl md:text-5xl font-heading font-bold text-[#C5A55A]">{s.value}</p>
                <p className="text-white/70 text-sm mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOBE (ROOMS) ===== */}
      <section id="sobe" className="py-20 bg-white scroll-mt-[70px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{tr("subtitle")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50]">{tr("title")}</h2>
            <p className="text-gray-500 mt-3">{tr("hero_desc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.15 }} className="bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                <div className="relative h-56"><Image src={room.image} alt={room.title} fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-2">{room.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{room.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 bg-[#2C3E50] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-heading font-bold text-white mb-4">{tr("amenities_title")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[tr("amenity_sauna"), tr("amenity_pool"), tr("amenity_gym"), tr("amenity_table_tennis")].map((a, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4"><p className="text-white font-semibold text-sm">{a}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALERIJA (GALLERY) ===== */}
      <section id="galerija" className="py-20 bg-[#FAF8F5] scroll-mt-[70px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{tg("subtitle")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50]">{tg("title")}</h2>
            <p className="text-gray-500 mt-3">{tg("description")}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGalleryImages.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="relative h-48 md:h-56 rounded-xl overflow-hidden group">
                <Image src={img} alt={`Hotel Jezero ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#2C3E50]/0 group-hover:bg-[#2C3E50]/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CJENIK (PRICING) ===== */}
      <section id="cjenik" className="py-20 bg-white scroll-mt-[70px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{tp("subtitle")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50]">{tp("title")}</h2>
            <p className="text-gray-500 mt-3">{tp("hero_desc")}</p>
          </motion.div>

          <div className="space-y-8">
            <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-4">{tp("standard_rooms")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">{tp("single_with_breakfast")}</span>
                  <span className="font-bold text-[#2C3E50]">{tp("single_price")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">{tp("double_with_breakfast")}</span>
                  <span className="font-bold text-[#2C3E50]">{tp("double_price")}</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-4">{tp("apartments")}</h3>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">{tp("apartments")}</span>
                <span className="font-bold text-[#2C3E50]">{tp("apartment_per_day")}</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">{tp("breakfast_addon")}</p>
            </motion.div>

            <motion.div {...fadeInUp} className="bg-[#C5A55A]/10 rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-4">{tp("discounts")}</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• {tp("child_0_4")}</li>
                <li>• {tp("child_4_14")}</li>
                <li>• {tp("adult_14_99")}</li>
              </ul>
            </motion.div>

            <motion.div {...fadeInUp} className="bg-[#2C3E50] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-heading font-bold mb-3">{tp("includes")}</h3>
              <p className="text-white/80">{tp("includes_list")}</p>
            </motion.div>

            <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-4">{tp("new_year")}</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• {tp("new_year_min")}</li>
                <li>• {tp("new_year_gala")}</li>
                <li>• {tp("new_year_child_free")}</li>
                <li>• {tp("new_year_child_discount")}</li>
              </ul>
            </motion.div>

            <p className="text-xs text-gray-400 text-center">{tp("all_prices_note")}</p>
          </div>
        </div>
      </section>

      {/* ===== KONTAKT (CONTACT) ===== */}
      <section id="kontakt" className="py-20 bg-[#FAF8F5] scroll-mt-[70px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{tc("hero_label")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50]">{tc("title")}</h2>
            <p className="text-gray-500 mt-3">{tc("subtitle")}</p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {[
              { icon: MapPin, label: "Malovan bb", sub: "80 320 Kupres, BiH" },
              { icon: Phone, label: "+387 34 275 102", sub: tc("reservations") },
              { icon: Mail, label: "recepcija@hotel-jezero.com", sub: tc("email") },
              { icon: Clock, label: tc("reception"), sub: tc("available") },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2C3E50]/10 mb-2"><Icon className="w-5 h-5 text-[#2C3E50]" /></div>
                  <p className="text-sm font-bold text-[#2C3E50]">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Map + Info */}
            <motion.div {...fadeInUp}>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-[#2C3E50]" /></div>
                  <div><h3 className="font-semibold text-[#2C3E50] text-sm uppercase tracking-wider mb-1">{tc("address")}</h3><p className="text-gray-600 text-sm">Hotel Jezero<br />Malovan bb<br />80 320 Kupres, BiH</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-[#2C3E50]" /></div>
                  <div><h3 className="font-semibold text-[#2C3E50] text-sm uppercase tracking-wider mb-1">{tc("phone_reservations")}</h3><p className="text-sm"><a href="tel:+38734275102" className="text-gray-600 hover:text-[#C5A55A] transition">+387 34 275 102</a></p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-[#2C3E50]" /></div>
                  <div><h3 className="font-semibold text-[#2C3E50] text-sm uppercase tracking-wider mb-1">{tc("email_reservations")}</h3><p className="text-sm"><a href="mailto:recepcija@hotel-jezero.com" className="text-[#C5A55A] hover:underline">recepcija@hotel-jezero.com</a></p></div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-[280px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2878!2d17.21652!3d43.94735!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDU2JzUwLjUiTiAxN8KwMTInNTkuNSJF!5e0!3m2!1shr!2sba"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Jezero - Čajuša, Kupres"
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h3 className="text-2xl font-heading font-bold text-[#2C3E50] mb-2">{tc("form_subtitle")}</h3>
              <p className="text-gray-500 text-sm mb-6">{tc("form_description")}</p>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="_hp" autoComplete="off" tabIndex={-1} aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }} />
                <input type="hidden" name="_t" value={formTimestamp} />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider">{tc("last_name")} *</label><input type="text" name="prezime" required className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] outline-none transition" /></div>
                  <div><label className="block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider">{tc("first_name")} *</label><input type="text" name="ime" required className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] outline-none transition" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider">{tc("email_address")} *</label><input type="email" name="email" required className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] outline-none transition" /></div>
                <div><label className="block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider">{tc("confirm_email")} *</label><input type="email" name="emailConfirm" required className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] outline-none transition" /></div>
                <div><label className="block text-xs font-semibold text-[#2C3E50] mb-1.5 uppercase tracking-wider">{tc("your_message")} *</label><textarea name="poruka" rows={4} required minLength={10} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] outline-none transition resize-none" /></div>
                {status && (
                  <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                    {status.type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <span>{status.message}</span>
                  </div>
                )}
                <button type="submit" disabled={sending} className="w-full bg-[#2C3E50] hover:bg-[#1C2833] disabled:opacity-50 text-white font-semibold py-3.5 px-8 rounded-lg transition-all text-sm">
                  {sending ? tc("sending") : tc("send_message")}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== BOOKING ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{tb("section_title")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50] mb-3">{tb("section_subtitle")}</h2>
            <p className="text-gray-500 text-sm">{tb("section_desc")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl shadow-lg p-6 md:p-8"><BookingForm /></motion.div>
        </div>
      </section>
    </main>
  );
}
