/**
 * API Client - HTTP client for server API endpoints
 * Migrated from client axios usage pattern
 */

import { CONFIG, API } from "@/config"
import { addSlashAfterUrl } from "./utils"

interface ApiResponse<T = unknown> {
  success: boolean
  msg: T
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = addSlashAfterUrl(baseUrl)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return this.request<T>(endpoint, { method: "GET", headers })
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }
}

// Default API client instance
export const apiClient = new ApiClient(CONFIG.API_URL)

// Restaurant API methods
export const restaurantApi = {
  getAll: async (sortField?: string, sortOrder?: "asc" | "desc") => {
    let endpoint = `${API.RESTAURANT}s`
    if (sortField && sortOrder) {
      endpoint += `?field=${sortField}&orderBy=${sortOrder}`
    }
    return apiClient.get(endpoint)
  },

  search: async (
    query: string,
    sortField?: string,
    sortOrder?: "asc" | "desc"
  ) => {
    let endpoint = `${API.RESTAURANT}s/search?text=${encodeURIComponent(query)}`
    if (sortField && sortOrder) {
      endpoint += `&field=${sortField}&orderBy=${sortOrder}`
    }
    return apiClient.get(endpoint)
  },

  getById: async (id: string) => {
    return apiClient.get(`${API.RESTAURANT}/${id}`)
  },
}

// Transaction API methods
export const transactionApi = {
  create: async (transaction: {
    tips: number
    restaurant: { _id: string }
    orders: Array<{
      ean: string
      name: string
      price: number
      quantity: number
    }>
    paymentGate: string
    email: string
    deliveryMethod: { name: string; id: string }
  }) => {
    return apiClient.post(API.TRANSACTION, transaction)
  },

  getPaymentMethods: async (restaurantId: string) => {
    return apiClient.get(
      `${API.TRANSACTION}/${API.PAYMENT_METHODS}/${restaurantId}`
    )
  },

  getById: async (refId: string) => {
    return apiClient.get(`${API.TRANSACTION}/${refId}`)
  },
}

// Auth API methods
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post(`${API.AUTH}/${API.LOGIN}`, { email, password })
  },

  register: async (data: {
    email: string
    password: string
    name?: string
    ico?: string
  }) => {
    return apiClient.post(`${API.AUTH}/${API.REGISTER}`, data)
  },

  logout: async (token: string) => {
    return apiClient.post(`${API.AUTH}/${API.LOGOUT}`, {}, token)
  },

  verify: async (token: string) => {
    return apiClient.get(`${API.AUTH}/${API.VERIFY}/${token}`)
  },

  checkToken: async (token: string) => {
    return apiClient.get(`${API.AUTH}/${API.CHECK}`, token)
  },

  resetPassword: async (email: string) => {
    return apiClient.post(`${API.AUTH}/${API.RESET_PASSWORD}`, { email })
  },
}

// Merchant API methods
export const merchantApi = {
  getProfile: async (token: string) => {
    return apiClient.get(API.MERCHANT, token)
  },

  updateProfile: async (
    token: string,
    data: {
      name?: string
      email?: string
      ico?: string
    }
  ) => {
    return apiClient.put(API.MERCHANT, data, token)
  },

  getOrders: async (token: string) => {
    return apiClient.get(`${API.MERCHANT}/orders`, token)
  },
}

// Proxy API (for menu fetching)
export const proxyApi = {
  get: async (url: string) => {
    return apiClient.get(`${API.PROXY}/get?url=${encodeURIComponent(url)}`)
  },
}
