"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useCartStore } from "@/stores/cart.store"
import { formatCurrency } from "@/lib/utils"
import type { POSRegister } from "@/types/pos"

type Props = {
  register: POSRegister
  locale: string
}

export function OrderPageClient({ register, locale }: Props) {
  const t = useTranslations("order")
  const tPayment = useTranslations("payment")
  const router = useRouter()

  const { items, getTotal, getItemsForPOS, tableName, tableId, clearCart } =
    useCartStore()

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = getTotal()

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t("emptyCart")}</p>
          <Link
            href={`/reg/${register._id}`}
            className="text-[var(--gastropay-green)] font-medium"
          >
            {t("backToMenu")}
          </Link>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerId: register._id,
          tableId: tableId || undefined,
          tableName: tableName || undefined,
          items: getItemsForPOS(),
          totalPrice: total.toFixed(2),
          email,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment creation failed")
      }

      // Store order ID for success page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("gastropay_order_id", data.orderId)
      }

      // Redirect to payment gateway
      window.location.href = data.redirectUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/reg/${register._id}`}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{t("title")}</h1>
              {tableName && (
                <p className="text-sm text-gray-500">
                  {t("table")}: {tableName}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold mb-4">{t("summary")}</h2>
            <div className="space-y-3">
              {items.map((item, index) => {
                const modifiersTotal = item.modifiers.reduce(
                  (sum, m) => sum + m.price,
                  0
                )
                const itemTotal = (item.price + modifiersTotal) * item.quantity

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex justify-between"
                  >
                    <div>
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      {item.modifiers.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {item.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-medium">
                      {formatCurrency(itemTotal, register.currency)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>{t("total")}</span>
              <span className="text-[var(--gastropay-green)]">
                {formatCurrency(total, register.currency)}
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tPayment("email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--gastropay-green)] focus:border-transparent"
              placeholder={tPayment("emailPlaceholder")}
            />
            <p className="text-sm text-gray-500 mt-2">
              {tPayment("emailRequired")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-[var(--gastropay-green)] text-white py-4 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("processing")}
              </>
            ) : (
              <>
                {tPayment("payNow")} • {formatCurrency(total, register.currency)}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            {tPayment("securePayment")}
          </p>
        </form>
      </div>
    </main>
  )
}
