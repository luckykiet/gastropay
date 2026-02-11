/**
 * POS API Client - Handles all communication with the POS system
 */

import type {
  POSResourcesResponse,
  POSVerifyResponse,
  POSCreateOrderResponse,
  POSOrderStatusResponse,
  POSOrderItem,
} from "@/types/pos"

const POS_API_URL = process.env.POS_API_URL || "https://api.gokasa.cz"
const POS_API_TIMEOUT = parseInt(process.env.POS_API_TIMEOUT || "10000")

class POSApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = "POSApiError"
  }
}

/**
 * Make a request to the POS API with timeout and error handling
 */
async function posRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), POS_API_TIMEOUT)

  try {
    const response = await fetch(`${POS_API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new POSApiError(
        errorData.message || `POS API error: ${response.status}`,
        response.status
      )
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof POSApiError) throw error

    if (error instanceof Error && error.name === "AbortError") {
      throw new POSApiError("POS API request timeout", 408, "TIMEOUT")
    }

    throw new POSApiError(
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export const posApi = {
  /**
   * Verify a register key is valid
   */
  async verify(registerId: string): Promise<POSVerifyResponse> {
    return posRequest<POSVerifyResponse>(
      `/public/gastropay/verify?key=${encodeURIComponent(registerId)}`
    )
  },

  /**
   * Get menu resources (register info, categories, products)
   */
  async getResources(registerId: string): Promise<POSResourcesResponse> {
    return posRequest<POSResourcesResponse>(
      `/public/gastropay/resources?key=${encodeURIComponent(registerId)}`
    )
  },

  /**
   * Create a new order
   */
  async createOrder(params: {
    key: string
    totalPrice: string
    paymentGate: string
    paymentId: string
    tableId?: string
    tableName?: string
    items: POSOrderItem[]
  }): Promise<POSCreateOrderResponse> {
    return posRequest<POSCreateOrderResponse>("/public/gastropay/order", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  /**
   * Update order status (called after payment webhook)
   */
  async updateOrderStatus(
    registerId: string,
    orderId: string,
    status: string,
    paidAt?: string
  ): Promise<POSOrderStatusResponse> {
    return posRequest<POSOrderStatusResponse>("/public/gastropay/order/status", {
      method: "POST",
      body: JSON.stringify({
        key: registerId,
        _id: orderId,
        status,
        paidAt,
      }),
    })
  },

  /**
   * Get order status (for polling)
   */
  async getOrderStatus(
    registerId: string,
    orderId: string
  ): Promise<POSOrderStatusResponse> {
    return posRequest<POSOrderStatusResponse>(
      `/public/gastropay/order?key=${encodeURIComponent(registerId)}&_id=${encodeURIComponent(orderId)}`
    )
  },

  /**
   * Login with POS credentials (for admin)
   */
  async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean
    user?: {
      _id: string
      email: string
      name: string
      role: string
      registerId: string
      companyId: string
    }
    token?: string
    message?: string
  }> {
    return posRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
}

export { POSApiError }
