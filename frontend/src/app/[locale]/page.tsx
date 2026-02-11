import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { QrCode, Smartphone, CreditCard } from "lucide-react"
import { PATHS } from "@/config"

export async function generateMetadata() {
  const t = await getTranslations("landing")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function LandingPage() {
  const t = useTranslations("landing")

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-[var(--gastropay-green)]">Gastro</span>Pay
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8">
            {t("subtitle")}
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            {t("description")}
          </p>
          <Link
            href={PATHS.RESTAURANTS}
            className="inline-block bg-[var(--gastropay-green)] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors shadow-lg"
          >
            {t("startOrdering")}
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={<QrCode className="w-10 h-10" />}
            title="Scan QR"
            description="Naskenujte QR kód na vašem stole"
          />
          <FeatureCard
            icon={<Smartphone className="w-10 h-10" />}
            title="Order"
            description="Vyberte si z menu a objednejte"
          />
          <FeatureCard
            icon={<CreditCard className="w-10 h-10" />}
            title="Pay"
            description="Zaplaťte online kartou nebo převodem"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} GastroPay. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--gastropay-light)] text-[var(--gastropay-green)] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
