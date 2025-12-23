"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Loader2,
  AlertCircle,
  Mail,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { transactionApi } from "@/lib/api-client"
import { PATHS, CONFIG } from "@/config"
import { addSlashAfterUrl, isValidEmail } from "@/lib/utils"
import { useRestaurantStore, useLegacyCartStore } from "@/stores"

interface PaymentMethod {
  paymentGate: string
  test: boolean
}

export function PaymentPageClient() {
  const t = useTranslations("payment")
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [selectedTable, setSelectedTable] = useState({ id: "", name: "" })
  const [error, setError] = useState("")

  const { chosenRestaurant, tables, tips, setTips, clearRestaurantState } =
    useRestaurantStore()
  const {
    cartItems,
    increaseCartItem,
    decreaseCartItem,
    removeCartItem,
    setCartItems,
  } = useLegacyCartStore()

  const totalPrice =
    Math.round(
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    ) + tips

  useEffect(() => {
    if (!chosenRestaurant) {
      setLoading(false)
      return
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await transactionApi.getPaymentMethods(
          chosenRestaurant._id
        )
        if (!response.success) {
          throw new Error(String(response.msg))
        }
        setPaymentMethods(response.msg as PaymentMethod[])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [chosenRestaurant])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value && !isValidEmail(value)) {
      setEmailError(t("invalidEmail"))
    } else {
      setEmailError("")
    }
  }

  const handlePayment = async (paymentGate: string) => {
    setError("")

    if (!email || !isValidEmail(email)) {
      setEmailError(t("invalidEmail"))
      return
    }

    if (tables.length > 0 && !selectedTable.id) {
      setError(t("selectTable"))
      return
    }

    setPaymentLoading(true)

    try {
      const transaction = {
        tips,
        restaurant: { _id: chosenRestaurant!._id },
        orders: cartItems.map((item) => ({
          ean: item.ean,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentGate,
        email,
        deliveryMethod: {
          name: selectedTable.name || "",
          id: selectedTable.id || "",
        },
      }

      const response = await transactionApi.create(transaction)

      if (!response.success) {
        throw new Error(String(response.msg))
      }

      // Clear state and redirect
      setCartItems([])
      clearRestaurantState()

      const result = response.msg as { refId: string }
      router.push(`${PATHS.TRANSACTION}/${result.refId}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : t("paymentError"))
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("emptyCart")}</h1>
        <Link
          href={PATHS.RESTAURANTS}
          className="text-[var(--gastropay-green)] hover:underline"
        >
          {t("backToRestaurants")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={PATHS.MENU}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t("backToMenu")}
      </Link>

      <h1 className="text-3xl font-bold text-center mb-8">{t("title")}</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">{t("yourOrder")}</h2>
          <div className="divide-y">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-500">{item.price} Kč</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseCartItem(item.id)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseCartItem(item.id)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="p-1 rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="w-20 text-right font-semibold">
                    {item.price * item.quantity} Kč
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t("tips")}</label>
          <div className="flex gap-2">
            {[0, 10, 20, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => setTips(amount)}
                className={`px-4 py-2 rounded-lg ${
                  tips === amount
                    ? "bg-[var(--gastropay-green)] text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {amount === 0 ? t("noTip") : `${amount} Kč`}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="text-xl font-bold text-right mb-6">
          {t("total")}: {totalPrice} Kč
        </div>

        <hr className="my-6" />

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            <span className="text-red-500">*</span> {t("email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[var(--gastropay-green)]"
              } focus:ring-2 focus:border-transparent`}
            />
          </div>
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* Table Selection */}
        {tables.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <span className="text-red-500">*</span> {t("table")}
            </label>
            <select
              value={selectedTable.id}
              onChange={(e) => {
                const table = tables.find((t) => t.id === e.target.value)
                setSelectedTable(table || { id: "", name: "" })
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gastropay-green)] focus:border-transparent"
            >
              <option value="">{t("selectTable")}</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <hr className="my-6" />

        {/* Payment Methods */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("paymentMethod")}</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-600">{t("noPaymentMethods")}</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {paymentMethods.map((method) => (
                <div key={method.paymentGate} className="text-center">
                  <button
                    onClick={() => handlePayment(method.paymentGate)}
                    disabled={paymentLoading}
                    className="relative overflow-hidden w-36 h-16 border-2 border-gray-200 rounded-lg hover:border-[var(--gastropay-green)] transition-colors disabled:opacity-50"
                  >
                    <Image
                      src={`${addSlashAfterUrl(CONFIG.IMAGE_BASE_URL)}logo/logo-${method.paymentGate}.png`}
                      alt={method.paymentGate}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                  {method.test && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                      {t("testMode")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Loading Indicator */}
        {paymentLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
          </div>
        )}
      </div>
    </div>
  )
}
