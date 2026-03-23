"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group shadow-card hover:shadow-card-hover transition-all duration-300"
            onClick={() => setSelectedIndex(index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-accent transition-colors z-50"
            onClick={() => setSelectedIndex(null)}
            aria-label="Zatvori"
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light hover:text-accent transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
            }}
            aria-label="Prethodna"
          >
            &#8249;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light hover:text-accent transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
            }}
            aria-label="Sljedeća"
          >
            &#8250;
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/10]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;
