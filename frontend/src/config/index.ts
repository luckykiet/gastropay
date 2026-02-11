/**
 * Configuration index
 * Central export for all config modules
 */

export * from "./api"
export * from "./paths"
export * from "./constants"
export * from "./comgate"
export * from "./csob"

/**
 * Application configuration from environment
 */
export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "GastroPay",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  IMAGE_BASE_URL:
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    "https://res.cloudinary.com/gastropay/image/upload/",
  POS_API_URL: process.env.POS_API_URL || "https://gokasa.cz",
  POS_API_KEY: process.env.POS_API_KEY || "",
} as const
