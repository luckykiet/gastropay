/**
 * i18n Routing Configuration
 */

import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["cs", "en", "vi"],
  defaultLocale: "cs",
  localePrefix: "as-needed", // Only show locale prefix for non-default locales
})

export type Locale = (typeof routing.locales)[number]
