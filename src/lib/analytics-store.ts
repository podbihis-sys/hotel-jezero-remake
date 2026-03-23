import { getRedis } from "./redis";

const ANALYTICS_KEY = "jezero:analytics";

interface PageView {
  path: string;
  count: number;
  label: string;
}

interface AnalyticsData {
  pageViews: PageView[];
  totalVisits: number;
  lastUpdated: string;
  dailyViews?: Record<string, number>;
}

const DEFAULT_DATA: AnalyticsData = {
  pageViews: [],
  totalVisits: 0,
  lastUpdated: new Date().toISOString(),
  dailyViews: {},
};

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const redis = getRedis();
    const data = await redis.get<AnalyticsData>(ANALYTICS_KEY);
    return data || DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function trackPageView(pagePath: string): Promise<void> {
  try {
    const redis = getRedis();
    const data = await getAnalytics();
    const normalized = pagePath === "" ? "/" : pagePath.replace(/\/$/, "") || "/";

    const existing = data.pageViews.find((p) => p.path === normalized);
    if (existing) {
      existing.count++;
    } else {
      const label =
        normalized
          .replace(/^\//, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "Pocetna";
      data.pageViews.push({ path: normalized, count: 1, label });
    }
    data.totalVisits++;
    const today = new Date().toISOString().slice(0, 10);
    if (!data.dailyViews) data.dailyViews = {};
    data.dailyViews[today] = (data.dailyViews[today] || 0) + 1;
    data.lastUpdated = new Date().toISOString();
    await redis.set(ANALYTICS_KEY, data);
  } catch {
    // Silently fail
  }
}
