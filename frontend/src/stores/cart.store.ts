/**
 * Cart Store - Manages shopping cart state with Zustand
 * Persists to localStorage for session continuity
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItemModifier {
  modifierId: string
  name: string
  price: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  modifiers: CartItemModifier[]
  note?: string
  image?: string
}

interface CartState {
  items: CartItem[]
  registerId: string | null
  tableId: string | null
  tableName: string | null

  // Actions
  setRegister: (registerId: string) => void
  setTable: (tableId: string, tableName: string) => void
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  updateQuantity: (productId: string, modifiers: CartItemModifier[], quantity: number) => void
  removeItem: (productId: string, modifiers: CartItemModifier[]) => void
  clearCart: () => void

  // Computed
  getTotal: () => number
  getItemCount: () => number
  getItemsForPOS: () => Array<{
    productId: string
    name: string
    quantity: number
    price: number
    modifiers?: Array<{ modifierId: string; name: string; price: number }>
    note?: string
  }>
}

/**
 * Create unique key for cart item based on product and modifiers
 */
function getItemKey(productId: string, modifiers: CartItemModifier[]): string {
  const modifierIds = modifiers
    .map((m) => m.modifierId)
    .sort()
    .join("-")
  return `${productId}:${modifierIds}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      registerId: null,
      tableId: null,
      tableName: null,

      setRegister: (registerId) => {
        const state = get()
        // Clear cart if switching registers
        if (state.registerId && state.registerId !== registerId) {
          set({ items: [], registerId, tableId: null, tableName: null })
        } else {
          set({ registerId })
        }
      },

      setTable: (tableId, tableName) => {
        set({ tableId, tableName })
      },

      addItem: (item) => {
        set((state) => {
          const itemKey = getItemKey(item.productId, item.modifiers)
          const existingIndex = state.items.findIndex(
            (i) => getItemKey(i.productId, i.modifiers) === itemKey
          )

          if (existingIndex >= 0) {
            // Update quantity of existing item
            const newItems = [...state.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + (item.quantity || 1),
            }
            return { items: newItems }
          }

          // Add new item
          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          }
        })
      },

      updateQuantity: (productId, modifiers, quantity) => {
        set((state) => {
          const itemKey = getItemKey(productId, modifiers)

          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => getItemKey(i.productId, i.modifiers) !== itemKey
              ),
            }
          }

          return {
            items: state.items.map((i) =>
              getItemKey(i.productId, i.modifiers) === itemKey
                ? { ...i, quantity }
                : i
            ),
          }
        })
      },

      removeItem: (productId, modifiers) => {
        set((state) => {
          const itemKey = getItemKey(productId, modifiers)
          return {
            items: state.items.filter(
              (i) => getItemKey(i.productId, i.modifiers) !== itemKey
            ),
          }
        })
      },

      clearCart: () => {
        set({ items: [], tableId: null, tableName: null })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const modifiersTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0)
          return total + (item.price + modifiersTotal) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      getItemsForPOS: () => {
        const { items } = get()
        return items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers.length > 0 ? item.modifiers : undefined,
          note: item.note,
        }))
      },
    }),
    {
      name: "gastropay-cart",
      partialize: (state) => ({
        items: state.items,
        registerId: state.registerId,
        tableId: state.tableId,
        tableName: state.tableName,
      }),
    }
  )
)
