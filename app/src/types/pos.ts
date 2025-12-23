/**
 * POS API Types - Defines structures for communication with POS system
 */

// Register (restaurant) info returned by POS
export interface POSRegister {
  _id: string
  name: string
  address?: string
  description?: string
  currency: string
  image?: string
  tables?: POSTable[]
  openingTimes?: POSOpeningTime[]
  gastropay?: {
    enabled: boolean
    comgateMerchantId?: string
  }
}

export interface POSTable {
  _id: string
  name: string
  capacity?: number
}

export interface POSOpeningTime {
  day: number // 0-6 (Sunday-Saturday)
  open: string // "HH:MM"
  close: string // "HH:MM"
  closed?: boolean
}

// Menu category
export interface POSCategory {
  _id: string
  name: string
  description?: string
  image?: string
  order?: number
}

// Menu item (product)
export interface POSProduct {
  _id: string
  name: string
  description?: string
  price: number
  image?: string
  categoryId: string
  modifierGroups?: POSModifierGroup[]
  available?: boolean
  tags?: string[]
}

export interface POSModifierGroup {
  _id: string
  name: string
  required?: boolean
  min?: number
  max?: number
  modifiers: POSModifier[]
}

export interface POSModifier {
  _id: string
  name: string
  price: number
}

// Order types
export interface POSOrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  modifiers?: {
    modifierId: string
    name: string
    price: number
  }[]
  note?: string
}

export interface POSOrder {
  _id: string
  registerId: string
  tableId?: string
  tableName?: string
  items: POSOrderItem[]
  totalPrice: number
  status: POSOrderStatus
  paymentGate?: string
  paymentId?: string
  callingNumber?: string
  orderNumber?: string
  createdAt: string
  updatedAt?: string
}

export type POSOrderStatus =
  | "received" // Order created, pending payment
  | "calling" // Paid, sent to kitchen
  | "preparing" // Kitchen is preparing
  | "ready" // Ready for pickup
  | "completed" // Delivered/picked up
  | "cancelled" // Cancelled
  | "deleted" // Deleted

// API Response types
export interface POSResourcesResponse {
  success: boolean
  register: POSRegister
  categories: POSCategory[]
  products: POSProduct[]
}

export interface POSVerifyResponse {
  success: boolean
  register?: POSRegister
  message?: string
}

export interface POSCreateOrderResponse {
  success: boolean
  order?: POSOrder
  _id?: string
  message?: string
}

export interface POSOrderStatusResponse {
  success: boolean
  order?: POSOrder
  message?: string
}
