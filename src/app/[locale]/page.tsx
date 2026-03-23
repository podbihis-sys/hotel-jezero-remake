"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale();

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

  const galleryImages = [
    "/images/hotel-jezero3.jpg",
    "/images/hotel-jezero4.jpg",
    "/images/hotel-jezero6.jpg",
    "/images/hotel-jezero7.jpg",
  ];

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
        <Image src="/images/hotel-jezero5.jpg" alt="Hotel Jezero" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2833] via-[#1C2833]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block text-[#C5A55A] text-xs tracking-[0.3em] uppercase font-semibold mb-4">Hotel Jezero Kupres</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight">{t("hero_title")}</h1>
              <p className="mt-4 text-lg md:text-xl text-white/70 max-w-xl">{t("hero_subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/${locale}/sobe`} className="bg-[#C5A55A] hover:bg-[#B8963F] text-white font-semibold px-8 py-3.5 rounded-lg transition-all text-sm">
                  {tc("book_now")}
                </Link>
                <Link href={`/${locale}/galerija`} className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-lg transition-all text-sm">
                  {tc("gallery")}
                </Link>
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
              <Link href={`/${locale}/kontakt`} className="inline-flex items-center gap-2 bg-[#2C3E50] hover:bg-[#1C2833] text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                {tc("contact_us")}
              </Link>
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

      {/* ===== GALLERY PREVIEW ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="inline-block text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-semibold mb-3">{t("gallery_title")}</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#2C3E50]">{t("gallery_subtitle")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="relative h-48 md:h-64 rounded-xl overflow-hidden group">
                <Image src={img} alt={`Hotel Jezero ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#2C3E50]/0 group-hover:bg-[#2C3E50]/20 transition-colors" />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={`/${locale}/galerija`} className="inline-flex items-center gap-2 text-[#C5A55A] font-semibold hover:text-[#B8963F] transition text-sm">
              {t("view_gallery")} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
