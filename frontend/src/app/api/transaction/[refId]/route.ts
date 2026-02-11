import { NextRequest, NextResponse } from "next/server"
import { CONFIG, API } from "@/config"
import { addSlashAfterUrl } from "@/lib/utils"

type Props = {
  params: Promise<{ refId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { refId } = await params

    // Proxy to the server API
    const response = await fetch(
      `${addSlashAfterUrl(CONFIG.API_URL)}${API.TRANSACTION}/${refId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Transaction fetch error:", error)
    return NextResponse.json(
      { success: false, msg: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}
