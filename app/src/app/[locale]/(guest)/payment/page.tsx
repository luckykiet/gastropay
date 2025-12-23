import { getTranslations } from "next-intl/server"
import { PaymentPageClient } from "@/components/features/payment-page-client"

export async function generateMetadata() {
  const t = await getTranslations("payment")
  return {
    title: `${t("title")} - GastroPay`,
  }
}

export default async function PaymentPage() {
  return <PaymentPageClient />
}
