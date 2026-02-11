import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions migrated from client/src/utils/functions.js
 */

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for Czech locale
 */
export function formatCurrency(amount: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Generate a unique ID for orders
 */
export function generateOrderRef(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Extract subdomain from hostname
 */
export function getSubdomain(hostname: string): string | null {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "gastropay.cz"
  if (!hostname.endsWith(appDomain)) return null

  const subdomain = hostname.replace(`.${appDomain}`, "").split(":")[0]
  if (subdomain === appDomain || subdomain === "www") return null

  return subdomain
}

/**
 * Check if current time is within opening hours
 */
export function isOpening(from: string, to: string): boolean {
  const now = new Date()
  const [fromHours, fromMinutes] = from.split(":").map(Number)
  const [toHours, toMinutes] = to.split(":").map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openingMinutes = fromHours * 60 + fromMinutes
  const closingMinutes = toHours * 60 + toMinutes

  return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes
}

/**
 * Calculate cart totals
 */
export interface CartItem {
  id: string
  ean: string
  name: string
  price: number
  quantity: number
}

export interface CartTotals {
  totalQuantity: number
  totalPrice: number
}

export function calculateCart(cartItems: CartItem[]): CartTotals {
  let totalQuantity = 0
  let totalPrice = 0

  cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price
    totalQuantity += item.quantity
  })

  return {
    totalQuantity,
    totalPrice: Math.round(totalPrice),
  }
}

/**
 * Validate Czech ICO (business identification number)
 * https://cs.wikipedia.org/wiki/Identifikační_číslo_osoby
 */
export function checkICO(ico: string): boolean {
  try {
    const regex = /^\d{8}$/
    if (!regex.test(ico)) {
      return false
    }

    let sum = 0
    const numberArray = ico.split("")
    for (let weight = 0; weight < numberArray.length - 1; weight++) {
      sum += parseInt(numberArray[weight]) * (numberArray.length - weight)
    }
    sum = sum % 11
    const x = (11 - sum) % 10
    return x === parseInt(numberArray.slice(-1)[0])
  } catch {
    return false
  }
}

/**
 * Generate a random valid Czech ICO
 */
export function generateRandomIco(): string {
  const randomNum = Math.floor(Math.random() * 9000000) + 1000000
  const numberArray = randomNum.toString().split("")
  let sum = 0
  for (let weight = 0; weight < numberArray.length; weight++) {
    sum += parseInt(numberArray[weight]) * (numberArray.length + 1 - weight)
  }
  sum = sum % 11
  numberArray.push(String((11 - sum) % 10))
  return numberArray.join("")
}

/**
 * Add trailing slash to URL
 */
export function addSlashAfterUrl(url: string): string {
  if (url && !url.endsWith("/")) {
    return url + "/"
  }
  return url
}

/**
 * Remove trailing slash from URL
 */
export function removeSlashFromUrl(url: string): string {
  if (url.endsWith("/")) {
    return url.replace(/\/+$/, "")
  }
  return url
}

/**
 * Convert string to valid filename
 */
export function stringToValidFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9._-]/g, "_")
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if URL points to an image
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pattern = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
    return pattern.test(urlObj.pathname)
  } catch {
    return false
  }
}

/**
 * Get current day of week (0 = Sunday, 6 = Saturday)
 */
export function getCurrentDayIndex(): number {
  return new Date().getDay()
}

/**
 * Get current day name in English (lowercase)
 */
export function getCurrentDayName(): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]
  return days[new Date().getDay()]
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Delay helper (for rate limiting, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
