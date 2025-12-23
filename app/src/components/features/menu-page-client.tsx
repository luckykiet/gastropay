"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { ShoppingCart, Search, X, Plus, Minus } from "lucide-react"
import { useCartStore } from "@/stores/cart.store"
import { formatCurrency, cn } from "@/lib/utils"
import type { POSRegister, POSCategory, POSProduct } from "@/types/pos"
import { CartDrawer } from "./cart-drawer"
import { ProductModal } from "./product-modal"
import { TableSelector } from "./table-selector"

type Props = {
  register: POSRegister
  categories: POSCategory[]
  products: POSProduct[]
  locale: string
  initialTableId?: string
}

export function MenuPageClient({
  register,
  categories,
  products,
  locale,
  initialTableId,
}: Props) {
  const t = useTranslations("menu")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showTableSelector, setShowTableSelector] = useState(false)

  const { items, setRegister, setTable, tableId, tableName, getItemCount } =
    useCartStore()

  // Initialize register and table
  useEffect(() => {
    setRegister(register._id)

    // Show table selector if no table set and tables available
    if (!tableId && register.tables && register.tables.length > 0) {
      if (initialTableId) {
        const table = register.tables.find((t) => t._id === initialTableId)
        if (table) {
          setTable(table._id, table.name)
        } else {
          setShowTableSelector(true)
        }
      } else {
        setShowTableSelector(true)
      }
    }
  }, [register, setRegister, setTable, tableId, initialTableId])

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by availability
      if (product.available === false) return false

      // Filter by category
      if (selectedCategory && product.categoryId !== selectedCategory)
        return false

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [products, selectedCategory, searchQuery])

  // Sort categories by order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [categories])

  const itemCount = getItemCount()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {register.name}
              </h1>
              {tableName && (
                <p className="text-sm text-gray-500">
                  {t("table")}: {tableName}
                </p>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-[var(--gastropay-green)] rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gastropay-green)] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="border-t overflow-x-auto">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex gap-2 py-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition",
                  selectedCategory === null
                    ? "bg-[var(--gastropay-green)] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {t("allItems")}
              </button>
              {sortedCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition",
                    selectedCategory === category._id
                      ? "bg-[var(--gastropay-green)] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t("noItems")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                currency={register.currency}
                onSelect={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating cart button (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[var(--gastropay-green)] text-white py-4 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {t("viewCart")} ({itemCount})
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          currency={register.currency}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        registerId={register._id}
        currency={register.currency}
      />

      {showTableSelector && register.tables && (
        <TableSelector
          tables={register.tables}
          onSelect={(table) => {
            setTable(table._id, table.name)
            setShowTableSelector(false)
          }}
          onClose={() => setShowTableSelector(false)}
        />
      )}
    </div>
  )
}

// Product Card Component
function ProductCard({
  product,
  currency,
  onSelect,
}: {
  product: POSProduct
  currency: string
  onSelect: () => void
}) {
  const t = useTranslations("menu")

  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-xl shadow-sm overflow-hidden text-left hover:shadow-md transition group"
    >
      {product.image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-[var(--gastropay-green)]">
            {formatCurrency(product.price, currency)}
          </span>
          <span className="text-sm text-[var(--gastropay-green)] font-medium">
            {t("addToCart")} +
          </span>
        </div>
      </div>
    </button>
  )
}
