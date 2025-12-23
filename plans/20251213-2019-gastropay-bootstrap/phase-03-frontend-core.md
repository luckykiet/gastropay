# Phase 03: Frontend Core - i18n, Layouts, SEO

**Status**: Pending | **Effort**: 8-10 hours | **Priority**: Critical

## Objective

Setup Next.js App Router with internationalization (Czech/English/Vietnamese), wildcard subdomain routing, SEO infrastructure, and base layouts.

## Prerequisites

- Phase 01 completed (Next.js project)
- Phase 02 completed (POS API client)

## Tasks

### 3.1 i18n Configuration with next-intl

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["cs", "en", "vi"],
  defaultLocale: "cs",
  localePrefix: "as-needed", // Only show prefix for non-default
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

### 3.2 Translation Files

```json
// messages/cs.json
{
  "common": {
    "loading": "Nacitam...",
    "error": "Nastala chyba",
    "retry": "Zkusit znovu",
    "back": "Zpet",
    "next": "Dalsi",
    "confirm": "Potvrdit",
    "cancel": "Zrusit"
  },
  "menu": {
    "title": "Menu",
    "categories": "Kategorie",
    "search": "Hledat v menu...",
    "addToCart": "Pridat do kosiku",
    "noItems": "Zadne polozky"
  },
  "cart": {
    "title": "Kosik",
    "empty": "Vas kosik je prazdny",
    "total": "Celkem",
    "checkout": "Objednat",
    "items": "{count, plural, =0 {Zadne polozky} =1 {1 polozka} other {# polozek}}"
  },
  "order": {
    "title": "Objednavka",
    "table": "Stul",
    "status": "Stav",
    "statuses": {
      "received": "Prijata",
      "calling": "Pripravuje se",
      "finished": "Hotovo"
    },
    "pay": "Zaplatit",
    "success": "Dekujeme za objednavku!",
    "number": "Cislo objednavky"
  },
  "store": {
    "openingHours": "Oteviraci doba",
    "closed": "Zavreno",
    "open": "Otevreno",
    "contact": "Kontakt",
    "address": "Adresa"
  }
}
```

```json
// messages/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again",
    "back": "Back",
    "next": "Next",
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "menu": {
    "title": "Menu",
    "categories": "Categories",
    "search": "Search menu...",
    "addToCart": "Add to cart",
    "noItems": "No items"
  },
  "cart": {
    "title": "Cart",
    "empty": "Your cart is empty",
    "total": "Total",
    "checkout": "Order",
    "items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
  },
  "order": {
    "title": "Order",
    "table": "Table",
    "status": "Status",
    "statuses": {
      "received": "Received",
      "calling": "Preparing",
      "finished": "Ready"
    },
    "pay": "Pay",
    "success": "Thank you for your order!",
    "number": "Order number"
  },
  "store": {
    "openingHours": "Opening hours",
    "closed": "Closed",
    "open": "Open",
    "contact": "Contact",
    "address": "Address"
  }
}
```

```json
// messages/vi.json
{
  "common": {
    "loading": "Dang tai...",
    "error": "Da xay ra loi",
    "retry": "Thu lai",
    "back": "Quay lai",
    "next": "Tiep theo",
    "confirm": "Xac nhan",
    "cancel": "Huy"
  },
  "menu": {
    "title": "Thuc don",
    "categories": "Danh muc",
    "search": "Tim kiem...",
    "addToCart": "Them vao gio",
    "noItems": "Khong co mon"
  },
  "cart": {
    "title": "Gio hang",
    "empty": "Gio hang trong",
    "total": "Tong cong",
    "checkout": "Dat hang",
    "items": "{count, plural, =0 {Khong co mon} =1 {1 mon} other {# mon}}"
  },
  "order": {
    "title": "Don hang",
    "table": "Ban",
    "status": "Trang thai",
    "statuses": {
      "received": "Da nhan",
      "calling": "Dang chuan bi",
      "finished": "San sang"
    },
    "pay": "Thanh toan",
    "success": "Cam on ban da dat hang!",
    "number": "Ma don hang"
  },
  "store": {
    "openingHours": "Gio mo cua",
    "closed": "Dong cua",
    "open": "Mo cua",
    "contact": "Lien he",
    "address": "Dia chi"
  }
}
```

### 3.3 Middleware for Subdomain + i18n

```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const pathname = request.nextUrl.pathname

  // Extract subdomain
  const parts = host.split(".")
  let subdomain: string | null = null

  if (parts.length >= 3 && !host.includes("localhost")) {
    const first = parts[0]
    const reserved = ["www", "api", "admin"]
    if (!reserved.includes(first)) {
      subdomain = first
    }
  }

  // Development: check for subdomain in cookie or query
  if (host.includes("localhost")) {
    subdomain = request.cookies.get("dev-subdomain")?.value || null
  }

  // Store subdomain in header for server components
  const response = intlMiddleware(request)

  if (subdomain) {
    response.headers.set("x-subdomain", subdomain)
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
```

### 3.4 Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    template: "%s | GastroPay",
    default: "GastroPay - QR Ordering for Restaurants",
  },
  description: "Modern QR-based ordering system for restaurants",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

### 3.5 Locale Layout

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { headers } from "next/headers"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "common" })

  return {
    title: "GastroPay",
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const headersList = await headers()
  const subdomain = headersList.get("x-subdomain")

  return (
    <html lang={locale} className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-gray-50`}>
        <NextIntlClientProvider messages={messages}>
          <div data-subdomain={subdomain}>{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 3.6 Landing Page (gastropay.cz)

```typescript
// src/app/[locale]/page.tsx
import { useTranslations } from "next-intl"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  const headersList = await headers()
  const subdomain = headersList.get("x-subdomain")

  // If subdomain exists, redirect to company page
  if (subdomain) {
    redirect(`/stores`)
  }

  // Landing page for gastropay.cz (no subdomain)
  return (
    <main className="min-h-screen bg-gradient-to-b from-gastropay-light to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-center">
          GastroPay
        </h1>
        <p className="mt-6 text-xl text-gray-600 text-center max-w-2xl mx-auto">
          Modern QR ordering for Czech restaurants
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 bg-gastropay-green text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 3.7 Company Stores Page

```typescript
// src/app/[locale]/stores/page.tsx
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { posApi } from "@/lib/pos-api/client"
import { StoreCard } from "@/components/features/store-card"

export default async function StoresPage() {
  const headersList = await headers()
  const subdomain = headersList.get("x-subdomain")

  if (!subdomain) {
    notFound()
  }

  const t = await getTranslations("store")

  // TODO: Fetch company registers from POS API
  // For now, mock data
  const stores = [
    {
      id: "register-1",
      name: "Main Restaurant",
      address: "Vaclavske namesti 1, Praha",
      isOpen: true,
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{subdomain}</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </div>
    </main>
  )
}
```

### 3.8 Register Menu Page

```typescript
// src/app/[locale]/reg/[registerId]/page.tsx
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getResources } from "@/lib/pos-api/hooks"
import { MenuSection } from "@/components/features/menu-section"
import { CartDrawer } from "@/components/features/cart-drawer"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { registerId } = await params
  const { data } = await getResources(registerId)

  if (!data) {
    return { title: "Menu" }
  }

  return {
    title: `${data.register.name} - Menu`,
    description: `Order food from ${data.register.name}`,
  }
}

export default async function MenuPage({ params }: Props) {
  const { registerId } = await params
  const t = await getTranslations("menu")

  const { data, error } = await getResources(registerId)

  if (error || !data) {
    notFound()
  }

  const { register, quickSales, tables } = data

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{register.name}</h1>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {quickSales
          .filter((section) => section.gastropay)
          .map((section) => (
            <MenuSection
              key={section._id}
              section={section}
              currency={register.currency}
            />
          ))}
      </div>

      {/* Cart Drawer */}
      <CartDrawer registerId={registerId} currency={register.currency} />
    </main>
  )
}
```

### 3.9 SEO Components

```typescript
// src/components/seo/restaurant-jsonld.tsx
import type { POSResourcesResponse } from "@/types/pos"

type Props = {
  resources: POSResourcesResponse
  subdomain: string
}

export function RestaurantJsonLd({ resources, subdomain }: Props) {
  const { register } = resources

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `https://${subdomain}.gastropay.cz/#restaurant`,
    name: register.name,
    url: `https://${subdomain}.gastropay.cz`,
    servesCuisine: "Czech",
    priceRange: "$$",
    acceptsReservations: "False",
    hasMenu: {
      "@type": "Menu",
      name: "Main Menu",
      hasMenuSection: resources.quickSales
        .filter((s) => s.gastropay)
        .map((section) => ({
          "@type": "MenuSection",
          name: section.name,
          hasMenuItem: section.items.map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: register.currency,
            },
          })),
        })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### 3.10 Hreflang Tags

```typescript
// src/components/seo/hreflang.tsx
import { routing } from "@/i18n/routing"

type Props = {
  pathname: string
  subdomain?: string | null
}

export function HreflangTags({ pathname, subdomain }: Props) {
  const baseUrl = subdomain
    ? `https://${subdomain}.gastropay.cz`
    : "https://gastropay.cz"

  return (
    <>
      {routing.locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${baseUrl}${locale === "cs" ? "" : `/${locale}`}${pathname}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
    </>
  )
}
```

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing / stores
│   │   ├── stores/
│   │   │   └── page.tsx          # Company stores list
│   │   └── reg/
│   │       └── [registerId]/
│   │           ├── page.tsx      # Menu
│   │           └── order/
│   │               └── page.tsx  # Order page
│   ├── api/
│   │   └── webhook/
│   │       └── comgate/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── seo/
│   │   ├── restaurant-jsonld.tsx
│   │   └── hreflang.tsx
│   └── features/
│       ├── store-card.tsx
│       ├── menu-section.tsx
│       └── cart-drawer.tsx
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── middleware.ts
└── messages/
    ├── cs.json
    ├── en.json
    └── vi.json
```

## Acceptance Criteria

- [ ] `/` shows landing page (no subdomain)
- [ ] `restaurant.gastropay.cz` shows stores list
- [ ] `restaurant.gastropay.cz/reg/123` shows menu
- [ ] `restaurant.gastropay.cz/en/reg/123` shows English menu
- [ ] Hreflang tags present on all pages
- [ ] JSON-LD schema renders correctly
- [ ] Language switcher works
- [ ] Subdomain extracted in middleware

## SEO Checklist

- [ ] Unique `<title>` per page
- [ ] Meta description on menu pages
- [ ] Canonical URLs set
- [ ] Hreflang for all locales
- [ ] JSON-LD Restaurant schema
- [ ] Open Graph tags for social sharing
- [ ] Sitemap.xml generated

## Next Phase

[Phase 04: Customer Ordering](./phase-04-customer-ordering.md)
