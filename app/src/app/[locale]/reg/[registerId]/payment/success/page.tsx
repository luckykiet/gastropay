import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
  searchParams: Promise<{ id?: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("order")
  return {
    title: `${t("success")} - GastroPay`,
  }
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { registerId } = await params
  const { id: transactionId } = await searchParams
  const t = await getTranslations("order")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mt-6">{t("success")}</h1>

        <p className="text-gray-600 mt-3">
          {t("successMessage")}
        </p>

        {transactionId && (
          <div className="mt-6 py-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">{t("transactionId")}</p>
            <p className="font-mono text-sm mt-1">{transactionId}</p>
          </div>
        )}

        <Link
          href={`/reg/${registerId}`}
          className="mt-8 inline-block bg-[var(--gastropay-green)] text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition"
        >
          {t("backToMenu")}
        </Link>
      </div>
    </main>
  )
}
