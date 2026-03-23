"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function SobePage() {
  const t = useTranslations("rooms");
  const tc = useTranslations("common");
  const locale = useLocale();

  const rooms = [
    { image: "/images/soba2.jpg", title: t("double_room"), desc: t("double_desc") },
    { image: "/images/soba3.jpg", title: t("triple_room"), desc: t("triple_desc") },
    { image: "/images/soba4.jpg", title: t("apartment"), desc: t("apartment_desc") },
  ];

  const amenities = [t("amenity_sauna"), t("amenity_pool"), t("amenity_gym"), t("amenity_table_tennis")];

  return (
    <main>
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <Image src="/images/hotel-jezero4.jpg" alt={t("title")} fill className="object-cover" priority />
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.15 }} className="bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                <div className="relative h-56"><Image src={room.image} alt={room.title} fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-[#2C3E50] mb-2">{room.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{room.desc}</p>
                  <Link href={`/${locale}/kontakt`} className="text-[#C5A55A] font-semibold text-sm hover:text-[#B8963F] transition">{t("book_room")} &rarr;</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#2C3E50]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-8">{t("amenities_title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {amenities.map((a, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-5"><p className="text-white font-semibold">{a}</p></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
