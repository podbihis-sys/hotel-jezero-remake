import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hr", "en", "de", "it"],
  defaultLocale: "hr",
  localePrefix: "always",
});
