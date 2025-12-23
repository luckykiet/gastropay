"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowUpDown, Loader2 } from "lucide-react"
import { restaurantApi } from "@/lib/api-client"
import { PATHS, CONFIG } from "@/config"
import { isValidImageUrl, addSlashAfterUrl } from "@/lib/utils"
import type { Restaurant } from "@/stores"

const SORTABLE_FIELDS = [
  { name: "názvu", value: "name" },
  { name: "města", value: "address.city" },
]

export function RestaurantsPageClient() {
  const t = useTranslations("restaurants")
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [sortField, setSortField] = useState(SORTABLE_FIELDS[0].value)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchMsg, setSearchMsg] = useState("")

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    try {
      const response = searchQuery
        ? await restaurantApi.search(searchQuery, sortField, sortOrder)
        : await restaurantApi.getAll(sortField, sortOrder)

      if (!response.success) {
        throw new Error(String(response.msg))
      }

      setRestaurants(response.msg as Restaurant[])
      setSearchMsg("")
    } catch (err) {
      console.error(err)
      setRestaurants([])
      setSearchMsg(t("noResults"))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, sortField, sortOrder, t])

  useEffect(() => {
    const timer = setTimeout(fetchRestaurants, searchQuery ? 500 : 0)
    return () => clearTimeout(timer)
  }, [fetchRestaurants, searchQuery])

  const handleSortFieldChange = (value: string) => {
    setSortField(value)
  }

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t("choose")}</h1>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gastropay-green)] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => handleSortFieldChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gastropay-green)]"
          >
            {SORTABLE_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                {t("sortBy")} {field.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSortOrderToggle}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <ArrowUpDown
              className={`w-5 h-5 ${sortOrder === "desc" ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
        </div>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-xl font-semibold text-gray-600">
          {searchMsg || t("noActive")}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  )
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const imageUrl = isValidImageUrl(restaurant.image || "")
    ? restaurant.image
    : `${addSlashAfterUrl(CONFIG.IMAGE_BASE_URL)}restaurants/default.jpg`

  return (
    <Link
      href={`${PATHS.RESTAURANT}/${restaurant._id}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48">
        <Image
          src={imageUrl || ""}
          alt={restaurant.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--gastropay-green)] transition-colors">
          {restaurant.name}
        </h3>
        <p className="text-gray-600 text-sm">
          {restaurant.address.street}
          <br />
          {restaurant.address.postalCode} {restaurant.address.city}
        </p>
      </div>
    </Link>
  )
}
