export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: number;
}

const STORAGE_KEY = "cookie_consent_v2";
const CURRENT_VERSION = 1;

export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean, marketing: boolean): void {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event("cookie-consent-update"));
}

export function hasConsent(category: "analytics" | "marketing"): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent[category];
}

export function clearConsent(): void {
  localStorage.removeItem(STORAGE_KEY);
}
