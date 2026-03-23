const BASE_URL = "https://hotel-jezero.vercel.app";
type LocaleKey = "hr" | "en" | "de" | "it";

const meta: Record<string, Record<LocaleKey, { title: string; description: string; image?: string }>> = {
  "": {
    hr: { title: "Hotel Jezero | Premium Hotel | Kupres, BiH", description: "Hotel Jezero u Kupresu — 82 ležaja, restoran s 200 mjesta, sauna, bazen, teretana.", image: "/images/hotel-jezero5.jpg" },
    en: { title: "Hotel Jezero | Premium Hotel | Kupres, BiH", description: "Hotel Jezero in Kupres — 82 beds, 200-seat restaurant, sauna, pool, gym.", image: "/images/hotel-jezero5.jpg" },
    de: { title: "Hotel Jezero | Premium Hotel | Kupres, BiH", description: "Hotel Jezero in Kupres — 82 Betten, Restaurant mit 200 Plätzen, Sauna, Pool, Fitness.", image: "/images/hotel-jezero5.jpg" },
    it: { title: "Hotel Jezero | Premium Hotel | Kupres, BiH", description: "Hotel Jezero a Kupres — 82 posti letto, ristorante da 200 posti, sauna, piscina, palestra.", image: "/images/hotel-jezero5.jpg" },
  },
  "sobe": {
    hr: { title: "Sobe i Apartmani | Hotel Jezero Kupres", description: "Udobne sobe i apartmani u Hotelu Jezero.", image: "/images/soba2.jpg" },
    en: { title: "Rooms & Apartments | Hotel Jezero Kupres", description: "Comfortable rooms and apartments at Hotel Jezero.", image: "/images/soba2.jpg" },
    de: { title: "Zimmer & Apartments | Hotel Jezero Kupres", description: "Komfortable Zimmer und Apartments im Hotel Jezero.", image: "/images/soba2.jpg" },
    it: { title: "Camere e Appartamenti | Hotel Jezero Kupres", description: "Camere e appartamenti confortevoli all'Hotel Jezero.", image: "/images/soba2.jpg" },
  },
  "galerija": {
    hr: { title: "Galerija | Hotel Jezero Kupres", description: "Fotografije Hotela Jezero.", image: "/images/hotel-jezero7.jpg" },
    en: { title: "Gallery | Hotel Jezero Kupres", description: "Photos of Hotel Jezero.", image: "/images/hotel-jezero7.jpg" },
    de: { title: "Galerie | Hotel Jezero Kupres", description: "Fotos vom Hotel Jezero.", image: "/images/hotel-jezero7.jpg" },
    it: { title: "Galleria | Hotel Jezero Kupres", description: "Foto dell'Hotel Jezero.", image: "/images/hotel-jezero7.jpg" },
  },
  "cjenik": {
    hr: { title: "Cjenik | Hotel Jezero Kupres", description: "Cijene smještaja u Hotelu Jezero.", image: "/images/hotel-jezero6.jpg" },
    en: { title: "Pricing | Hotel Jezero Kupres", description: "Accommodation prices at Hotel Jezero.", image: "/images/hotel-jezero6.jpg" },
    de: { title: "Preise | Hotel Jezero Kupres", description: "Unterkunftspreise im Hotel Jezero.", image: "/images/hotel-jezero6.jpg" },
    it: { title: "Prezzi | Hotel Jezero Kupres", description: "Prezzi alloggio all'Hotel Jezero.", image: "/images/hotel-jezero6.jpg" },
  },
  "kontakt": {
    hr: { title: "Kontakt | Hotel Jezero Kupres", description: "Kontaktirajte Hotel Jezero.", image: "/images/hotel-jezero8.jpg" },
    en: { title: "Contact | Hotel Jezero Kupres", description: "Contact Hotel Jezero.", image: "/images/hotel-jezero8.jpg" },
    de: { title: "Kontakt | Hotel Jezero Kupres", description: "Kontaktieren Sie Hotel Jezero.", image: "/images/hotel-jezero8.jpg" },
    it: { title: "Contatto | Hotel Jezero Kupres", description: "Contatta Hotel Jezero.", image: "/images/hotel-jezero8.jpg" },
  },
};

const localeMap: Record<string, string> = { hr: "bs_BA", en: "en_US", de: "de_DE", it: "it_IT" };

export function getPageMetadata(slug: string, locale: string) {
  const localeKey = (locale as LocaleKey) || "hr";
  const pageMeta = meta[slug]?.[localeKey] || meta[""]?.[localeKey] || meta[""]["hr"];
  const path = slug ? `/${slug}` : "";
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    openGraph: {
      title: pageMeta.title, description: pageMeta.description, type: "website" as const,
      locale: localeMap[locale] || "bs_BA", siteName: "Hotel Jezero", url: `${BASE_URL}/${locale}${path}`,
      images: pageMeta.image ? [{ url: `${BASE_URL}${pageMeta.image}`, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image" as const, title: pageMeta.title, description: pageMeta.description },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries((["hr", "en", "de", "it"] as const).map((l) => [l, `${BASE_URL}/${l}${path}`])),
    },
  };
}
