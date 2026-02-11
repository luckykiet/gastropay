/**
 * Comgate payment gateway configuration
 * Migrated from client/src/config/comgate.js
 */

export const COMGATE = {
  COUNTRIES: [
    "ALL",
    "AT",
    "BE",
    "CY",
    "CZ",
    "DE",
    "EE",
    "EL",
    "ES",
    "FI",
    "FR",
    "GB",
    "HR",
    "HU",
    "IE",
    "IT",
    "LT",
    "LU",
    "LV",
    "MT",
    "NL",
    "NO",
    "PL",
    "PT",
    "RO",
    "SL",
    "SK",
    "SV",
    "US",
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
  METHODS: ["ALL", "CARD_ALL", "BANK_ALL"],
  CREATE_URL: "https://payments.comgate.cz/v1.0/create",
  STATUS_URL: "https://payments.comgate.cz/v1.0/status",
} as const

export type ComgateCountry = (typeof COMGATE.COUNTRIES)[number]
export type ComgateCurrency = (typeof COMGATE.CURRENCIES)[number]
export type ComgateMethod = (typeof COMGATE.METHODS)[number]

export const COMGATE_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  AUTHORIZED: "AUTHORIZED",
} as const

export type ComgateStatus = (typeof COMGATE_STATUS)[keyof typeof COMGATE_STATUS]
