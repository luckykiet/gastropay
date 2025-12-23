# Phase 05: Comgate Payment Integration

**Status**: Pending | **Effort**: 6-8 hours | **Priority**: High

## Objective

Integrate Comgate payment gateway for Czech market. Implement redirect flow, webhook handling, and order status updates to POS.

## Prerequisites

- Phase 04 completed (ordering flow)
- Comgate merchant account
- POS API ready for order creation

## Comgate Overview (from research)

- Czech payment provider with PCI DSS Level 1
- Supports CZK, EUR, and Czech bank transfers
- REST API with IP whitelisting
- SDK: `comgate-node` (Node 18+)
- Sandbox: `test: true` in config

## Tasks

### 5.1 Comgate Client

```typescript
// src/lib/comgate/client.ts
import ComgateClient from "comgate-node"

const comgate = new ComgateClient({
  merchant: parseInt(process.env.COMGATE_MERCHANT_ID!),
  secret: process.env.COMGATE_SECRET!,
  test: process.env.COMGATE_TEST_MODE === "true",
})

export { comgate }
```

### 5.2 Payment Service

```typescript
// src/lib/comgate/payment.service.ts
import { comgate } from "./client"
import { posApi } from "@/lib/pos-api/client"

interface CreatePaymentParams {
  registerId: string
  orderId: string
  totalPrice: number
  currency: string
  email: string
  locale: string
}

interface PaymentResult {
  transactionId: string
  redirectUrl: string
}

export async function createComgatePayment({
  registerId,
  orderId,
  totalPrice,
  currency,
  email,
  locale,
}: CreatePaymentParams): Promise<PaymentResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Reference ID format: registerId:orderId (used in webhook)
  const refId = `${registerId}:${orderId}`

  const payment = await comgate.create({
    country: "CZ",
    price: Math.round(totalPrice * 100), // Comgate uses cents
    currency: currency || "CZK",
    label: `Order ${orderId.slice(-6)}`,
    refId,
    method: "ALL", // Let user choose payment method
    email,
    lang: locale === "cs" ? "cs" : locale === "vi" ? "en" : "en",
    prepareOnly: false,
  })

  return {
    transactionId: payment.transId,
    redirectUrl: payment.redirect,
  }
}

export async function verifyPayment(transactionId: string): Promise<{
  paid: boolean
  status: string
}> {
  const status = await comgate.getStatus(transactionId)
  return {
    paid: status.paid,
    status: status.status,
  }
}
```

### 5.3 Payment Page (Server Component)

```typescript
// src/app/[locale]/reg/[registerId]/payment/page.tsx
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import { posApi } from "@/lib/pos-api/client"
import { createComgatePayment } from "@/lib/comgate/payment.service"
import { PaymentForm } from "@/components/features/payment-form"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
  searchParams: Promise<{ table?: string }>
}

export default async function PaymentPage({ params, searchParams }: Props) {
  const { locale, registerId } = await params
  const { table: tableId } = await searchParams
  const t = await getTranslations("order")

  if (!tableId) {
    redirect(`/reg/${registerId}`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{t("pay")}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <PaymentForm
          registerId={registerId}
          tableId={tableId}
          locale={locale}
        />
      </div>
    </main>
  )
}
```

### 5.4 Payment Form Component

```typescript
// src/components/features/payment-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCartStore } from "@/store/cart.store"
import { formatCurrency } from "@/lib/utils"

type Props = {
  registerId: string
  tableId: string
  locale: string
}

export function PaymentForm({ registerId, tableId, locale }: Props) {
  const t = useTranslations("order")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { items, getTotal, getItemsForPOS, tableName, clearCart } =
    useCartStore()

  const total = getTotal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Call API route to create payment
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerId,
          tableId,
          tableName,
          items: getItemsForPOS(),
          totalPrice: total.toFixed(2),
          email,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment creation failed")
      }

      // Store order ID for status page
      sessionStorage.setItem("gastropay_order_id", data.orderId)

      // Redirect to Comgate payment page
      window.location.href = data.redirectUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-4">{t("summary")}</h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>
                {formatCurrency(
                  (item.price + item.mods.reduce((s, m) => s + m.price, 0)) *
                    item.quantity,
                  "CZK"
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>{t("total")}</span>
          <span>{formatCurrency(total, "CZK")}</span>
        </div>
      </div>

      {/* Email Input */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email (pro potvrzeni platby)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gastropay-green focus:border-transparent"
          placeholder="vas@email.cz"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className="w-full bg-gastropay-green text-white py-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {isSubmitting ? "Zpracovavam..." : `Zaplatit ${formatCurrency(total, "CZK")}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Budete presmerovani na zabezpeceny platebni portal Comgate
      </p>
    </form>
  )
}
```

### 5.5 Payment Creation API Route

```typescript
// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { posApi } from "@/lib/pos-api/client"
import { createComgatePayment } from "@/lib/comgate/payment.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      registerId,
      tableId,
      tableName,
      items,
      totalPrice,
      email,
      locale,
    } = body

    // Validate required fields
    if (!registerId || !items || !totalPrice || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // First, verify register is valid
    const verifyResult = await posApi.verify(registerId)
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: "Invalid register" },
        { status: 400 }
      )
    }

    // Create placeholder order in POS (will be updated after payment)
    // Note: We create with a temp paymentId, then update after Comgate returns
    const tempPaymentId = `pending_${Date.now()}`

    const orderResult = await posApi.createOrder({
      key: registerId,
      totalPrice,
      paymentGate: "comgate",
      paymentId: tempPaymentId,
      tableId: tableId || undefined,
      tableName: tableName || undefined,
      items,
    })

    // Create Comgate payment
    const payment = await createComgatePayment({
      registerId,
      orderId: orderResult._id,
      totalPrice: parseFloat(totalPrice),
      currency: "CZK",
      email,
      locale,
    })

    // TODO: Update order with real Comgate transactionId
    // This would require a POS API endpoint to update paymentId

    return NextResponse.json({
      orderId: orderResult._id,
      transactionId: payment.transactionId,
      redirectUrl: payment.redirectUrl,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
```

### 5.6 Comgate Webhook Handler

```typescript
// src/app/api/webhook/comgate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/comgate/payment.service"
import { posApi } from "@/lib/pos-api/client"

interface ComgateWebhookPayload {
  transId: string
  status: "PAID" | "PENDING" | "CANCELLED" | "AUTHORIZED"
  price: number
  curr: string
  refId: string // format: registerId:orderId
}

export async function POST(request: NextRequest) {
  try {
    // Parse webhook body
    const body = await request.json() as ComgateWebhookPayload

    console.log("Comgate webhook received:", body)

    const { transId, status, refId } = body

    // Parse refId
    const [registerId, orderId] = refId.split(":")

    if (!registerId || !orderId) {
      console.error("Invalid refId format:", refId)
      return NextResponse.json({ error: "Invalid refId" }, { status: 400 })
    }

    // CRITICAL: Verify payment status with Comgate API
    // Never trust webhook data alone
    const verification = await verifyPayment(transId)

    if (!verification.paid && status === "PAID") {
      console.error("Payment verification failed:", transId)
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Map Comgate status to POS status
    let posStatus: string
    switch (status) {
      case "PAID":
        posStatus = "calling" // Send to kitchen
        break
      case "CANCELLED":
        posStatus = "deleted"
        break
      default:
        // PENDING, AUTHORIZED - don't update yet
        return NextResponse.json({ success: true, action: "no_update" })
    }

    // Update order status in POS
    const updateResult = await posApi.updateOrderStatus(
      registerId,
      orderId,
      posStatus,
      new Date().toISOString()
    )

    console.log(`Order ${orderId} status updated to ${posStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Comgate may send GET for endpoint verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "comgate-webhook" })
}
```

### 5.7 Payment Success Page

```typescript
// src/app/[locale]/reg/[registerId]/payment/success/page.tsx
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
  searchParams: Promise<{ id?: string }>
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: Props) {
  const { locale, registerId } = await params
  const { id: transactionId } = await searchParams
  const t = await getTranslations("order")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />

        <h1 className="text-2xl font-bold mt-4">{t("success")}</h1>

        <p className="text-gray-600 mt-2">
          Vase objednavka byla zaplacena a odeslana do kuchyne.
        </p>

        {transactionId && (
          <div className="mt-6 py-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cislo transakce</p>
            <p className="font-mono text-sm">{transactionId}</p>
          </div>
        )}

        <Link
          href={`/reg/${registerId}`}
          className="mt-6 inline-block bg-gastropay-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Zpet na menu
        </Link>
      </div>
    </main>
  )
}
```

### 5.8 Payment Cancel Page

```typescript
// src/app/[locale]/reg/[registerId]/payment/cancel/page.tsx
import { getTranslations } from "next-intl/server"
import { XCircle } from "lucide-react"
import Link from "next/link"

type Props = {
  params: Promise<{ locale: string; registerId: string }>
}

export default async function PaymentCancelPage({ params }: Props) {
  const { registerId } = await params
  const t = await getTranslations("order")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />

        <h1 className="text-2xl font-bold mt-4">Platba zrusena</h1>

        <p className="text-gray-600 mt-2">
          Platba byla zrusena. Muzete to zkusit znovu.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href={`/reg/${registerId}/order`}
            className="block bg-gastropay-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Zkusit znovu
          </Link>

          <Link
            href={`/reg/${registerId}`}
            className="block text-gray-600 hover:text-gray-800"
          >
            Zpet na menu
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 5.9 Environment Configuration

```bash
# .env.local additions
COMGATE_MERCHANT_ID=12345
COMGATE_SECRET=your-secret-key
COMGATE_TEST_MODE=true
```

## Comgate Portal Setup

1. Register at comgate.cz
2. Get merchant ID and secret from portal
3. Configure IP whitelist (your server IP)
4. Set webhook URL: `https://gastropay.cz/api/webhook/comgate`
5. Test with sandbox mode

## Payment Flow Diagram

```
1. Customer fills email, clicks "Pay"
   ↓
2. API route creates order in POS (status: received)
   ↓
3. API route creates Comgate payment
   ↓
4. Customer redirected to Comgate payment page
   ↓
5. Customer pays (card/bank transfer)
   ↓
6. Comgate webhook → /api/webhook/comgate
   ↓
7. Verify with Comgate API (getStatus)
   ↓
8. Update POS order status → "calling"
   ↓
9. Redirect customer to success page
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── payment/
│   │   │   └── create/
│   │   │       └── route.ts
│   │   └── webhook/
│   │       └── comgate/
│   │           └── route.ts
│   └── [locale]/
│       └── reg/
│           └── [registerId]/
│               └── payment/
│                   ├── page.tsx
│                   ├── success/
│                   │   └── page.tsx
│                   └── cancel/
│                       └── page.tsx
├── components/
│   └── features/
│       └── payment-form.tsx
└── lib/
    └── comgate/
        ├── client.ts
        └── payment.service.ts
```

## Acceptance Criteria

- [ ] Payment page shows order summary and email input
- [ ] Clicking pay redirects to Comgate
- [ ] Successful payment redirects to success page
- [ ] Webhook updates order status in POS
- [ ] Cancelled payment shows cancel page
- [ ] Payment verification with Comgate API works

## Security Notes

- ALWAYS verify payment status with Comgate API
- Never trust webhook data alone
- Configure IP whitelist in Comgate portal
- Store merchant secret in env vars only
- Log all payment events for audit

## Next Phase

[Phase 06: Deployment](./phase-06-deployment.md)
