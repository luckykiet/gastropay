import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { XCircle } from "lucide-react"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("order")
  return {
    title: `${t("cancelled")} - GastroPay`,
  }
}

export default async function PaymentCancelPage({ params }: Props) {
  const { registerId } = await params
  const t = await getTranslations("order")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mt-6">{t("cancelled")}</h1>

        <p className="text-gray-600 mt-3">
          {t("cancelledMessage")}
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href={`/reg/${registerId}/order`}
            className="block bg-[var(--gastropay-green)] text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition"
          >
            {t("tryAgain")}
          </Link>

          <Link
            href={`/reg/${registerId}`}
            className="block text-gray-600 hover:text-gray-800 font-medium"
          >
            {t("backToMenu")}
          </Link>
        </div>
      </div>
    </main>
  )
}
