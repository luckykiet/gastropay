import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { posApi } from "@/lib/pos-api/client"
import { OrderPageClient } from "@/components/features/order-page-client"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("order")
  return {
    title: `${t("title")} - GastroPay`,
  }
}

export default async function OrderPage({ params }: Props) {
  const { locale, registerId } = await params

  try {
    const verifyResult = await posApi.verify(registerId)
    if (!verifyResult.success || !verifyResult.register) {
      redirect(`/reg/${registerId}`)
    }

    return (
      <OrderPageClient
        register={verifyResult.register}
        locale={locale}
      />
    )
  } catch {
    redirect(`/reg/${registerId}`)
  }
}
