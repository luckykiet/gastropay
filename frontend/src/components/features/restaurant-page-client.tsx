"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Clock, MapPin, AlertCircle } from "lucide-react"
import { restaurantApi } from "@/lib/api-client"
import { PATHS, CONFIG, DAYS_OF_WEEKS_CZECH } from "@/config"
import {
  isValidImageUrl,
  addSlashAfterUrl,
  isOpening,
  getCurrentDayName,
  getCurrentDayIndex,
} from "@/lib/utils"
import {
  useRestaurantStore,
  useLegacyCartStore,
  type Restaurant,
} from "@/stores"

interface Props {
  restaurantId: string
}

export function RestaurantPageClient({ restaurantId }: Props) {
  const t = useTranslations("restaurant")
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState("")

  const { chosenRestaurant, setChosenRestaurant } = useRestaurantStore()
  const { setCartItems } = useLegacyCartStore()

  const todayDayName = getCurrentDayName()
  const todayDayIndex = getCurrentDayIndex()

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantApi.getById(restaurantId)
        if (!response.success) {
          throw new Error(String(response.msg))
        }
        setRestaurant(response.msg as Restaurant)
      } catch (err) {
        console.error(err)
        setError(t("error"))
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [restaurantId, t])

  const handleChooseClick = () => {
    if (!restaurant) return

    // Clear cart if switching restaurants
    if (chosenRestaurant && chosenRestaurant._id !== restaurant._id) {
      setCartItems([])
    }

    setChosenRestaurant(restaurant)
    router.push(PATHS.MENU)
  }

  const isCurrentlyOpen = restaurant
    ? restaurant.openingTime[todayDayName]?.isOpen &&
      isOpening(
        restaurant.openingTime[todayDayName].from,
        restaurant.openingTime[todayDayName].to
      )
    : false

  const imageUrl =
    restaurant && isValidImageUrl(restaurant.image || "")
      ? restaurant.image
      : `${addSlashAfterUrl(CONFIG.IMAGE_BASE_URL)}restaurants/default.jpg`

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("error")}</h1>
        <p className="text-gray-600 mb-6">
          {t("backTo")}{" "}
          <Link
            href={PATHS.RESTAURANTS}
            className="text-[var(--gastropay-green)] hover:underline"
          >
            {t("restaurantList")}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{restaurant.name}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={imageUrl || ""}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Opening Hours */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t("openingHours")}
            </h2>
            <ul className="space-y-1">
              {Object.entries(DAYS_OF_WEEKS_CZECH).map(
                ([day, { name }], index) => {
                  const dayData = restaurant.openingTime[day]
                  const isToday = index === (todayDayIndex === 0 ? 6 : todayDayIndex - 1)
                  const isClosed = !dayData?.isOpen
                  const currentlyOpen =
                    isToday &&
                    dayData?.isOpen &&
                    isOpening(dayData.from, dayData.to)

                  return (
                    <li
                      key={day}
                      className={`flex justify-between py-1 px-2 rounded ${
                        isToday
                          ? currentlyOpen
                            ? "bg-green-50 text-green-700 font-semibold"
                            : "bg-red-50 text-red-700 font-semibold"
                          : ""
                      }`}
                    >
                      <span>{name}:</span>
                      <span>
                        {isClosed
                          ? t("closed")
                          : `${dayData.from} - ${dayData.to}`}
                      </span>
                    </li>
                  )
                }
              )}
            </ul>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("address")}
            </h2>
            <p className="text-gray-600">
              {restaurant.address.street}
              <br />
              {restaurant.address.postalCode} {restaurant.address.city}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8 text-center">
        {isCurrentlyOpen ? (
          <button
            onClick={handleChooseClick}
            className="bg-[var(--gastropay-green)] text-white px-12 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {t("orderFood")}
          </button>
        ) : (
          <button
            disabled
            className="bg-red-500 text-white px-12 py-4 rounded-xl text-lg font-semibold opacity-75 cursor-not-allowed"
          >
            {t("outsideHours")}
          </button>
        )}
      </div>
    </div>
  )
}
