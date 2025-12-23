import { NextRequest, NextResponse } from "next/server"
import { getPaymentStatus } from "@/lib/comgate/client"
import { posApi } from "@/lib/pos-api/client"

/**
 * Comgate Webhook Handler
 *
 * Comgate sends POST requests when payment status changes.
 * CRITICAL: Always verify payment status with Comgate API, never trust webhook data alone.
 */

// Store processed transactions to ensure idempotency
const processedTransactions = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    // Parse webhook body (URL-encoded)
    const formData = await request.formData()
    const transId = formData.get("transId")?.toString()
    const status = formData.get("status")?.toString()
    const refId = formData.get("refId")?.toString()

    console.log("Comgate webhook received:", { transId, status, refId })

    if (!transId || !refId) {
      console.error("Missing transId or refId in webhook")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Idempotency check - prevent duplicate processing
    const idempotencyKey = `${transId}:${status}`
    if (processedTransactions.has(idempotencyKey)) {
      console.log("Duplicate webhook ignored:", idempotencyKey)
      return NextResponse.json({ success: true, action: "duplicate_ignored" })
    }

    // Parse refId to get registerId and orderId
    const [registerId, orderId] = refId.split(":")

    if (!registerId || !orderId) {
      console.error("Invalid refId format:", refId)
      return NextResponse.json({ error: "Invalid refId" }, { status: 400 })
    }

    // CRITICAL: Verify payment status with Comgate API
    // Never trust webhook data alone for security
    const verification = await getPaymentStatus(transId)

    console.log("Comgate verification:", verification)

    // Check if verification matches webhook status
    if (verification.status !== status) {
      console.warn("Status mismatch:", { webhook: status, verified: verification.status })
    }

    // Map Comgate status to POS status
    let posStatus: string
    let paidAt: string | undefined

    switch (verification.status) {
      case "PAID":
        posStatus = "calling" // Send to kitchen
        paidAt = new Date().toISOString()
        break
      case "CANCELLED":
        posStatus = "cancelled"
        break
      case "PENDING":
      case "AUTHORIZED":
        // Don't update yet - payment not complete
        return NextResponse.json({ success: true, action: "no_update" })
      default:
        console.warn("Unknown status:", verification.status)
        return NextResponse.json({ success: true, action: "unknown_status" })
    }

    // Update order status in POS
    const updateResult = await posApi.updateOrderStatus(
      registerId,
      orderId,
      posStatus,
      paidAt
    )

    console.log(`Order ${orderId} status updated to ${posStatus}:`, updateResult)

    // Mark as processed for idempotency
    processedTransactions.add(idempotencyKey)

    // Clean up old entries (keep last 1000)
    if (processedTransactions.size > 1000) {
      const entries = Array.from(processedTransactions)
      entries.slice(0, 500).forEach((key) => processedTransactions.delete(key))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    // Return 200 to prevent Comgate from retrying (we'll handle errors internally)
    return NextResponse.json({ error: "Processing failed" }, { status: 200 })
  }
}

// Comgate may send GET for endpoint verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "comgate-webhook" })
}
