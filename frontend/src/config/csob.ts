/**
 * ČSOB payment gateway configuration
 * Migrated from client/src/config/csob.js
 */

export const CSOB = {
  LANGUAGES: [
    "cs",
    "en",
    "de",
    "fr",
    "hu",
    "it",
    "ja",
    "pl",
    "pt",
    "ro",
    "ru",
    "sk",
    "es",
    "tr",
    "vi",
    "hr",
    "sl",
    "sv",
  ],
  CURRENCIES: [
    "CZK",
    "EUR",
    "PLN",
    "HUF",
    "USD",
    "GBP",
    "RON",
    "NOK",
    "SEK",
  ],
  PAY_OPERATIONS: ["payment", "oneclickPayment", "customPayment"],
  PAYMENT_METHODS: ["card", "card#LVP"],
  TIME_EXPIRATION: 1800,
  PRODUCTION_URL: "https://api.platebnibrana.csob.cz/api/v1.9",
  TEST_URL: "https://iapi.iplatebnibrana.csob.cz/api/v1.9",
} as const

export const CSOB_MICROSTATE: Record<number, string> = {
  1: "Platba založena",
  2: "Platba probíhá",
  3: "Platba zrušena",
  4: "Platba potvrzena",
  5: "Platba odvolána",
  6: "Platba zamítnuta",
  7: "Čekání na zúčtování",
  8: "Platba zúčtována",
  9: "Zpracování vrácení",
  10: "Platba vrácena",
}

export type CsobLanguage = (typeof CSOB.LANGUAGES)[number]
export type CsobCurrency = (typeof CSOB.CURRENCIES)[number]
export type CsobPayOperation = (typeof CSOB.PAY_OPERATIONS)[number]
export type CsobPaymentMethod = (typeof CSOB.PAYMENT_METHODS)[number]
