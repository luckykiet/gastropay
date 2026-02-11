/**
 * API endpoint constants
 * Migrated from client/src/config/api.js
 */

export const API = {
  // Auth endpoints
  AUTH: "auth",
  LOGIN: "login",
  REGISTER: "register",
  LOGOUT: "logout",
  REFRESH_TOKEN: "refresh",
  VERIFY: "verify",
  CHECK: "check",
  RESET_PASSWORD: "resetPassword",

  // Restaurant endpoints
  RESTAURANT: "restaurant",

  // Merchant endpoints
  MERCHANT: "merchant",

  // Transaction endpoints
  TRANSACTION: "transaction",
  PAYMENT_METHODS: "paymentMethods",

  // Proxy endpoint
  PROXY: "proxy",

  // Table endpoints
  TABLE: "table",
} as const

export type ApiEndpoint = (typeof API)[keyof typeof API]
