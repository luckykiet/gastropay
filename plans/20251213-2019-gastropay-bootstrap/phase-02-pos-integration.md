# Phase 02: POS Integration

**Status**: Pending | **Effort**: 6-8 hours | **Priority**: Critical

## Objective

Create API client layer to integrate with existing POS system (project-ops). Define TypeScript types matching POS models. Implement webhook handler for payment callbacks.

## Prerequisites

- Phase 01 completed
- Access to POS API documentation
- Understanding of POS data models

## POS API Endpoints

**Verified from `project-ops/routes/public/gastropay.js`** (no auth required):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/public/gastropay/verify` | Validate register key (ObjectId) |
| GET | `/public/gastropay/resources?key={registerId}` | Fetch menu, tables, articles, mods |
| POST | `/public/gastropay/order` | Submit order (returns `{_id, status}`) |
| GET | `/public/gastropay/order?key={registerId}&_id={orderId}` | Check order status |
| POST | `/public/gastropay/order/status` | Update order status (webhook callback) |

**Internal POS routes** (`/api/gastropay/*` - authenticated, not for GastroPay frontend):
- `GET /api/gastropay/orders` - List received orders for POS display
- `POST /api/gastropay/orderpending` - Mark order as pending in POS

## Tasks

### 2.1 POS TypeScript Types

**Verified from actual POS codebase** (`project-ops/routes/public/gastropay.js`):

```typescript
// src/types/pos.ts

// === API Response wrapper ===
export interface POSApiResponse<T> {
  success: boolean
  msg: T | string  // T on success, error string on failure
}

// === /public/gastropay/resources response ===
export interface POSResourcesData {
  business: {
    name: string
    currency: string
  }
  tables: POSTable[]
  sections: POSSection[]
  articles: Record<string, POSArticle>  // keyed by EAN
  groups: Record<string, POSGroup>
  mods: Record<string, POSMod>          // saleItemMods
  surcharges: Record<string, POSSurcharge>  // saleItemSurcharges
}

export interface POSTable {
  _id: string
  table_name: string
  table_desc?: string
  bg?: string  // background color hex
  gastropay: boolean
}

export interface POSSection {
  name: string
  items: POSSectionItem[]
}

export interface POSSectionItem {
  ean: string
  image: string  // full URL or empty
  backgroundColor?: string
}

export interface POSArticle {
  name: string
  name2?: string
  price: number
  tax: number  // tax percentage (10, 15, 21)
  group?: string
  mods?: string[]  // array of mod codes ["A", "B"]
}

export interface POSGroup {
  name: string
  printer?: string
}

export interface POSMod {
  name: string
  price: number
}

export interface POSSurcharge {
  name: string
  price: number
}

// === /public/gastropay/order request ===
export interface POSOrderRequest {
  key: string           // registerId (ObjectId)
  totalPrice: string    // decimal string "123.45" (max 10 digits, 2 decimals)
  paymentGate: "comgate" | "csob"
  paymentId: string     // max 64 chars, unique per gate
  tableId?: string      // ObjectId or empty
  tableName?: string    // max 32 chars
  items: string         // JSON stringified POSOrderItem[]
}

export interface POSOrderItem {
  ean: string           // EAN code
  price: string         // decimal string
  quantity: number      // integer
  note?: string         // max 256 chars
  mods?: string         // "A,B,C" format or empty
}

// === /public/gastropay/order response ===
export interface POSOrderData {
  _id: string
  status: "received" | "pending" | "calling" | "recalling" | "finished" | "deleted"
  orderNumber?: number
  callingNumber?: string
  callingDate?: Date
  date?: Date
}

// === /public/gastropay/order/status request ===
export interface POSOrderStatusRequest {
  key: string           // registerId
  orderId: string       // order _id
  status: "calling" | "recalling" | "deleted" | "finished"
  callingDate?: string  // ISO datetime
}

// === /public/gastropay/verify response ===
// Returns { success: true, msg: "srv_valid_key" } on success
// Returns { success: false, msg: "srv_invalid_key" } on failure
```

### 2.2 POS API Client

**Updated to match actual POS API structure:**

```typescript
// src/lib/pos-api/client.ts
import type {
  POSApiResponse,
  POSResourcesData,
  POSOrderRequest,
  POSOrderData,
  POSOrderStatusRequest,
} from "@/types/pos"

const POS_API_URL = process.env.POS_API_URL || "https://api.gokasa.cz"
const POS_TIMEOUT = parseInt(process.env.POS_API_TIMEOUT || "10000")

export class POSApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = "POSApiError"
  }
}

async function fetchPOS<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<POSApiResponse<T>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), POS_TIMEOUT)

  try {
    const response = await fetch(`${POS_API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const data = await response.json() as POSApiResponse<T>

    if (!response.ok || !data.success) {
      throw new POSApiError(
        typeof data.msg === "string" ? data.msg : "POS API error",
        response.status
      )
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

export const posApi = {
  // Verify register key
  async verify(key: string): Promise<boolean> {
    const res = await fetchPOS<string>("/public/gastropay/verify", {
      method: "POST",
      body: JSON.stringify({ key }),
    })
    return res.success
  },

  // Fetch menu, tables, articles
  async getResources(key: string): Promise<POSResourcesData> {
    const params = new URLSearchParams({ key })
    const res = await fetchPOS<POSResourcesData>(
      `/public/gastropay/resources?${params}`
    )
    return res.msg as POSResourcesData
  },

  // Submit order - NOTE: items must be JSON stringified!
  async createOrder(order: Omit<POSOrderRequest, "items"> & { items: object[] }): Promise<POSOrderData> {
    const res = await fetchPOS<POSOrderData>("/public/gastropay/order", {
      method: "POST",
      body: JSON.stringify({
        ...order,
        items: JSON.stringify(order.items),  // POS expects stringified JSON
      }),
    })
    return res.msg as POSOrderData
  },

  // Poll order status
  async getOrderStatus(key: string, orderId: string): Promise<POSOrderData> {
    const params = new URLSearchParams({ key, _id: orderId })
    const res = await fetchPOS<POSOrderData>(
      `/public/gastropay/order?${params}`
    )
    return res.msg as POSOrderData
  },

  // Update order status (called by webhook)
  async updateOrderStatus(data: POSOrderStatusRequest): Promise<boolean> {
    const res = await fetchPOS<null>("/public/gastropay/order/status", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return res.success
  },
}
```

### 2.3 Resource Fetching Hooks

```typescript
// src/lib/pos-api/hooks.ts
import { cache } from "react"
import { posApi } from "./client"

// Cache resources for 1 hour (ISR compatible)
export const getResources = cache(async (registerId: string) => {
  try {
    const resources = await posApi.getResources(registerId)
    return { data: resources, error: null }
  } catch (error) {
    console.error("Failed to fetch resources:", error)
    return { data: null, error: "Failed to load menu" }
  }
})

// Verify register (no cache, always fresh)
export async function verifyRegister(registerId: string) {
  try {
    const result = await posApi.verify(registerId)
    return result
  } catch (error) {
    console.error("Failed to verify register:", error)
    return { success: false, error: "Invalid register" }
  }
}
```

### 2.4 Subdomain Extraction Middleware

```typescript
// src/lib/subdomain.ts
import { headers } from "next/headers"

export async function getSubdomain(): Promise<string | null> {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  // localhost:3000 -> null
  // restaurant.gastropay.cz -> restaurant
  // gastropay.cz -> null (landing page)

  const parts = host.split(".")

  // Development: localhost
  if (host.includes("localhost")) {
    // Use query param or cookie for dev
    return null
  }

  // Production: subdomain.gastropay.cz
  if (parts.length >= 3) {
    const subdomain = parts[0]
    // Reserved subdomains
    const reserved = ["www", "api", "admin", "app"]
    if (reserved.includes(subdomain)) return null
    return subdomain
  }

  return null
}

export async function getRegisterFromPath(
  registerId: string
): Promise<string> {
  // Validate ObjectId format
  if (!/^[a-f\d]{24}$/i.test(registerId)) {
    throw new Error("Invalid register ID")
  }
  return registerId
}
```

### 2.5 Comgate Webhook Handler

```typescript
// src/app/api/webhook/comgate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { posApi } from "@/lib/pos-api/client"

// Comgate webhook payload
interface ComgateWebhook {
  transactionId: string
  status: "PAID" | "DENIED" | "CANCELLED"
  price: number
  refId: string // our order reference: registerId:orderId
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ComgateWebhook

    // Parse refId (format: registerId:orderId)
    const [registerId, orderId] = body.refId.split(":")

    if (!registerId || !orderId) {
      console.error("Invalid refId format:", body.refId)
      return NextResponse.json({ error: "Invalid refId" }, { status: 400 })
    }

    // Map Comgate status to POS status
    let posStatus: string
    switch (body.status) {
      case "PAID":
        posStatus = "calling" // Trigger kitchen display
        break
      case "DENIED":
      case "CANCELLED":
        posStatus = "deleted"
        break
      default:
        posStatus = "received"
    }

    // Update order in POS
    await posApi.updateOrderStatus(
      registerId,
      orderId,
      posStatus,
      new Date().toISOString()
    )

    console.log(`Webhook processed: ${body.transactionId} -> ${posStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Comgate may send GET for verification
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
```

### 2.6 Winston Logger Configuration

```typescript
// src/lib/logger.ts
import winston from "winston"

const { combine, timestamp, json, errors, colorize, simple } = winston.format

const isProduction = process.env.NODE_ENV === "production"

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json()
  ),
  defaultMeta: { service: "gastropay" },
  transports: [
    // Console transport (dev: colorized, prod: json)
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), simple()),
    }),
    // File transport for errors (production only)
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
})

// Child loggers for different modules
export const posLogger = logger.child({ module: "pos-api" })
export const webhookLogger = logger.child({ module: "webhook" })
export const orderLogger = logger.child({ module: "order" })
```

### 2.7 Environment Schema Validation

```typescript
// src/lib/env.ts
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  POS_API_URL: z.string().url().default("https://api.gokasa.cz"),
  POS_API_TIMEOUT: z.string().default("10000"),
  COMGATE_MERCHANT_ID: z.string().min(1),
  COMGATE_SECRET: z.string().min(1),
  COMGATE_TEST_MODE: z.string().default("true"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

## File Structure

```
src/
├── lib/
│   ├── pos-api/
│   │   ├── client.ts       # API client (uses posLogger)
│   │   ├── hooks.ts        # React cache wrappers
│   │   └── index.ts        # Exports
│   ├── logger.ts           # Winston logger config
│   ├── subdomain.ts        # Subdomain extraction
│   └── env.ts              # Environment validation
├── types/
│   └── pos.ts              # POS API types
└── app/
    └── api/
        └── webhook/
            └── comgate/
                └── route.ts # Payment webhook (uses webhookLogger)
logs/                        # Production log files (gitignored)
├── error.log
└── combined.log
```

## Dependencies

```bash
pnpm add winston
```

## Acceptance Criteria

- [ ] TypeScript types match POS API structure
- [ ] API client handles timeouts and errors
- [ ] `getResources()` returns menu data
- [ ] `createOrder()` submits to POS
- [ ] Webhook updates order status correctly
- [ ] Subdomain extraction works in dev/prod

## Testing

```typescript
// Manual test in dev
const resources = await posApi.getResources("YOUR_TEST_REGISTER_ID")
console.log(resources.quickSales) // Should show menu sections
```

## Security Notes

- Webhook endpoint should validate Comgate IP (whitelist)
- Register keys are public but rate-limited by POS
- Never expose COMGATE_SECRET client-side

## Next Phase

[Phase 03: Frontend Core](./phase-03-frontend-core.md)
