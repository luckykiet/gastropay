/**
 * Comgate Payment Client
 * Handles payment creation and verification with Comgate gateway
 */

const COMGATE_API_URL = "https://payments.comgate.cz/v1.0"
const COMGATE_MERCHANT_ID = process.env.COMGATE_MERCHANT_ID || ""
const COMGATE_SECRET = process.env.COMGATE_SECRET || ""
const COMGATE_TEST_MODE = process.env.COMGATE_TEST_MODE === "true"

export interface CreatePaymentParams {
  orderId: string
  amount: number // in cents/hellers
  currency: string
  email: string
  label: string
  refId: string
  lang?: string
}

export interface CreatePaymentResult {
  transId: string
  redirect: string
}

export interface PaymentStatus {
  transId: string
  status: "PENDING" | "PAID" | "CANCELLED" | "AUTHORIZED"
  price: number
  curr: string
  refId: string
  payerEmail?: string
  fee?: number
}

class ComgateError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ComgateError"
  }
}

/**
 * Create a new payment in Comgate
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gastropay.cz"

  const formData = new URLSearchParams({
    merchant: COMGATE_MERCHANT_ID,
    secret: COMGATE_SECRET,
    test: COMGATE_TEST_MODE ? "true" : "false",
    country: "CZ",
    price: params.amount.toString(),
    curr: params.currency,
    label: params.label,
    refId: params.refId,
    email: params.email,
    lang: params.lang || "cs",
    method: "ALL",
    prepareOnly: "false",
    // Callback URLs
    url_ok: `${appUrl}/reg/${params.refId.split(":")[0]}/payment/success`,
    url_cancel: `${appUrl}/reg/${params.refId.split(":")[0]}/payment/cancel`,
    url_pending: `${appUrl}/reg/${params.refId.split(":")[0]}/payment/success`,
  })

  try {
    const response = await fetch(`${COMGATE_API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    const text = await response.text()
    const result = parseComgateResponse(text)

    if (result.code !== "0") {
      throw new ComgateError(result.message || "Payment creation failed", result.code)
    }

    return {
      transId: result.transId!,
      redirect: result.redirect!,
    }
  } catch (error) {
    if (error instanceof ComgateError) throw error
    throw new ComgateError(
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Get payment status from Comgate
 */
export async function getPaymentStatus(transId: string): Promise<PaymentStatus> {
  const formData = new URLSearchParams({
    merchant: COMGATE_MERCHANT_ID,
    secret: COMGATE_SECRET,
    transId,
  })

  try {
    const response = await fetch(`${COMGATE_API_URL}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    const text = await response.text()
    const result = parseComgateResponse(text)

    if (result.code !== "0") {
      throw new ComgateError(result.message || "Status check failed", result.code)
    }

    return {
      transId: result.transId!,
      status: result.status as PaymentStatus["status"],
      price: parseInt(result.price || "0"),
      curr: result.curr || "CZK",
      refId: result.refId || "",
      payerEmail: result.payerEmail,
      fee: result.fee ? parseInt(result.fee) : undefined,
    }
  } catch (error) {
    if (error instanceof ComgateError) throw error
    throw new ComgateError(
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Parse Comgate's URL-encoded response
 */
function parseComgateResponse(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const params = new URLSearchParams(text)

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

export { ComgateError }
