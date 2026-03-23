import { getRedis } from "./redis";

const SETTINGS_KEY = "jezero:settings";

export interface SiteSettings {
  piste_status: { open: boolean };
  cameras: Record<string, { name: string; url: string; active: boolean; visible: boolean }>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  piste_status: { open: false },
  cameras: {
    adriaski: { name: "Hotel Adria Ski", url: "https://g0.ipcamlive.com/player/player.php?alias=adriaski", active: false, visible: true },
    sidrokamera: { name: "Sidro / Vučnica", url: "https://g0.ipcamlive.com/player/player.php?alias=sidrokamera", active: false, visible: true },
    tikvice: { name: "Motel Tikvice", url: "https://g0.ipcamlive.com/player/player.php?alias=tikvice", active: false, visible: true },
  },
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const redis = getRedis();
    const data = await redis.get<SiteSettings>(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(key: string, value: unknown): Promise<SiteSettings> {
  const redis = getRedis();
  const current = await getSettings();
  const updated = { ...current, [key]: value };
  await redis.set(SETTINGS_KEY, updated);
  return updated;
}
