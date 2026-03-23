"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const images = [
  "/images/hotel-jezero2.jpg", "/images/hotel-jezero3.jpg", "/images/hotel-jezero4.jpg",
  "/images/hotel-jezero5.jpg", "/images/hotel-jezero6.jpg", "/images/hotel-jezero7.jpg",
  "/images/hotel-jezero8.jpg", "/images/hotel-jezero9.jpg", "/images/hotel-jezero10.jpg",
  "/images/hotel-jezero11.jpg", "/images/hotel-jezero12.jpg", "/images/restoran2.jpg",
];

export default function GalerijaPage() {
  const t = useTranslations("gallery");
  return (
    <main>
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <Image src="/images/hotel-jezero7.jpg" alt={t("title")} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2833] via-[#1C2833]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block text-[#C5A55A] text-xs tracking-[0.25em] uppercase font-semibold mb-3">{t("subtitle")}</span>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">{t("title")}</h1>
              <p className="mt-3 text-lg text-white/70">{t("description")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="relative h-48 md:h-56 rounded-xl overflow-hidden group cursor-pointer">
                <Image src={img} alt={`Hotel Jezero ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#2C3E50]/0 group-hover:bg-[#2C3E50]/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
