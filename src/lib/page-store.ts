import { getRedis } from "./redis";

const PAGES_KEY = "jezero:pages";

export interface PageSection {
  id: string;
  type: "text" | "image" | "heading" | "gallery";
  content: string;
  label: string;
}

export type MenuPosition = "none" | "top" | "o-nama" | "ponuda" | "ljetna-ponuda";

export interface PageContent {
  slug: string;
  title: string;
  sections: PageSection[];
  updatedAt: string;
  menuPosition?: MenuPosition;
  menuOrder?: number;
}

// Store all pages as a hash: jezero:pages -> { slug: PageContent }

export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const redis = getRedis();
    const data = await redis.hget<PageContent>(PAGES_KEY, slug);
    return data || null;
  } catch {
    return null;
  }
}

export async function savePageContent(slug: string, content: PageContent): Promise<void> {
  const redis = getRedis();
  content.updatedAt = new Date().toISOString();
  await redis.hset(PAGES_KEY, { [slug]: content });
}

const DEFAULT_PAGES: { slug: string; title: string }[] = [
  { slug: "sobe", title: "Sobe" },
  { slug: "galerija", title: "Galerija" },
  { slug: "cjenik", title: "Cjenik" },
  { slug: "kontakt", title: "Kontakt" },
];

export async function listPages(): Promise<{ slug: string; title: string; updatedAt: string }[]> {
  try {
    const redis = getRedis();
    const all = await redis.hgetall<Record<string, PageContent>>(PAGES_KEY);

    // If Redis has pages, return them
    if (all && Object.keys(all).length > 0) {
      return Object.values(all)
        .map((content) => ({
          slug: content.slug,
          title: content.title,
          updatedAt: content.updatedAt,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
    }

    // No pages in Redis — seed with defaults
    const now = new Date().toISOString();
    const seedData: Record<string, PageContent> = {};
    for (const p of DEFAULT_PAGES) {
      seedData[p.slug] = {
        slug: p.slug,
        title: p.title,
        sections: [],
        updatedAt: now,
      };
    }
    await redis.hset(PAGES_KEY, seedData);

    return DEFAULT_PAGES.map((p) => ({ slug: p.slug, title: p.title, updatedAt: now }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export interface MenuItem {
  slug: string;
  title: string;
  menuPosition: MenuPosition;
  menuOrder: number;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const redis = getRedis();
    const all = await redis.hgetall<Record<string, PageContent>>(PAGES_KEY);
    if (!all) return [];

    return Object.values(all)
      .filter((p) => p.menuPosition && p.menuPosition !== "none")
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        menuPosition: p.menuPosition || "none",
        menuOrder: p.menuOrder ?? 99,
      }))
      .sort((a, b) => a.menuOrder - b.menuOrder);
  } catch {
    return [];
  }
}
