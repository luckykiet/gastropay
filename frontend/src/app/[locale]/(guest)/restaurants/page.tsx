import { getTranslations } from "next-intl/server"
import { RestaurantsPageClient } from "@/components/features/restaurants-page-client"

export async function generateMetadata() {
  const t = await getTranslations("restaurants")
  return {
    title: `${t("title")} - GastroPay`,
    description: t("description"),
  }
}

export default async function RestaurantsPage() {
  return <RestaurantsPageClient />
}
