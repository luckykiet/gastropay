# Phase 07: Admin Features

**Status**: Pending | **Effort**: 10-14 hours | **Priority**: High

## Objective

Build admin dashboard for GastroPay management. **POS connection mandatory** - all authentication via POS system. Read-only access to POS data, full control over GastroPay-specific settings.

## Prerequisites

- Phase 01-05 completed
- POS API auth endpoint available (`/auth/login`)
- MongoDB for GastroPay settings storage

## Architecture

```
/admin                    → Dashboard (protected, POS auth required)
/admin/login              → Login page (POS credentials)
/admin/restaurants        → Restaurant list (from POS)
/admin/restaurants/[id]   → GastroPay settings for register
/admin/orders             → Order history (from POS)
```

**Note**: No `/admin/users` - user management is done in POS system.

## Authentication Design

### POS-Only Auth (Mandatory)

All admin authentication goes through POS system. No local-only admins.

```typescript
// POS-authenticated users only
type AdminUser = {
  id: string
  email: string
  name: string
  role: "owner" | "manager" | "staff"  // Mapped from POS roles
  posUserId: string                     // POS user ID
  posRegisterId: string                 // Associated register
  companyId: string                     // POS company ID
  permissions: Permission[]
}

type Permission =
  | "restaurants:read"
  | "restaurants:write"
  | "orders:read"
  | "orders:write"
  | "settings:read"
  | "settings:write"
```

### Role Permissions (Mapped from POS)

| POS Role | GastroPay Role | Permissions |
|----------|----------------|-------------|
| Owner/Dealer | `owner` | All permissions for their registers |
| Manager | `manager` | restaurants:*, orders:*, settings:read |
| Staff | `staff` | orders:read only |

## Tasks

### 7.1 Database Schema (MongoDB)

```typescript
// models/AdminSession.ts - Cache POS user sessions locally
import { Schema, model, models } from "mongoose"

const AdminSessionSchema = new Schema({
  posUserId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "manager", "staff"],
    required: true
  },
  posRegisterId: { type: String, required: true },
  companyId: { type: String, required: true },
  // Cache POS permissions locally for faster access
  permissions: [{ type: String }],
  lastLogin: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
})

AdminSessionSchema.index({ posUserId: 1 })
AdminSessionSchema.index({ companyId: 1, posRegisterId: 1 })

export const AdminSession = models.AdminSession || model("AdminSession", AdminSessionSchema)
```

```typescript
// models/GastropaySettings.ts
import { Schema, model, models } from "mongoose"

const GastropaySettingsSchema = new Schema({
  registerId: { type: String, required: true, unique: true }, // POS register ID
  enabled: { type: Boolean, default: false },

  // Branding
  branding: {
    primaryColor: { type: String, default: "#22c55e" },
    logo: { type: String }, // URL
    bannerImage: { type: String },
  },

  // Features
  features: {
    liveTableEnabled: { type: Boolean, default: true },
    multipleOrdersPerSession: { type: Boolean, default: true },
    requireEmail: { type: Boolean, default: true },
    showTableSelection: { type: Boolean, default: true },
  },

  // Payment config
  payment: {
    comgateMerchantId: { type: String },
    comgateSecret: { type: String },
    testMode: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 0 },
  },

  // Display
  display: {
    defaultLocale: { type: String, default: "cs" },
    enabledLocales: [{ type: String }],
    menuLayout: { type: String, enum: ["grid", "list"], default: "grid" },
  },

  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String }, // Admin user ID
})

export const GastropaySettings = models.GastropaySettings || model("GastropaySettings", GastropaySettingsSchema)
```

### 7.2 Auth Service (POS-Only)

```typescript
// src/lib/admin/auth.service.ts
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { AdminSession as AdminSessionModel } from "@/models/AdminSession"
import { posApi } from "@/lib/pos-api/client"
import { adminLogger } from "@/lib/logger"

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
const COOKIE_NAME = "gastropay_admin_session"

export interface AdminSession {
  posUserId: string
  email: string
  name: string
  role: "owner" | "manager" | "staff"
  posRegisterId: string
  companyId: string
  permissions: string[]
}

// Map POS role to permissions
function mapPosRoleToPermissions(posRole: string): string[] {
  const roleMap: Record<string, string[]> = {
    owner: ["restaurants:read", "restaurants:write", "orders:read", "orders:write", "settings:read", "settings:write"],
    dealer: ["restaurants:read", "restaurants:write", "orders:read", "orders:write", "settings:read", "settings:write"],
    manager: ["restaurants:read", "restaurants:write", "orders:read", "orders:write", "settings:read"],
    staff: ["orders:read"],
  }
  return roleMap[posRole.toLowerCase()] || ["orders:read"]
}

// Map POS role string to our role type
function mapPosRole(posRole: string): "owner" | "manager" | "staff" {
  const role = posRole.toLowerCase()
  if (role === "owner" || role === "dealer") return "owner"
  if (role === "manager") return "manager"
  return "staff"
}

// Single login method - POS only via /auth/login
export async function login(email: string, password: string): Promise<AdminSession | null> {
  try {
    // Authenticate with POS /auth/login
    const posAuth = await posApi.login(email, password)
    if (!posAuth.success) {
      adminLogger.warn("POS login failed", { email })
      return null
    }

    const role = mapPosRole(posAuth.user.role)
    const permissions = mapPosRoleToPermissions(posAuth.user.role)

    // Cache session locally
    await AdminSessionModel.findOneAndUpdate(
      { posUserId: posAuth.user._id },
      {
        posUserId: posAuth.user._id,
        email: posAuth.user.email,
        name: posAuth.user.name,
        role,
        posRegisterId: posAuth.user.registerId,
        companyId: posAuth.user.companyId,
        permissions,
        lastLogin: new Date(),
        lastActivity: new Date(),
      },
      { upsert: true, new: true }
    )

    adminLogger.info("POS user login successful", {
      posUserId: posAuth.user._id,
      email,
      role,
    })

    return createSession({
      posUserId: posAuth.user._id,
      email: posAuth.user.email,
      name: posAuth.user.name,
      role,
      posRegisterId: posAuth.user.registerId,
      companyId: posAuth.user.companyId,
      permissions,
    })
  } catch (error) {
    adminLogger.error("POS login error", { email, error })
    return null
  }
}

async function createSession(data: AdminSession): Promise<AdminSession> {
  const token = await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")  // Shorter session for security
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  })

  return data
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function hasPermission(session: AdminSession, permission: string): boolean {
  return session.permissions.includes(permission)
}

// Check if user can access specific register
export function canAccessRegister(session: AdminSession, registerId: string): boolean {
  // Owners can access all registers in their company (handled by POS API filtering)
  // For now, check direct register match
  return session.posRegisterId === registerId || session.role === "owner"
}
```

### 7.3 Auth Middleware

```typescript
// src/lib/admin/middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "./auth.service"

export async function adminAuthMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public admin routes
  if (pathname === "/admin/login") {
    const session = await getSession()
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.next()
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    const session = await getSession()
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}
```

### 7.4 Admin Login Page

```typescript
// src/app/admin/login/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/admin/auth.service"
import { AdminLoginForm } from "@/components/admin/login-form"

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) {
    redirect("/admin")
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">GastroPay Admin</h1>
          <p className="text-gray-500 mt-2">Sign in with your POS account</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  )
}
```

```typescript
// src/components/admin/login-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gastropay-green focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gastropay-green focus:border-transparent"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gastropay-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Use your POS account credentials to sign in
      </p>
    </form>
  )
}
```

### 7.5 Admin Dashboard

```typescript
// src/app/admin/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/admin/auth.service"
import { AdminDashboard } from "@/components/admin/dashboard"
import { getAdminStats } from "@/lib/admin/stats.service"

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect("/admin/login")

  const stats = await getAdminStats(session)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <AdminDashboard stats={stats} session={session} />
    </div>
  )
}
```

```typescript
// src/components/admin/dashboard.tsx
"use client"

import { Store, ShoppingCart, CreditCard, TrendingUp } from "lucide-react"
import type { AdminSession } from "@/lib/admin/auth.service"

type Props = {
  stats: {
    totalRestaurants: number
    activeRestaurants: number
    todayOrders: number
    todayRevenue: number
    weeklyGrowth: number
  }
  session: AdminSession
}

export function AdminDashboard({ stats, session }: Props) {
  const cards = [
    {
      title: "Restaurants",
      value: stats.activeRestaurants,
      subtitle: `${stats.totalRestaurants} total`,
      icon: Store,
      color: "bg-blue-500",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      subtitle: "orders placed",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Today's Revenue",
      value: `${stats.todayRevenue.toLocaleString()} CZK`,
      subtitle: "total sales",
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      title: "Weekly Growth",
      value: `${stats.weeklyGrowth > 0 ? "+" : ""}${stats.weeklyGrowth}%`,
      subtitle: "vs last week",
      icon: TrendingUp,
      color: stats.weeklyGrowth >= 0 ? "bg-emerald-500" : "bg-red-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium">
          Welcome back, {session.name}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {session.role === "dealer"
            ? "Viewing your restaurant data"
            : "Here's what's happening with GastroPay"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-medium">Recent Orders</h3>
        </div>
        <div className="p-4">
          {/* Order list component here */}
          <p className="text-gray-500 text-sm">Loading orders...</p>
        </div>
      </div>
    </div>
  )
}
```

### 7.6 Restaurant Management

```typescript
// src/app/admin/restaurants/page.tsx
import { redirect } from "next/navigation"
import { getSession, hasPermission } from "@/lib/admin/auth.service"
import { getRestaurants } from "@/lib/admin/restaurant.service"
import { RestaurantList } from "@/components/admin/restaurant-list"

export default async function RestaurantsPage() {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  if (!hasPermission(session, "restaurants:read")) {
    redirect("/admin")
  }

  const restaurants = await getRestaurants(session)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
      </div>
      <RestaurantList restaurants={restaurants} session={session} />
    </div>
  )
}
```

```typescript
// src/app/admin/restaurants/[id]/page.tsx
import { redirect, notFound } from "next/navigation"
import { getSession, hasPermission } from "@/lib/admin/auth.service"
import { getRestaurantById, getGastropaySettings } from "@/lib/admin/restaurant.service"
import { RestaurantSettings } from "@/components/admin/restaurant-settings"

type Props = {
  params: Promise<{ id: string }>
}

export default async function RestaurantSettingsPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect("/admin/login")

  // Dealers can only view their own restaurant
  if (session.role === "dealer" && session.posRegisterId !== id) {
    redirect("/admin")
  }

  const restaurant = await getRestaurantById(id)
  if (!restaurant) notFound()

  const settings = await getGastropaySettings(id)
  const canEdit = hasPermission(session, "settings:write")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{restaurant.name}</h1>
      <RestaurantSettings
        restaurant={restaurant}
        settings={settings}
        canEdit={canEdit}
      />
    </div>
  )
}
```

### 7.7 GastroPay Settings Form

```typescript
// src/components/admin/restaurant-settings.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, Palette, CreditCard, Globe } from "lucide-react"
import type { GastropaySettings } from "@/models/GastropaySettings"

type Props = {
  restaurant: {
    _id: string
    name: string
    currency: string
  }
  settings: GastropaySettings | null
  canEdit: boolean
}

export function RestaurantSettings({ restaurant, settings, canEdit }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "payment" | "display">("general")

  const [formData, setFormData] = useState({
    enabled: settings?.enabled ?? false,
    // Branding
    primaryColor: settings?.branding?.primaryColor ?? "#22c55e",
    logo: settings?.branding?.logo ?? "",
    bannerImage: settings?.branding?.bannerImage ?? "",
    // Features
    liveTableEnabled: settings?.features?.liveTableEnabled ?? true,
    multipleOrdersPerSession: settings?.features?.multipleOrdersPerSession ?? true,
    requireEmail: settings?.features?.requireEmail ?? true,
    showTableSelection: settings?.features?.showTableSelection ?? true,
    // Payment
    comgateMerchantId: settings?.payment?.comgateMerchantId ?? "",
    comgateSecret: settings?.payment?.comgateSecret ?? "",
    testMode: settings?.payment?.testMode ?? true,
    minOrderAmount: settings?.payment?.minOrderAmount ?? 0,
    // Display
    defaultLocale: settings?.display?.defaultLocale ?? "cs",
    enabledLocales: settings?.display?.enabledLocales ?? ["cs"],
    menuLayout: settings?.display?.menuLayout ?? "grid",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await fetch(`/api/admin/restaurants/${restaurant._id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Eye },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "display", label: "Display", icon: Globe },
  ]

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">GastroPay Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formData.enabled ? "Customers can order online" : "Online ordering disabled"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gastropay-green"></div>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-gastropay-green text-gastropay-green"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Live Table Sessions</p>
                  <p className="text-sm text-gray-500">Allow multiple orders per table visit</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.liveTableEnabled}
                  onChange={(e) => setFormData({ ...formData, liveTableEnabled: e.target.checked })}
                  disabled={!canEdit}
                  className="w-5 h-5 text-gastropay-green rounded"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Require Email</p>
                  <p className="text-sm text-gray-500">Customers must enter email for orders</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requireEmail}
                  onChange={(e) => setFormData({ ...formData, requireEmail: e.target.checked })}
                  disabled={!canEdit}
                  className="w-5 h-5 text-gastropay-green rounded"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Table Selection</p>
                  <p className="text-sm text-gray-500">Show table picker before ordering</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showTableSelection}
                  onChange={(e) => setFormData({ ...formData, showTableSelection: e.target.checked })}
                  disabled={!canEdit}
                  className="w-5 h-5 text-gastropay-green rounded"
                />
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === "branding" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    disabled={!canEdit}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    disabled={!canEdit}
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comgate Merchant ID
                </label>
                <input
                  type="text"
                  value={formData.comgateMerchantId}
                  onChange={(e) => setFormData({ ...formData, comgateMerchantId: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comgate Secret
                </label>
                <input
                  type="password"
                  value={formData.comgateSecret}
                  onChange={(e) => setFormData({ ...formData, comgateSecret: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="font-medium">Test Mode</p>
                  <p className="text-sm text-gray-500">Use Comgate sandbox</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.testMode}
                  onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
                  disabled={!canEdit}
                  className="w-5 h-5 text-gastropay-green rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Amount (CZK)
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === "display" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Language
                </label>
                <select
                  value={formData.defaultLocale}
                  onChange={(e) => setFormData({ ...formData, defaultLocale: e.target.value })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="cs">Czech</option>
                  <option value="en">English</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Layout
                </label>
                <select
                  value={formData.menuLayout}
                  onChange={(e) => setFormData({ ...formData, menuLayout: e.target.value as "grid" | "list" })}
                  disabled={!canEdit}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gastropay-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isLoading ? "Saving..." : "Save Settings"}
        </button>
      )}
    </div>
  )
}
```

### 7.8 Admin Layout

```typescript
// src/app/admin/layout.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/admin/auth.service"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Login page doesn't need layout
  // This is handled in individual pages

  return (
    <div className="min-h-screen bg-gray-100">
      {session ? (
        <div className="flex">
          <AdminSidebar session={session} />
          <div className="flex-1 ml-64">
            <AdminHeader session={session} />
            <main className="pt-16">{children}</main>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
```

```typescript
// src/components/admin/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Settings,
  LogOut
} from "lucide-react"
import type { AdminSession } from "@/lib/admin/auth.service"

type Props = {
  session: AdminSession
}

const roleLabels = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
}

export function AdminSidebar({ session }: Props) {
  const pathname = usePathname()

  // Navigation based on permissions
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ...(session.permissions.includes("restaurants:read")
      ? [{ name: "Restaurants", href: "/admin/restaurants", icon: Store }]
      : []
    ),
    ...(session.permissions.includes("orders:read")
      ? [{ name: "Orders", href: "/admin/orders", icon: ShoppingCart }]
      : []
    ),
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-gastropay-green">GastroPay</span>
        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-gastropay-light text-gastropay-green"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gastropay-green text-white flex items-center justify-center font-medium">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {roleLabels[session.role]} • POS
            </p>
          </div>
        </div>
        <form action="/api/admin/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
```

## File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin layout with sidebar
│       ├── page.tsx                # Dashboard
│       ├── login/
│       │   └── page.tsx            # Login page (POS auth)
│       ├── restaurants/
│       │   ├── page.tsx            # Restaurant list
│       │   └── [id]/
│       │       └── page.tsx        # Restaurant settings
│       └── orders/
│           └── page.tsx            # Order history
├── components/
│   └── admin/
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── login-form.tsx
│       ├── dashboard.tsx
│       ├── restaurant-list.tsx
│       └── restaurant-settings.tsx
├── lib/
│   └── admin/
│       ├── auth.service.ts         # POS auth logic
│       ├── middleware.ts           # Route protection
│       ├── restaurant.service.ts   # Restaurant data (via POS API)
│       └── stats.service.ts        # Dashboard stats
└── models/
    ├── AdminSession.ts             # Cached POS session
    └── GastropaySettings.ts        # Per-restaurant settings
```

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/auth/login` | Login via POS |
| POST | `/api/admin/auth/logout` | Logout |
| GET | `/api/admin/restaurants` | List restaurants (from POS) |
| GET | `/api/admin/restaurants/[id]` | Get restaurant (from POS) |
| GET | `/api/admin/restaurants/[id]/settings` | Get GastroPay settings |
| PUT | `/api/admin/restaurants/[id]/settings` | Update GastroPay settings |
| GET | `/api/admin/orders` | List orders (from POS) |

## POS API Integration

Admin features require these POS endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Authenticate user, returns user info + token |
| GET | `/api/registers` | List user's registers (authenticated) |
| GET | `/api/gastropay/orders` | List orders for register (authenticated) |

## Environment Variables

```bash
# Admin auth
ADMIN_JWT_SECRET=your-super-secret-jwt-key

# MongoDB for GastroPay settings only
MONGODB_URI=mongodb://localhost:27017/gastropay

# POS API (mandatory)
POS_API_URL=https://api.gokasa.cz
```

## Acceptance Criteria

- [ ] Users login with POS credentials only
- [ ] Dashboard shows stats (scoped by role/register)
- [ ] Owners see all their registers
- [ ] Managers see assigned register only
- [ ] Staff see orders only
- [ ] GastroPay settings editable by owner/manager
- [ ] Session expires after 8 hours
- [ ] Winston logs all auth events
- [ ] POS connection required for all admin operations

## Dependencies

```bash
pnpm add mongoose jose
```

## Security Notes

- No local passwords - all auth via POS
- JWT in httpOnly cookie (8h expiry)
- CSRF protection via SameSite=lax
- All auth validated against POS API
- Sensitive fields (comgateSecret) never returned in API responses
- Admin actions logged with POS user ID

## Next Phase

Phase 08 would be deployment and monitoring setup.
