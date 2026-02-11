"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { X, Plus, Minus, Check } from "lucide-react"
import { useCartStore, type CartItemModifier } from "@/stores/cart.store"
import { formatCurrency, cn } from "@/lib/utils"
import type { POSProduct, POSModifierGroup } from "@/types/pos"

type Props = {
  product: POSProduct
  currency: string
  onClose: () => void
}

export function ProductModal({ product, currency, onClose }: Props) {
  const t = useTranslations("menu")
  const { addItem } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<
    Map<string, CartItemModifier[]>
  >(new Map())
  const [note, setNote] = useState("")

  // Calculate total price
  const modifiersTotal = Array.from(selectedModifiers.values())
    .flat()
    .reduce((sum, m) => sum + m.price, 0)
  const itemTotal = (product.price + modifiersTotal) * quantity

  // Toggle modifier selection
  const toggleModifier = (
    group: POSModifierGroup,
    modifier: { _id: string; name: string; price: number }
  ) => {
    const groupModifiers = selectedModifiers.get(group._id) || []
    const existingIndex = groupModifiers.findIndex(
      (m) => m.modifierId === modifier._id
    )

    let newGroupModifiers: CartItemModifier[]

    if (existingIndex >= 0) {
      // Remove modifier
      newGroupModifiers = groupModifiers.filter(
        (m) => m.modifierId !== modifier._id
      )
    } else {
      // Add modifier (check max limit)
      if (group.max && groupModifiers.length >= group.max) {
        // Replace last if at max
        newGroupModifiers = [
          ...groupModifiers.slice(0, -1),
          { modifierId: modifier._id, name: modifier.name, price: modifier.price },
        ]
      } else {
        newGroupModifiers = [
          ...groupModifiers,
          { modifierId: modifier._id, name: modifier.name, price: modifier.price },
        ]
      }
    }

    const newMap = new Map(selectedModifiers)
    newMap.set(group._id, newGroupModifiers)
    setSelectedModifiers(newMap)
  }

  // Check if modifier is selected
  const isModifierSelected = (groupId: string, modifierId: string) => {
    const groupModifiers = selectedModifiers.get(groupId) || []
    return groupModifiers.some((m) => m.modifierId === modifierId)
  }

  // Check if required modifiers are selected
  const isValid = () => {
    if (!product.modifierGroups) return true

    return product.modifierGroups.every((group) => {
      if (!group.required) return true
      const groupModifiers = selectedModifiers.get(group._id) || []
      const min = group.min || 1
      return groupModifiers.length >= min
    })
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isValid()) return

    const allModifiers = Array.from(selectedModifiers.values()).flat()

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      modifiers: allModifiers,
      note: note || undefined,
      image: product.image,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product image */}
        {product.image && (
          <div className="relative aspect-video shrink-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold">{product.name}</h2>
          {product.description && (
            <p className="text-gray-600 mt-2">{product.description}</p>
          )}
          <p className="text-lg font-bold text-[var(--gastropay-green)] mt-2">
            {formatCurrency(product.price, currency)}
          </p>

          {/* Modifier groups */}
          {product.modifierGroups?.map((group) => (
            <div key={group._id} className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold">{group.name}</h3>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    group.required
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {group.required ? t("required") : t("optional")}
                </span>
              </div>

              <div className="space-y-2">
                {group.modifiers.map((modifier) => {
                  const isSelected = isModifierSelected(group._id, modifier._id)
                  return (
                    <button
                      key={modifier._id}
                      onClick={() => toggleModifier(group, modifier)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition",
                        isSelected
                          ? "border-[var(--gastropay-green)] bg-[var(--gastropay-light)]"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            isSelected
                              ? "border-[var(--gastropay-green)] bg-[var(--gastropay-green)]"
                              : "border-gray-300"
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span>{modifier.name}</span>
                      </div>
                      {modifier.price > 0 && (
                        <span className="text-gray-600">
                          +{formatCurrency(modifier.price, currency)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Note */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[var(--gastropay-green)] focus:border-transparent"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t p-4 bg-white">
          {/* Quantity selector */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!isValid()}
            className={cn(
              "w-full py-4 rounded-xl font-medium text-white transition",
              isValid()
                ? "bg-[var(--gastropay-green)] hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {t("addToCart")} • {formatCurrency(itemTotal, currency)}
          </button>
        </div>
      </div>
    </div>
  )
}
