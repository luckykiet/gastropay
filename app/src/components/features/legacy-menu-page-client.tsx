"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, Plus, ShoppingCart } from "lucide-react"
import { proxyApi } from "@/lib/api-client"
import { PATHS, CONFIG } from "@/config"
import { isValidImageUrl, addSlashAfterUrl } from "@/lib/utils"
import {
  useRestaurantStore,
  useLegacyCartStore,
} from "@/stores"
import { nanoid } from "nanoid"

interface MenuTab {
  id: string
  name: string
}

interface MenuItem {
  name: string
  price: number
  description: string
  allergens: string[]
  tab: string
  ean: string
  image?: string
}

export function LegacyMenuPageClient() {
  const t = useTranslations("menu")
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<MenuTab[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [notification, setNotification] = useState("")

  const { chosenRestaurant, setTables } = useRestaurantStore()
  const { addToCartItems, cartItems } = useLegacyCartStore()

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (!chosenRestaurant) {
      router.push(PATHS.RESTAURANTS)
      return
    }

    const fetchMenu = async () => {
      try {
        const menuUrl = `${chosenRestaurant.api.menuUrl}${chosenRestaurant.api.key}`
        const response = await proxyApi.get(menuUrl)

        if (!response.success) {
          throw new Error(String(response.msg))
        }

        const data = response.msg as {
          sections: Array<{ name: string; items: Array<{ ean: string; image?: string }> }>
          articles: Record<string, { name: string; price: number; description: string; allergens?: string[] }>
          tables?: Array<{ _id: string; table_name: string }>
        }

        const groups = data.sections
        const products = data.articles
        const newTabs: MenuTab[] = []
        const newMenu: MenuItem[] = []

        groups.forEach(({ name, items }) => {
          const tabId = nanoid()
          newTabs.push({ id: tabId, name })

          items.forEach((item) => {
            const product = products[item.ean]
            if (product) {
              newMenu.push({
                name: product.name,
                price: product.price,
                description: product.description,
                allergens: product.allergens ?? [],
                tab: tabId,
                ean: item.ean,
                image: item.image,
              })
            }
          })
        })

        // Set tables
        const tables = data.tables?.map((table) => ({
          id: table._id,
          name: table.table_name,
        })) || []
        setTables(tables)

        setTabs(newTabs)
        setMenuItems(newMenu)
        if (newTabs.length > 0) {
          setActiveTab(newTabs[0].id)
        }
      } catch (err) {
        console.error(err)
        setTabs([])
        setMenuItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [chosenRestaurant, router, setTables])

  const handleAddToCart = (item: MenuItem) => {
    addToCartItems({ ean: item.ean, name: item.name, price: item.price }, 1)
    setNotification(`${t("added")} ${item.name}!`)
    setTimeout(() => setNotification(""), 3000)
  }

  const filteredItems = menuItems.filter((item) => item.tab === activeTab)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
      </div>
    )
  }

  if (!chosenRestaurant || tabs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("error")}</h1>
        <p className="text-gray-600 mb-6">
          {t("noMenu")}{" "}
          <Link
            href={PATHS.RESTAURANTS}
            className="text-[var(--gastropay-green)] hover:underline"
          >
            {t("backToRestaurants")}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        {chosenRestaurant.name}
      </h1>
      <h2 className="text-xl text-gray-600 text-center mb-8">{t("title")}</h2>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--gastropay-green)] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.ean}
            item={item}
            onAddToCart={() => handleAddToCart(item)}
          />
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalQuantity > 0 && (
        <Link
          href={PATHS.PAYMENT}
          className="fixed bottom-6 right-6 bg-[var(--gastropay-green)] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">
            {t("cart")} ({totalQuantity})
          </span>
        </Link>
      )}
    </div>
  )
}

function MenuItemCard({
  item,
  onAddToCart,
}: {
  item: MenuItem
  onAddToCart: () => void
}) {
  const imageUrl = isValidImageUrl(item.image || "")
    ? item.image
    : `${addSlashAfterUrl(CONFIG.IMAGE_BASE_URL)}foods/food_default.png`

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={imageUrl || ""}
          alt={item.name}
          fill
          className="object-contain p-2"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.name}</h3>
        {item.description && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-2 italic">
            {item.description}
          </p>
        )}
        {item.allergens.length > 0 && (
          <p className="text-gray-400 text-xs mb-3">
            Alergeny: {item.allergens.join(", ")}
          </p>
        )}
        <button
          onClick={onAddToCart}
          className="w-full bg-gray-100 hover:bg-[var(--gastropay-light)] text-gray-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {item.price} Kč
        </button>
      </div>
    </div>
  )
}
