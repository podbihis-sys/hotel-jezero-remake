import { MetadataRoute } from "next";

const BASE_URL = "https://hotel-jezero.vercel.app";
const locales = ["hr", "en", "de", "it"] as const;
const staticPages = ["", "sobe", "galerija", "cjenik", "kontakt"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const page of staticPages) {
    const path = page ? `/${page}` : "";
    entries.push({
      url: `${BASE_URL}/hr${path}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}${path}`])),
      },
    });
  }
  return entries;
}
