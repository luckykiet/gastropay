/**
 * Restaurant Store - Manages chosen restaurant state
 * Migrated from client/src/stores/ZustandStores.js
 * Used for the traditional guest flow (browsing restaurants)
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface OpeningTime {
  isOpen: boolean
  from: string
  to: string
}

export interface RestaurantAddress {
  street: string
  city: string
  postalCode: string
}

export interface RestaurantApi {
  menuUrl: string
  key: string
}

export interface Restaurant {
  _id: string
  name: string
  image?: string
  address: RestaurantAddress
  openingTime: Record<string, OpeningTime>
  api: RestaurantApi
}

export interface Table {
  id: string
  name: string
}

interface RestaurantState {
  chosenRestaurant: Restaurant | null
  tables: Table[]
  tips: number

  // Actions
  setChosenRestaurant: (restaurant: Restaurant | null) => void
  setTables: (tables: Table[]) => void
  setTips: (tips: number) => void
  clearRestaurantState: () => void
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      chosenRestaurant: null,
      tables: [],
      tips: 0,

      setChosenRestaurant: (restaurant) => {
        set({ chosenRestaurant: restaurant })
      },

      setTables: (tables) => {
        set({ tables })
      },

      setTips: (tips) => {
        set({ tips: Math.max(0, tips) })
      },

      clearRestaurantState: () => {
        set({
          chosenRestaurant: null,
          tables: [],
          tips: 0,
        })
      },
    }),
    {
      name: "gastropay-restaurant",
    }
  )
)

// Hooks for convenience (matching original ZustandStores pattern)
export const useChosenRestaurant = () =>
  useRestaurantStore((state) => state.chosenRestaurant)
export const useSetChosenRestaurant = () =>
  useRestaurantStore((state) => state.setChosenRestaurant)
export const useTables = () => useRestaurantStore((state) => state.tables)
export const useSetTables = () => useRestaurantStore((state) => state.setTables)
export const useTips = () => useRestaurantStore((state) => state.tips)
export const useSetTips = () => useRestaurantStore((state) => state.setTips)
