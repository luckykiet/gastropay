"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ShoppingCart, Home } from "lucide-react"
import { useLegacyCartStore } from "@/stores"
import { PATHS } from "@/config"

export function GuestHeader() {
  const t = useTranslations("common")
  const cartItems = useLegacyCartStore((state) => state.cartItems)
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={PATHS.HOME}
            className="text-2xl font-bold text-gray-900 flex items-center gap-2"
          >
            <span className="text-[var(--gastropay-green)]">Gastro</span>Pay
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={PATHS.RESTAURANTS}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{t("restaurants")}</span>
            </Link>

            <Link
              href={PATHS.PAYMENT}
              className="relative text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--gastropay-green)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
