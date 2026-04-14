import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth";

const ORDERS_API_URL = "https://homework-api.noevchanmakara.site/api/v1/orders";

function extractPayload(data) {
  return data?.payload ?? data?.data ?? data;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(ORDERS_API_URL, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: "Failed to fetch orders.", detail: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ orders: extractPayload(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch orders.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderDetailRequests = Array.isArray(body?.orderDetailRequests) ? body.orderDetailRequests : [];

    if (orderDetailRequests.length === 0) {
      return NextResponse.json({ message: "No order items provided." }, { status: 400 });
    }

    const response = await fetch(ORDERS_API_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ orderDetailRequests }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: "Failed to create order.", detail: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ order: extractPayload(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create order.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}