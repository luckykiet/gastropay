import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { posApi } from "@/lib/pos-api/client"
import { MenuPageClient } from "@/components/features/menu-page-client"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
  searchParams: Promise<{ table?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { registerId } = await params

  try {
    const data = await posApi.getResources(registerId)
    return {
      title: `${data.register.name} - GastroPay`,
      description: data.register.description || `Order from ${data.register.name}`,
    }
  } catch {
    return {
      title: "Menu - GastroPay",
    }
  }
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { locale, registerId } = await params
  const { table: tableId } = await searchParams
  const t = await getTranslations("menu")

  try {
    const data = await posApi.getResources(registerId)

    if (!data.success || !data.register) {
      notFound()
    }

    return (
      <MenuPageClient
        register={data.register}
        categories={data.categories}
        products={data.products}
        locale={locale}
        initialTableId={tableId}
      />
    )
  } catch (error) {
    console.error("Failed to load menu:", error)
    notFound()
  }
}
