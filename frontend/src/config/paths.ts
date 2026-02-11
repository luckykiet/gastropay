/**
 * Route path constants
 * Migrated from client/src/config/paths.js
 * Adapted for Next.js App Router structure
 */

export const PATHS = {
  // Guest paths
  HOME: "/",
  RESTAURANTS: "/restaurants",
  RESTAURANT: "/restaurant",
  MENU: "/menu",
  PAYMENT: "/payment",
  TRANSACTION: "/transaction",

  // Auth paths
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",

  // Merchant paths
  MERCHANT: "/merchant",
  MERCHANT_DASHBOARD: "/merchant/dashboard",
  MERCHANT_PROFILE: "/merchant/profile",
  MERCHANT_ORDERS: "/merchant/orders",
  MERCHANT_SETTINGS: "/merchant/settings",

  // Register-based paths (new flow for POS integration)
  REG_BASE: "/reg",
  REG_ORDER: "/order",
  REG_PAYMENT_SUCCESS: "/payment/success",
  REG_PAYMENT_CANCEL: "/payment/cancel",
} as const

export type RoutePath = (typeof PATHS)[keyof typeof PATHS]

/**
 * Build a register-based path
 */
export function buildRegPath(
  registerId: string,
  subPath?: "order" | "payment/success" | "payment/cancel"
): string {
  const base = `${PATHS.REG_BASE}/${registerId}`
  return subPath ? `${base}/${subPath}` : base
}

/**
 * Build a restaurant path
 */
export function buildRestaurantPath(restaurantId: string): string {
  return `${PATHS.RESTAURANT}/${restaurantId}`
}

/**
 * Build a transaction path
 */
export function buildTransactionPath(transactionId: string): string {
  return `${PATHS.TRANSACTION}/${transactionId}`
}
