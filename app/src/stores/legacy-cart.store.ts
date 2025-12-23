/**
 * Legacy Cart Store - For backward compatibility with old guest flow
 * Migrated from client/src/stores/ZustandStores.js
 * Uses EAN-based product identification (original system)
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"

export interface LegacyCartItem {
  id: string
  ean: string
  name: string
  price: number
  quantity: number
}

interface LegacyCartState {
  cartItems: LegacyCartItem[]

  // Actions
  addToCartItems: (
    item: { ean: string; name: string; price: number },
    quantity?: number
  ) => void
  removeCartItem: (id: string) => void
  increaseCartItem: (id: string) => void
  decreaseCartItem: (id: string) => void
  setCartItems: (items: LegacyCartItem[]) => void
  clearCart: () => void

  // Computed
  getTotalQuantity: () => number
  getTotalPrice: () => number
}

export const useLegacyCartStore = create<LegacyCartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCartItems: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.cartItems.findIndex(
            (i) => i.ean === item.ean
          )

          if (existingIndex >= 0) {
            const newItems = [...state.cartItems]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            }
            return { cartItems: newItems }
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                id: nanoid(),
                ean: item.ean,
                name: item.name,
                price: item.price,
                quantity,
              },
            ],
          }
        })
      },

      removeCartItem: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }))
      },

      increaseCartItem: (id) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }))
      },

      decreaseCartItem: (id) => {
        set((state) => {
          const item = state.cartItems.find((i) => i.id === id)
          if (!item) return state

          if (item.quantity <= 1) {
            return {
              cartItems: state.cartItems.filter((i) => i.id !== id),
            }
          }

          return {
            cartItems: state.cartItems.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            ),
          }
        })
      },

      setCartItems: (items) => {
        set({ cartItems: items })
      },

      clearCart: () => {
        set({ cartItems: [] })
      },

      getTotalQuantity: () => {
        const { cartItems } = get()
        return cartItems.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const { cartItems } = get()
        return Math.round(
          cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          )
        )
      },
    }),
    {
      name: "gastropay-legacy-cart",
    }
  )
)

// Hooks for convenience (matching original ZustandStores pattern)
export const useCartItems = () =>
  useLegacyCartStore((state) => state.cartItems)
export const useSetCartItems = () =>
  useLegacyCartStore((state) => state.setCartItems)
export const useAddToCartItem = () =>
  useLegacyCartStore((state) => state.addToCartItems)
export const useRemoveCartItem = () =>
  useLegacyCartStore((state) => state.removeCartItem)
export const useIncreaseCartItem = () =>
  useLegacyCartStore((state) => state.increaseCartItem)
export const useDecreaseCartItem = () =>
  useLegacyCartStore((state) => state.decreaseCartItem)
