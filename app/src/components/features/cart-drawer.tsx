"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart.store"
import { formatCurrency, cn } from "@/lib/utils"

type Props = {
  isOpen: boolean
  onClose: () => void
  registerId: string
  currency: string
}

export function CartDrawer({ isOpen, onClose, registerId, currency }: Props) {
  const t = useTranslations("cart")
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotal, tableName } =
    useCartStore()

  const total = getTotal()

  const handleCheckout = () => {
    onClose()
    router.push(`/reg/${registerId}/order`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{t("title")}</h2>
            {tableName && (
              <p className="text-sm text-gray-500">Stůl: {tableName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p>{t("empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const modifiersTotal = item.modifiers.reduce(
                  (sum, m) => sum + m.price,
                  0
                )
                const itemTotal = (item.price + modifiersTotal) * item.quantity

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Image */}
                    {item.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>

                      {/* Modifiers */}
                      {item.modifiers.length > 0 && (
                        <p className="text-sm text-gray-500 truncate">
                          {item.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}

                      {/* Note */}
                      {item.note && (
                        <p className="text-sm text-gray-400 italic truncate">
                          {item.note}
                        </p>
                      )}

                      {/* Price and quantity */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[var(--gastropay-green)]">
                          {formatCurrency(itemTotal, currency)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.modifiers,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.modifiers,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.modifiers)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>{t("total")}</span>
              <span className="text-[var(--gastropay-green)]">
                {formatCurrency(total, currency)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[var(--gastropay-green)] text-white py-4 rounded-xl font-medium hover:bg-green-700 transition"
            >
              {t("checkout")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
