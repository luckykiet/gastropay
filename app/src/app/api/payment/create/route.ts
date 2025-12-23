import { NextRequest, NextResponse } from "next/server"
import { posApi } from "@/lib/pos-api/client"
import { createPayment } from "@/lib/comgate/client"

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

    // Verify register is valid
    const verifyResult = await posApi.verify(registerId)
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: "Invalid register" },
        { status: 400 }
      )
    }

    // Create temporary payment ID (will be updated after Comgate returns)
    const tempPaymentId = `pending_${Date.now()}`

    // Create order in POS
    const orderResult = await posApi.createOrder({
      key: registerId,
      totalPrice,
      paymentGate: "comgate",
      paymentId: tempPaymentId,
      tableId: tableId || undefined,
      tableName: tableName || undefined,
      items,
    })

    if (!orderResult.success || !orderResult._id) {
      return NextResponse.json(
        { error: orderResult.message || "Failed to create order" },
        { status: 500 }
      )
    }

    const orderId = orderResult._id

    // Create Comgate payment
    // Reference format: registerId:orderId (used in webhook to identify order)
    const refId = `${registerId}:${orderId}`
    const amount = Math.round(parseFloat(totalPrice) * 100) // Convert to cents

    const payment = await createPayment({
      orderId,
      amount,
      currency: "CZK",
      email,
      label: `Order ${orderId.slice(-6)}`,
      refId,
      lang: locale === "cs" ? "cs" : locale === "vi" ? "en" : "en",
    })

    // TODO: Update order with real Comgate transactionId
    // This requires a POS API endpoint to update paymentId

    return NextResponse.json({
      orderId,
      transactionId: payment.transId,
      redirectUrl: payment.redirect,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
