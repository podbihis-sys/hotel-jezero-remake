"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function CjenikPage() {
  const t = useTranslations("pricing");
  return (
    <main>
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <Image src="/images/hotel-jezero6.jpg" alt={t("title")} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2833] via-[#1C2833]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block text-[#C5A55A] text-xs tracking-[0.25em] uppercase font-semibold mb-3">{t("subtitle")}</span>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">{t("title")}</h1>
              <p className="mt-3 text-lg text-white/70">{t("hero_desc")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Standard Rooms */}
          <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-[#2C3E50] mb-6">{t("standard_rooms")}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">{t("single_with_breakfast")}</span>
                <span className="font-bold text-[#2C3E50]">{t("single_price")}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">{t("double_with_breakfast")}</span>
                <span className="font-bold text-[#2C3E50]">{t("double_price")}</span>
              </div>
            </div>
          </motion.div>

          {/* Apartments */}
          <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-[#2C3E50] mb-6">{t("apartments")}</h2>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">{t("apartments")}</span>
              <span className="font-bold text-[#2C3E50]">{t("apartment_per_day")}</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">{t("breakfast_addon")}</p>
          </motion.div>

          {/* Discounts */}
          <motion.div {...fadeInUp} className="bg-[#C5A55A]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-[#2C3E50] mb-6">{t("discounts")}</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• {t("child_0_4")}</li>
              <li>• {t("child_4_14")}</li>
              <li>• {t("adult_14_99")}</li>
            </ul>
          </motion.div>

          {/* Included */}
          <motion.div {...fadeInUp} className="bg-[#2C3E50] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-heading font-bold mb-4">{t("includes")}</h2>
            <p className="text-white/80">{t("includes_list")}</p>
          </motion.div>

          {/* New Year */}
          <motion.div {...fadeInUp} className="bg-[#FAF8F5] rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-[#2C3E50] mb-6">{t("new_year")}</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• {t("new_year_min")}</li>
              <li>• {t("new_year_gala")}</li>
              <li>• {t("new_year_child_free")}</li>
              <li>• {t("new_year_child_discount")}</li>
            </ul>
          </motion.div>

          {/* Tax */}
          <motion.div {...fadeInUp} className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-lg font-heading font-bold text-[#2C3E50] mb-4">{t("residence_tax")}</h2>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• {t("tax_under_12")}</li>
              <li>• {t("tax_12_26")}</li>
              <li>• {t("tax_over_26")}</li>
            </ul>
            <p className="text-xs text-gray-400 mt-4">{t("all_prices_note")}</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
