import { getTranslations } from "next-intl/server"
import { LegacyMenuPageClient } from "@/components/features/legacy-menu-page-client"

export async function generateMetadata() {
  const t = await getTranslations("menu")
  return {
    title: `${t("title")} - GastroPay`,
  }
}

export default async function MenuPage() {
  return <LegacyMenuPageClient />
}
