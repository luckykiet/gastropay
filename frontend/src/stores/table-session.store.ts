/**
 * Table Session Store - Manages live table sessions
 * Allows customers to place multiple orders at the same table
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TableOrder {
  orderId: string
  status: string
  totalPrice: number
  createdAt: string
  paidAt?: string
}

interface TableSessionState {
  sessionId: string | null
  registerId: string | null
  tableId: string | null
  tableName: string | null
  orders: TableOrder[]
  startedAt: string | null

  // Actions
  startSession: (registerId: string, tableId: string, tableName: string) => void
  addOrder: (order: TableOrder) => void
  updateOrderStatus: (orderId: string, status: string, paidAt?: string) => void
  endSession: () => void
  isActive: () => boolean

  // Computed
  getUnpaidOrders: () => TableOrder[]
  getUnpaidTotal: () => number
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useTableSessionStore = create<TableSessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      registerId: null,
      tableId: null,
      tableName: null,
      orders: [],
      startedAt: null,

      startSession: (registerId, tableId, tableName) => {
        const state = get()

        // If session exists for same table, keep it
        if (
          state.sessionId &&
          state.registerId === registerId &&
          state.tableId === tableId
        ) {
          return
        }

        // Start new session
        set({
          sessionId: generateSessionId(),
          registerId,
          tableId,
          tableName,
          orders: [],
          startedAt: new Date().toISOString(),
        })
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }))
      },

      updateOrderStatus: (orderId, status, paidAt) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status, paidAt } : o
          ),
        }))
      },

      endSession: () => {
        set({
          sessionId: null,
          registerId: null,
          tableId: null,
          tableName: null,
          orders: [],
          startedAt: null,
        })
      },

      isActive: () => {
        const { sessionId, startedAt } = get()
        if (!sessionId || !startedAt) return false

        // Session expires after 4 hours
        const sessionAge = Date.now() - new Date(startedAt).getTime()
        const fourHours = 4 * 60 * 60 * 1000
        return sessionAge < fourHours
      },

      getUnpaidOrders: () => {
        const { orders } = get()
        return orders.filter(
          (o) => !o.paidAt && o.status !== "cancelled" && o.status !== "deleted"
        )
      },

      getUnpaidTotal: () => {
        const unpaidOrders = get().getUnpaidOrders()
        return unpaidOrders.reduce((total, o) => total + o.totalPrice, 0)
      },
    }),
    {
      name: "gastropay-table-session",
    }
  )
)
