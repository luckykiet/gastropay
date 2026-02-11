/**
 * Store exports
 * Central export for all Zustand stores
 */

// Modern POS-based cart (for /reg/[registerId] flow)
export * from "./cart.store"

// Table session management
export * from "./table-session.store"

// Restaurant state (for traditional guest flow)
export * from "./restaurant.store"

// Legacy cart (EAN-based, for backward compatibility)
export * from "./legacy-cart.store"

// Authentication
export * from "./auth.store"
