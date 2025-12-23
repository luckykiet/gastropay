# Phase 04: Customer Ordering Flow

**Status**: Pending | **Effort**: 10-12 hours | **Priority**: Critical

## Objective

Build complete customer ordering flow: menu display, cart management, table selection, order submission to POS API, and real-time status polling.

## Prerequisites

- Phase 03 completed (i18n, layouts, SEO)
- POS API client ready (Phase 02)

## Tasks

### 4.1 Cart Store (Zustand)

```typescript
// src/store/cart.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { POSArticle, POSModifier } from "@/types/pos"

interface CartItem {
  ean: string
  name: string
  price: number
  quantity: number
  note?: string
  mods: Array<{ code: string; name: string; price: number }>
}

interface CartState {
  items: CartItem[]
  registerId: string | null
  tableId: string | null
  tableName: string | null

  setRegister: (registerId: string) => void
  setTable: (tableId: string, tableName: string) => void
  addItem: (item: CartItem) => void
  updateQuantity: (index: number, quantity: number) => void
  removeItem: (index: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  getItemsForPOS: () => Array<{
    ean: string
    price: string
    quantity: number
    note?: string
    mods?: string
  }>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      registerId: null,
      tableId: null,
      tableName: null,

      setRegister: (registerId) => set({ registerId }),

      setTable: (tableId, tableName) => set({ tableId, tableName }),

      addItem: (item) => {
        const { items } = get()
        // Check if same item with same mods exists
        const existingIdx = items.findIndex(
          (i) =>
            i.ean === item.ean &&
            JSON.stringify(i.mods) === JSON.stringify(item.mods)
        )

        if (existingIdx >= 0) {
          const updated = [...items]
          updated[existingIdx].quantity += item.quantity
          set({ items: updated })
        } else {
          set({ items: [...items, item] })
        }
      },

      updateQuantity: (index, quantity) => {
        const { items } = get()
        if (quantity <= 0) {
          set({ items: items.filter((_, i) => i !== index) })
        } else {
          const updated = [...items]
          updated[index].quantity = quantity
          set({ items: updated })
        }
      },

      removeItem: (index) => {
        const { items } = get()
        set({ items: items.filter((_, i) => i !== index) })
      },

      clearCart: () =>
        set({ items: [], registerId: null, tableId: null, tableName: null }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const modTotal = item.mods.reduce((m, mod) => m + mod.price, 0)
          return sum + (item.price + modTotal) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getItemsForPOS: () => {
        return get().items.map((item) => ({
          ean: item.ean,
          price: (item.price + item.mods.reduce((s, m) => s + m.price, 0)).toFixed(2),
          quantity: item.quantity,
          note: item.note,
          mods: item.mods.length > 0 ? item.mods.map((m) => m.code).join(",") : undefined,
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
```

### 4.2 Menu Section Component

```typescript
// src/components/features/menu-section.tsx
"use client"

import { useTranslations } from "next-intl"
import type { POSQuickSaleSection } from "@/types/pos"
import { MenuItemCard } from "./menu-item-card"

type Props = {
  section: POSQuickSaleSection
  currency: string
}

export function MenuSection({ section, currency }: Props) {
  const t = useTranslations("menu")

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {section.name}
      </h2>
      <div className="grid gap-4">
        {section.items
          .filter((item) => item.gastropay)
          .map((item) => (
            <MenuItemCard key={item._id} item={item} currency={currency} />
          ))}
      </div>
    </section>
  )
}
```

### 4.3 Menu Item Card

```typescript
// src/components/features/menu-item-card.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Plus, Minus } from "lucide-react"
import type { POSArticle } from "@/types/pos"
import { useCartStore } from "@/store/cart.store"
import { formatCurrency } from "@/lib/utils"
import { ModifierDialog } from "./modifier-dialog"

type Props = {
  item: POSArticle
  currency: string
}

export function MenuItemCard({ item, currency }: Props) {
  const t = useTranslations("menu")
  const addItem = useCartStore((s) => s.addItem)
  const [showModifiers, setShowModifiers] = useState(false)

  const handleAdd = () => {
    if (item.mods && item.mods.length > 0) {
      setShowModifiers(true)
    } else {
      addItem({
        ean: item.ean,
        name: item.name,
        price: item.price,
        quantity: 1,
        mods: [],
      })
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
        {item.image && (
          <div className="w-20 h-20 flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          <p className="text-gastropay-green font-semibold mt-1">
            {formatCurrency(item.price, currency)}
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="w-10 h-10 flex items-center justify-center bg-gastropay-green text-white rounded-full hover:bg-green-700 transition flex-shrink-0"
          aria-label={t("addToCart")}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showModifiers && (
        <ModifierDialog
          item={item}
          currency={currency}
          onClose={() => setShowModifiers(false)}
        />
      )}
    </>
  )
}
```

### 4.4 Modifier Dialog

```typescript
// src/components/features/modifier-dialog.tsx
"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { POSArticle, POSModifier } from "@/types/pos"
import { useCartStore } from "@/store/cart.store"
import { formatCurrency } from "@/lib/utils"

type Props = {
  item: POSArticle
  currency: string
  onClose: () => void
}

export function ModifierDialog({ item, currency, onClose }: Props) {
  const t = useTranslations("menu")
  const addItem = useCartStore((s) => s.addItem)
  const [selectedMods, setSelectedMods] = useState<POSModifier[]>([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const toggleMod = (mod: POSModifier) => {
    setSelectedMods((prev) =>
      prev.find((m) => m.code === mod.code)
        ? prev.filter((m) => m.code !== mod.code)
        : [...prev, mod]
    )
  }

  const total =
    (item.price + selectedMods.reduce((s, m) => s + m.price, 0)) * quantity

  const handleAdd = () => {
    addItem({
      ean: item.ean,
      name: item.name,
      price: item.price,
      quantity,
      note: note || undefined,
      mods: selectedMods.map((m) => ({
        code: m.code,
        name: m.name,
        price: m.price,
      })),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{item.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifiers */}
        <div className="p-4 space-y-4">
          {item.mods?.map((mod) => (
            <button
              key={mod.code}
              onClick={() => toggleMod(mod)}
              className={`w-full p-3 rounded-lg border-2 text-left transition ${
                selectedMods.find((m) => m.code === mod.code)
                  ? "border-gastropay-green bg-gastropay-light"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between">
                <span>{mod.name}</span>
                <span className="text-gray-600">
                  +{formatCurrency(mod.price, currency)}
                </span>
              </div>
            </button>
          ))}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poznamka
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              rows={2}
              placeholder="Specialni pozadavky..."
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full border flex items-center justify-center"
            >
              -
            </button>
            <span className="text-xl font-semibold w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={handleAdd}
            className="w-full bg-gastropay-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            {t("addToCart")} - {formatCurrency(total, currency)}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4.5 Cart Drawer

```typescript
// src/components/features/cart-drawer.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCartStore } from "@/store/cart.store"
import { formatCurrency } from "@/lib/utils"

type Props = {
  registerId: string
  currency: string
}

export function CartDrawer({ registerId, currency }: Props) {
  const t = useTranslations("cart")
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { items, getTotal, getItemCount, updateQuantity, removeItem } =
    useCartStore()

  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0 && !isOpen) return null

  return (
    <>
      {/* Floating Cart Button */}
      {!isOpen && itemCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-auto bg-gastropay-green text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between sm:justify-center gap-4 z-40"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {t("items", { count: itemCount })}
            </span>
          </div>
          <span className="font-bold">{formatCurrency(total, currency)}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">{t("title")}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.ean}-${index}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.mods.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.mods.map((m) => m.name).join(", ")}
                      </p>
                    )}
                    <p className="text-gastropay-green font-medium text-sm mt-1">
                      {formatCurrency(
                        (item.price + item.mods.reduce((s, m) => s + m.price, 0)) *
                          item.quantity,
                        currency
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t("total")}</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
              <button
                onClick={() => router.push(`/reg/${registerId}/order`)}
                className="w-full bg-gastropay-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                {t("checkout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 4.6 Order Page

```typescript
// src/app/[locale]/reg/[registerId]/order/page.tsx
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getResources } from "@/lib/pos-api/hooks"
import { OrderForm } from "@/components/features/order-form"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export default async function OrderPage({ params }: Props) {
  const { registerId } = await params
  const t = await getTranslations("order")

  const { data, error } = await getResources(registerId)

  if (error || !data) {
    redirect(`/reg/${registerId}`)
  }

  // Filter tables with gastropay enabled
  const tables = data.tables
    .flatMap((tab) => tab.tables)
    .filter((table) => table.gastropay)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <OrderForm
          registerId={registerId}
          tables={tables}
          currency={data.register.currency}
        />
      </div>
    </main>
  )
}
```

### 4.7 Order Form Component

```typescript
// src/components/features/order-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { POSTable } from "@/types/pos"
import { useCartStore } from "@/store/cart.store"
import { formatCurrency } from "@/lib/utils"

type Props = {
  registerId: string
  tables: POSTable[]
  currency: string
}

export function OrderForm({ registerId, tables, currency }: Props) {
  const t = useTranslations("order")
  const router = useRouter()
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    items,
    getTotal,
    getItemsForPOS,
    setTable,
    tableId,
    tableName,
    clearCart,
  } = useCartStore()

  const total = getTotal()

  const handleSubmit = async () => {
    if (!selectedTable && !tableId) {
      alert("Please select a table")
      return
    }

    setIsSubmitting(true)

    try {
      const table = tables.find((t) => t._id === (selectedTable || tableId))
      if (!table) throw new Error("Table not found")

      // Store table info
      setTable(table._id, table.table_name)

      // Redirect to payment (Comgate will be handled there)
      router.push(`/reg/${registerId}/payment?table=${table._id}`)
    } catch (error) {
      console.error("Order submission failed:", error)
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("empty")}</p>
        <button
          onClick={() => router.push(`/reg/${registerId}`)}
          className="mt-4 text-gastropay-green underline"
        >
          {t("backToMenu")}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-4">{t("summary")}</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
                {item.mods.length > 0 && (
                  <span className="text-gray-500 block text-xs">
                    {item.mods.map((m) => m.name).join(", ")}
                  </span>
                )}
              </span>
              <span className="font-medium">
                {formatCurrency(
                  (item.price + item.mods.reduce((s, m) => s + m.price, 0)) *
                    item.quantity,
                  currency
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
          <span>{t("total")}</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
      </div>

      {/* Table Selection */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-4">{t("selectTable")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {tables.map((table) => (
            <button
              key={table._id}
              onClick={() => setSelectedTable(table._id)}
              className={`p-3 rounded-lg border-2 text-center transition ${
                selectedTable === table._id
                  ? "border-gastropay-green bg-gastropay-light"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="block font-medium">{table.table_name}</span>
              {table.table_desc && (
                <span className="block text-xs text-gray-500">
                  {table.table_desc}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || (!selectedTable && !tableId)}
        className="w-full bg-gastropay-green text-white py-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t("processing") : t("pay")}
      </button>
    </div>
  )
}
```

### 4.8 Order Status Polling Hook

```typescript
// src/hooks/use-order-status.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { posApi } from "@/lib/pos-api/client"
import type { POSOrderResponse } from "@/types/pos"

export function useOrderStatus(registerId: string, orderId: string | null) {
  const [order, setOrder] = useState<POSOrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollStatus = useCallback(async () => {
    if (!orderId) return

    try {
      const status = await posApi.getOrderStatus(registerId, orderId)
      setOrder(status)
      return status
    } catch (err) {
      setError("Failed to fetch order status")
      return null
    }
  }, [registerId, orderId])

  useEffect(() => {
    if (!orderId) return

    setIsLoading(true)
    pollStatus().finally(() => setIsLoading(false))

    // Poll every 5 seconds until order is finished
    const interval = setInterval(async () => {
      const status = await pollStatus()
      if (status?.status === "finished" || status?.status === "deleted") {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [orderId, pollStatus])

  return { order, isLoading, error, refetch: pollStatus }
}
```

### 4.9 Order Status Page

```typescript
// src/app/[locale]/reg/[registerId]/status/[orderId]/page.tsx
"use client"

import { use } from "react"
import { useTranslations } from "next-intl"
import { CheckCircle, Clock, ChefHat, XCircle } from "lucide-react"
import { useOrderStatus } from "@/hooks/use-order-status"

type Props = {
  params: Promise<{ locale: string; registerId: string; orderId: string }>
}

const statusIcons = {
  received: Clock,
  calling: ChefHat,
  recalling: ChefHat,
  finished: CheckCircle,
  deleted: XCircle,
}

const statusColors = {
  received: "text-yellow-500",
  calling: "text-orange-500",
  recalling: "text-orange-500",
  finished: "text-green-500",
  deleted: "text-red-500",
}

export default function OrderStatusPage({ params }: Props) {
  const { registerId, orderId } = use(params)
  const t = useTranslations("order")
  const { order, isLoading, error } = useOrderStatus(registerId, orderId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gastropay-green border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || "Order not found"}</p>
      </div>
    )
  }

  const Icon = statusIcons[order.status] || Clock
  const colorClass = statusColors[order.status] || "text-gray-500"

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <Icon className={`w-16 h-16 mx-auto ${colorClass}`} />

        <h1 className="text-2xl font-bold mt-4">{t("number")}</h1>
        <p className="text-4xl font-bold text-gastropay-green mt-2">
          {order.callingNumber || order.orderNumber || "-"}
        </p>

        <div className="mt-6 py-4 border-t">
          <p className="text-sm text-gray-500">{t("status")}</p>
          <p className={`text-lg font-semibold ${colorClass}`}>
            {t(`statuses.${order.status}`)}
          </p>
        </div>

        {order.status === "finished" && (
          <p className="mt-4 text-green-600 font-medium">{t("success")}</p>
        )}
      </div>
    </main>
  )
}
```

### 4.10 Live Table Session Store

**Feature**: Customers can continuously order items at a table - multiple orders accumulate until final payment.

```typescript
// src/store/table-session.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { orderLogger } from "@/lib/logger"

interface SubmittedOrder {
  _id: string
  items: Array<{
    ean: string
    name: string
    price: number
    quantity: number
    mods: Array<{ code: string; name: string; price: number }>
  }>
  totalPrice: number
  status: "received" | "pending" | "calling" | "recalling" | "finished" | "deleted"
  submittedAt: string
  paidAt?: string
}

interface TableSession {
  sessionId: string           // unique session ID
  registerId: string
  tableId: string
  tableName: string
  startedAt: string
  orders: SubmittedOrder[]    // all orders in this session
  isActive: boolean
}

interface TableSessionState {
  session: TableSession | null

  // Session management
  startSession: (registerId: string, tableId: string, tableName: string) => string
  endSession: () => void
  isSessionActive: (registerId: string, tableId: string) => boolean

  // Order tracking
  addOrder: (order: Omit<SubmittedOrder, "submittedAt">) => void
  updateOrderStatus: (orderId: string, status: SubmittedOrder["status"]) => void
  markOrderPaid: (orderId: string) => void

  // Computed
  getUnpaidOrders: () => SubmittedOrder[]
  getUnpaidTotal: () => number
  getAllOrdersTotal: () => number
}

export const useTableSessionStore = create<TableSessionState>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: (registerId, tableId, tableName) => {
        const existing = get().session
        // Resume if same table
        if (existing?.registerId === registerId && existing?.tableId === tableId && existing.isActive) {
          orderLogger.info("Resuming existing table session", { sessionId: existing.sessionId })
          return existing.sessionId
        }

        const sessionId = `${registerId}-${tableId}-${Date.now()}`
        orderLogger.info("Starting new table session", { sessionId, registerId, tableId })

        set({
          session: {
            sessionId,
            registerId,
            tableId,
            tableName,
            startedAt: new Date().toISOString(),
            orders: [],
            isActive: true,
          },
        })
        return sessionId
      },

      endSession: () => {
        const session = get().session
        if (session) {
          orderLogger.info("Ending table session", { sessionId: session.sessionId })
        }
        set({ session: null })
      },

      isSessionActive: (registerId, tableId) => {
        const session = get().session
        return (
          session?.registerId === registerId &&
          session?.tableId === tableId &&
          session.isActive
        )
      },

      addOrder: (order) => {
        const session = get().session
        if (!session) return

        orderLogger.info("Adding order to session", {
          sessionId: session.sessionId,
          orderId: order._id
        })

        set({
          session: {
            ...session,
            orders: [
              ...session.orders,
              { ...order, submittedAt: new Date().toISOString() },
            ],
          },
        })
      },

      updateOrderStatus: (orderId, status) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            orders: session.orders.map((o) =>
              o._id === orderId ? { ...o, status } : o
            ),
          },
        })
      },

      markOrderPaid: (orderId) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            orders: session.orders.map((o) =>
              o._id === orderId ? { ...o, paidAt: new Date().toISOString() } : o
            ),
          },
        })
      },

      getUnpaidOrders: () => {
        const session = get().session
        if (!session) return []
        return session.orders.filter((o) => !o.paidAt && o.status !== "deleted")
      },

      getUnpaidTotal: () => {
        return get()
          .getUnpaidOrders()
          .reduce((sum, o) => sum + o.totalPrice, 0)
      },

      getAllOrdersTotal: () => {
        const session = get().session
        if (!session) return 0
        return session.orders
          .filter((o) => o.status !== "deleted")
          .reduce((sum, o) => sum + o.totalPrice, 0)
      },
    }),
    {
      name: "gastropay-table-session",
    }
  )
)
```

### 4.11 Live Table Order Summary Component

```typescript
// src/components/features/table-session-summary.tsx
"use client"

import { useTranslations } from "next-intl"
import { Clock, CheckCircle, ChefHat } from "lucide-react"
import { useTableSessionStore } from "@/store/table-session.store"
import { formatCurrency } from "@/lib/utils"

type Props = {
  currency: string
}

const statusConfig = {
  received: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  pending: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
  calling: { icon: ChefHat, color: "text-orange-500", bg: "bg-orange-50" },
  recalling: { icon: ChefHat, color: "text-orange-500", bg: "bg-orange-50" },
  finished: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  deleted: { icon: Clock, color: "text-red-500", bg: "bg-red-50" },
}

export function TableSessionSummary({ currency }: Props) {
  const t = useTranslations("order")
  const { session, getUnpaidOrders, getUnpaidTotal } = useTableSessionStore()

  if (!session || session.orders.length === 0) return null

  const unpaidOrders = getUnpaidOrders()
  const unpaidTotal = getUnpaidTotal()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{t("tableSession")}</h3>
        <span className="text-sm text-gray-500">
          {session.tableName}
        </span>
      </div>

      {/* Order list */}
      <div className="space-y-2">
        {session.orders.map((order, idx) => {
          const config = statusConfig[order.status]
          const Icon = config.icon
          const isPaid = !!order.paidAt

          return (
            <div
              key={order._id}
              className={`p-3 rounded-lg ${isPaid ? "bg-gray-50" : config.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium">
                    {t("orderNum", { num: idx + 1 })}
                  </span>
                  {isPaid && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {t("paid")}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium ${isPaid ? "text-gray-400 line-through" : ""}`}>
                  {formatCurrency(order.totalPrice, currency)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
              </p>
            </div>
          )
        })}
      </div>

      {/* Unpaid total */}
      {unpaidOrders.length > 0 && (
        <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
          <span>{t("unpaidTotal")}</span>
          <span className="text-gastropay-green">
            {formatCurrency(unpaidTotal, currency)}
          </span>
        </div>
      )}
    </div>
  )
}
```

### 4.12 Updated Cart with Continue Ordering

```typescript
// src/components/features/cart-drawer.tsx (updated)
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCartStore } from "@/store/cart.store"
import { useTableSessionStore } from "@/store/table-session.store"
import { formatCurrency } from "@/lib/utils"
import { orderLogger } from "@/lib/logger"

type Props = {
  registerId: string
  currency: string
}

export function CartDrawer({ registerId, currency }: Props) {
  const t = useTranslations("cart")
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { items, getTotal, getItemCount, updateQuantity, removeItem, clearCart } =
    useCartStore()
  const { session, getUnpaidTotal } = useTableSessionStore()

  const itemCount = getItemCount()
  const cartTotal = getTotal()
  const sessionTotal = getUnpaidTotal()
  const hasActiveSession = session?.isActive && session.orders.length > 0

  if (itemCount === 0 && !isOpen && !hasActiveSession) return null

  const handleQuickSubmit = async () => {
    if (itemCount === 0) return

    orderLogger.debug("Quick submit from cart", { itemCount, total: cartTotal })
    router.push(`/reg/${registerId}/order`)
  }

  return (
    <>
      {/* Floating Cart Button - shows session total if active */}
      {!isOpen && (itemCount > 0 || hasActiveSession) && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-auto bg-gastropay-green text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between sm:justify-center gap-4 z-40"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {itemCount > 0
                ? t("items", { count: itemCount })
                : t("viewOrders")
              }
            </span>
          </div>
          <span className="font-bold">
            {formatCurrency(cartTotal + sessionTotal, currency)}
          </span>
        </button>
      )}

      {/* Cart Drawer with session info */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="font-semibold text-lg">{t("title")}</h2>
                {session?.tableName && (
                  <p className="text-sm text-gray-500">{session.tableName}</p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Previous orders in session */}
            {hasActiveSession && (
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  {t("previousOrders")}
                </h3>
                <div className="space-y-1">
                  {session.orders
                    .filter((o) => !o.paidAt && o.status !== "deleted")
                    .map((order, idx) => (
                      <div key={order._id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {t("orderNum", { num: idx + 1 })} ({order.items.length} items)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(order.totalPrice, currency)}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-gray-200">
                  <span>{t("previousTotal")}</span>
                  <span>{formatCurrency(sessionTotal, currency)}</span>
                </div>
              </div>
            )}

            {/* Current cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {itemCount > 0 && (
                <h3 className="text-sm font-medium text-gray-600">
                  {t("currentOrder")}
                </h3>
              )}
              {items.map((item, index) => (
                <div
                  key={`${item.ean}-${index}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.mods.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.mods.map((m) => m.name).join(", ")}
                      </p>
                    )}
                    <p className="text-gastropay-green font-medium text-sm mt-1">
                      {formatCurrency(
                        (item.price + item.mods.reduce((s, m) => s + m.price, 0)) *
                          item.quantity,
                        currency
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {itemCount === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {t("addMoreItems")}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              {/* Current cart total */}
              {itemCount > 0 && (
                <div className="flex justify-between">
                  <span>{t("thisOrder")}</span>
                  <span className="font-medium">{formatCurrency(cartTotal, currency)}</span>
                </div>
              )}

              {/* Grand total */}
              <div className="flex justify-between text-lg font-semibold">
                <span>{t("grandTotal")}</span>
                <span>{formatCurrency(cartTotal + sessionTotal, currency)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {itemCount > 0 && (
                  <button
                    onClick={handleQuickSubmit}
                    className="flex-1 bg-gastropay-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    {t("submitOrder")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {hasActiveSession && sessionTotal > 0 && (
                  <button
                    onClick={() => router.push(`/reg/${registerId}/payment/session`)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    {t("payAll")} ({formatCurrency(sessionTotal, currency)})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 4.13 Session Payment Page

```typescript
// src/app/[locale]/reg/[registerId]/payment/session/page.tsx
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { SessionPaymentForm } from "@/components/features/session-payment-form"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export default async function SessionPaymentPage({ params }: Props) {
  const { locale, registerId } = await params
  const t = await getTranslations("order")

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{t("paySession")}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <SessionPaymentForm registerId={registerId} locale={locale} />
      </div>
    </main>
  )
}
```

## File Structure

```
src/
├── app/
│   └── [locale]/
│       └── reg/
│           └── [registerId]/
│               ├── page.tsx            # Menu
│               ├── order/
│               │   └── page.tsx        # Order form
│               ├── payment/
│               │   ├── page.tsx        # Single order payment
│               │   ├── session/
│               │   │   └── page.tsx    # Pay all session orders
│               │   ├── success/
│               │   │   └── page.tsx
│               │   └── cancel/
│               │       └── page.tsx
│               └── status/
│                   └── [orderId]/
│                       └── page.tsx    # Status polling
├── components/
│   └── features/
│       ├── menu-section.tsx
│       ├── menu-item-card.tsx
│       ├── modifier-dialog.tsx
│       ├── cart-drawer.tsx            # Updated with session support
│       ├── order-form.tsx
│       ├── table-session-summary.tsx  # New: shows session orders
│       └── session-payment-form.tsx   # New: pay all session orders
├── store/
│   ├── cart.store.ts
│   └── table-session.store.ts         # New: tracks live table session
└── hooks/
    └── use-order-status.ts
```

## Acceptance Criteria

- [ ] Menu items display with images and prices
- [ ] Modifiers can be selected in dialog
- [ ] Cart persists across page refreshes
- [ ] Cart shows item count and total
- [ ] Table selection works
- [ ] Order status polls every 5 seconds
- [ ] Status page shows correct icon/color

### Live Table Session
- [ ] Table session starts when first order submitted
- [ ] Multiple orders accumulate in session
- [ ] Cart shows previous orders + current cart
- [ ] "Pay All" button pays entire session
- [ ] Session persists across page refreshes (localStorage)
- [ ] Session ends after full payment
- [ ] Winston logs track session events

## Dependencies

```bash
pnpm add zustand winston
```

## Next Phase

[Phase 05: Payment Integration](./phase-05-payment-integration.md)
