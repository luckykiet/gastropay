import { getTranslations } from "next-intl/server"
import { RestaurantPageClient } from "@/components/features/restaurant-page-client"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("restaurant")
  return {
    title: `${t("title")} - GastroPay`,
  }
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params
  return <RestaurantPageClient restaurantId={id} />
}
