/**
 * Application constants
 * Migrated from client/src/utils/constants.js
 */

export const DAYS_OF_WEEKS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

export const DAYS_OF_WEEKS_CZECH: Record<
  string,
  { name: string; short: string }
> = {
  monday: { name: "Pondělí", short: "Po" },
  tuesday: { name: "Úterý", short: "Út" },
  wednesday: { name: "Středa", short: "St" },
  thursday: { name: "Čtvrtek", short: "Čt" },
  friday: { name: "Pátek", short: "Pá" },
  saturday: { name: "Sobota", short: "So" },
  sunday: { name: "Neděle", short: "Ne" },
}

export const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  calling: "bg-blue-100 text-blue-800",
  processing: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
}

export const PAYMENT_GATES_NAME: Record<string, string> = {
  comgate: "Comgate",
  csob: "ČSOB",
}

export const ORDER_STATUS = {
  PENDING: "pending",
  CALLING: "calling",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
