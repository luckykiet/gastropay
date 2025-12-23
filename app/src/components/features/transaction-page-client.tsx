"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { PATHS, STATUS_COLOR, PAYMENT_GATES_NAME } from "@/config"

interface Transaction {
  _id: string
  refId: string
  status: string
  totalPrice: number
  tips: number
  email: string
  paymentGate: string
  createdAt: string
  paidAt?: string
  orders: Array<{
    name: string
    price: number
    quantity: number
  }>
  restaurant: {
    name: string
  }
  deliveryMethod?: {
    name: string
  }
}

interface Props {
  refId: string
}

export function TransactionPageClient({ refId }: Props) {
  const t = useTranslations("transaction")
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transaction/${refId}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.msg || "Transaction not found")
        }

        setTransaction(data.msg)
      } catch (err) {
        console.error(err)
        setError(t("error"))
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()

    // Poll for updates every 5 seconds if pending
    const interval = setInterval(fetchTransaction, 5000)
    return () => clearInterval(interval)
  }, [refId, t])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gastropay-green)]" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("error")}</h1>
        <Link
          href={PATHS.RESTAURANTS}
          className="text-[var(--gastropay-green)] hover:underline"
        >
          {t("backToRestaurants")}
        </Link>
      </div>
    )
  }

  const StatusIcon = {
    pending: Clock,
    calling: CheckCircle,
    processing: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
    refunded: XCircle,
  }[transaction.status] || Clock

  const statusColor = STATUS_COLOR[transaction.status] || STATUS_COLOR.pending

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Status Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            transaction.status === "completed" || transaction.status === "calling"
              ? "bg-green-100"
              : transaction.status === "cancelled" || transaction.status === "refunded"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        >
          <StatusIcon
            className={`w-12 h-12 ${
              transaction.status === "completed" || transaction.status === "calling"
                ? "text-green-500"
                : transaction.status === "cancelled" || transaction.status === "refunded"
                ? "text-red-500"
                : "text-yellow-500"
            }`}
          />
        </div>

        {/* Status */}
        <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${statusColor}`}>
          {t(`status.${transaction.status}`)}
        </span>

        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>

        {/* Transaction Info */}
        <div className="mt-6 py-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">{t("transactionId")}</p>
          <p className="font-mono text-sm mt-1">{transaction.refId}</p>
        </div>

        {/* Order Details */}
        <div className="mt-6 text-left">
          <h2 className="font-semibold mb-3">{t("orderDetails")}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">{t("restaurant")}:</span>{" "}
              {transaction.restaurant?.name}
            </p>
            {transaction.deliveryMethod?.name && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{t("table")}:</span>{" "}
                {transaction.deliveryMethod.name}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">{t("paymentMethod")}:</span>{" "}
              {PAYMENT_GATES_NAME[transaction.paymentGate] || transaction.paymentGate}
            </p>

            <hr className="my-3" />

            <div className="space-y-2">
              {transaction.orders?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{item.price * item.quantity} Kč</span>
                </div>
              ))}
              {transaction.tips > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t("tips")}</span>
                  <span>{transaction.tips} Kč</span>
                </div>
              )}
            </div>

            <hr className="my-3" />

            <div className="flex justify-between font-bold">
              <span>{t("total")}</span>
              <span>{transaction.totalPrice} Kč</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <Link
            href={PATHS.RESTAURANTS}
            className="inline-block bg-[var(--gastropay-green)] text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            {t("backToRestaurants")}
          </Link>
        </div>
      </div>
    </div>
  )
}
