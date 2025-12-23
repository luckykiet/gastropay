import { getTranslations } from "next-intl/server"
import { TransactionPageClient } from "@/components/features/transaction-page-client"

type Props = {
  params: Promise<{ locale: string; refId: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("transaction")
  return {
    title: `${t("title")} - GastroPay`,
  }
}

export default async function TransactionPage({ params }: Props) {
  const { refId } = await params
  return <TransactionPageClient refId={refId} />
}
