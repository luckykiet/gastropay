/**
 * Auth Store - Manages authentication state
 * Migrated from client/src/stores/MerchantStores.js
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface MerchantPaymentGate {
  paymentGate: string
  test: boolean
}

export interface MerchantUser {
  _id: string
  email: string
  name?: string
  ico?: string
  restaurantId?: string
  paymentGates?: MerchantPaymentGate[]
}

interface AuthState {
  token: string | null
  user: MerchantUser | null
  isAuthenticated: boolean

  // Actions
  setAuth: (token: string, user: MerchantUser) => void
  clearAuth: () => void
  updateUser: (user: Partial<MerchantUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },
    }),
    {
      name: "gastropay-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hooks for convenience
export const useToken = () => useAuthStore((state) => state.token)
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated)
export const useSetAuth = () => useAuthStore((state) => state.setAuth)
export const useClearAuth = () => useAuthStore((state) => state.clearAuth)
