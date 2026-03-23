"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
}

export function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  return (
    <section className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={backgroundImage}
        alt={title}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-heading font-bold text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-lg md:text-xl text-white/80 font-accent max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}

export default PageHeader;
